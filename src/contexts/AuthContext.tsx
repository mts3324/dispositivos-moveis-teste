import React, { createContext, useState, ReactNode, useContext, useEffect } from "react";
import { Alert, Platform } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import ApiService from "../services/ApiService";
import UserService from "../services/UserService";
import DatabaseService from "../services/DatabaseService";
import { RootStackParamList } from "../navigation/AppNavigator";

interface User {
  id: string;
  name: string;
  email: string;
  handle?: string;
  collegeId?: string | null;
  level: number;
  xpTotal: number;
  avatarUrl?: string | null;
  bio?: string | null;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, handle: string, collegeId?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const USER_ID_KEY = "@app:user_id";
const BIOMETRIC_TOKEN_KEY = "app_biometric_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    initializeAuth();
  }, []);

  async function initializeAuth() {
    try {
      await DatabaseService.initDatabase();

      // SecureStore não funciona na web, então verificamos a plataforma
      if (Platform.OS !== 'web') {
        try {
          const biometricToken = await SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY);
          if (biometricToken) {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();

            if (hasHardware && enrolled) {
              const result = await LocalAuthentication.authenticateAsync({
                promptMessage: "Autentique-se para continuar",
              });

              if (result.success) {
                try {
                  const userData = await ApiService.getMe();
                  setUser(userData);
                  setLoading(false);
                  return;
                } catch (getMeError) {
                  // Se getMe falhar, limpa tokens e continua normalmente
                  console.warn("Erro ao buscar dados do usuário:", getMeError);
                  await ApiService.clearTokens();
                  await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
                }
              }
            }
          }
        } catch (secureStoreError) {
          // Se SecureStore falhar (pode acontecer em algumas plataformas), continua normalmente
          console.warn("Erro ao acessar SecureStore:", secureStoreError);
        }
      }

      const isAuth = await ApiService.isAuthenticated();
      if (isAuth) {
        try {
          const userData = await ApiService.getMe();
          if (userData && userData.id) {
            await AsyncStorage.setItem(USER_ID_KEY, userData.id);
            
            // Sincroniza com banco local (pode falhar silenciosamente)
            try {
              await UserService.syncUserFromBackend(userData);
            } catch (syncError) {
              console.warn("Erro ao sincronizar com banco local:", syncError);
            }
            
            setUser(userData);
          }
        } catch (getMeError) {
          // Se getMe falhar, limpa tokens inválidos
          console.warn("Erro ao buscar dados do usuário autenticado:", getMeError);
          await ApiService.clearTokens();
        }
      }
    } catch (error) {
      console.warn("Erro na inicialização de autenticação:", error);
      await ApiService.clearTokens();
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    try {
      const { user: userData, tokens } = await ApiService.login(email, password);
      console.log('[AuthContext] Login bem-sucedido, tokens recebidos:', !!tokens?.accessToken);

      // Garante usuário consistente do backend
      let me;
      try {
        me = await ApiService.getMe();
        if (!me || !me.id) {
          throw new Error("Dados do usuário inválidos");
        }
        console.log('[AuthContext] Dados do usuário obtidos via getMe:', me.id);
      } catch (getMeError) {
        // Se getMe falhar, usa os dados do login
        console.warn("Erro ao buscar dados completos, usando dados do login:", getMeError);
        me = userData;
        if (!me || !me.id) {
          throw new Error("Não foi possível obter dados do usuário");
        }
      }

      await AsyncStorage.setItem(USER_ID_KEY, me.id);
      
      // Sincroniza com banco local (pode falhar silenciosamente se não houver banco)
      try {
        await UserService.syncUserFromBackend(me);
      } catch (syncError) {
        // Erro no sync não deve impedir o login
        console.warn("Erro ao sincronizar com banco local:", syncError);
      }

      setUser(me);
      Alert.alert("Sucesso", `Bem-vindo(a), ${me.name || 'Usuário'}!`);

      // Pergunta ao usuário se quer salvar para biometria (apenas em plataformas móveis)
      if (Platform.OS !== 'web') {
        Alert.alert(
          "Acesso Biométrico",
          "Deseja permitir login por biometria nas próximas vezes?",
          [
            { text: "Não", style: "cancel" },
            {
              text: "Sim",
              onPress: async () => {
                try {
                  await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, tokens.accessToken);
                } catch (biometricError) {
                  console.warn("Erro ao salvar token biométrico:", biometricError);
                }
              },
            },
          ]
        );
      }
    } catch (error: any) {
      const message = ApiService.handleError(error);
      Alert.alert("Erro no Login", message);
      throw error; // Re-throw para que a tela possa tratar
    }
  }

  async function signup(email: string, password: string, name: string, handle: string, collegeId?: string) {
    if (!email || !password || !name || !handle) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erro", "Email inválido!");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres!");
      return;
    }

    if (handle.length < 3) {
      Alert.alert("Erro", "O nome de usuário deve ter no mínimo 3 caracteres!");
      return;
    }

    try {
      const { user: userData, tokens } = await ApiService.signup({ name, email, password, handle, collegeId });
      console.log('[AuthContext] Signup bem-sucedido, tokens recebidos:', !!tokens?.accessToken);
      
      // Garante usuário consistente do backend
      let me;
      try {
        me = await ApiService.getMe();
        if (!me || !me.id) {
          throw new Error("Dados do usuário inválidos");
        }
        console.log('[AuthContext] Dados do usuário obtidos via getMe:', me.id);
      } catch (getMeError) {
        // Se getMe falhar, usa os dados do signup
        console.warn("Erro ao buscar dados completos, usando dados do cadastro:", getMeError);
        me = userData;
        if (!me || !me.id) {
          throw new Error("Não foi possível obter dados do usuário");
        }
      }
      
      await AsyncStorage.setItem(USER_ID_KEY, me.id);
      
      // Sincroniza com banco local (pode falhar silenciosamente se não houver banco)
      try {
        await UserService.syncUserFromBackend(me);
      } catch (syncError) {
        // Erro no sync não deve impedir o cadastro
        console.warn("Erro ao sincronizar com banco local:", syncError);
      }

      setUser(me);
      Alert.alert("Sucesso", "Cadastro realizado com sucesso!");

      // Pergunta biometria após cadastro (apenas em plataformas móveis)
      if (Platform.OS !== 'web') {
        Alert.alert(
          "Acesso Biométrico",
          "Deseja permitir login por biometria nas próximas vezes?",
          [
            { text: "Não", style: "cancel" },
            {
              text: "Sim",
              onPress: async () => {
                try {
                  await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, tokens.accessToken);
                } catch (biometricError) {
                  console.warn("Erro ao salvar token biométrico:", biometricError);
                }
              },
            },
          ]
        );
      }
    } catch (error: any) {
      const message = ApiService.handleError(error);
      Alert.alert("Erro no Cadastro", message);
      throw error; // Re-throw para que a tela possa tratar
    }
  }

  async function logout() {
    try {
      await ApiService.clearTokens();
      await AsyncStorage.removeItem(USER_ID_KEY);
      
      // SecureStore só funciona em plataformas móveis
      if (Platform.OS !== 'web') {
        try {
          await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
        } catch (secureStoreError) {
          console.warn("Erro ao deletar token biométrico:", secureStoreError);
        }
      }

      if (user?.id) await UserService.clearUserCache(user.id);

      setUser(null);
    } catch (error) {
      
    }
  }

  async function refreshUser() {
    try {
      const userData = await ApiService.getMe();
      await UserService.syncUserFromBackend(userData);
      setUser(userData);
    } catch (error) {
      
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
