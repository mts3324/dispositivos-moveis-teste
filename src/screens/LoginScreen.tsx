import React, { useState, useEffect, useRef } from "react";
import { TextInput as RNTextInput } from "react-native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "../contexts/AuthContext";
import ApiService from "../services/ApiService";
import { styles } from "../styles/authStyles";

export default function LoginScreen() {
  const { login } = useAuth();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const passwordRef = useRef<RNTextInput>(null);

  useEffect(() => {
    checkBiometricLogin();
  }, []);

  async function checkBiometricLogin() {
    try {
      const savedToken = await SecureStore.getItemAsync("app_biometric_token");
      if (!savedToken) return;

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && enrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Autentique-se para continuar",
          cancelLabel: "Cancelar",
        });

      }
    } catch (error) {
    }
  }

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);

      // Pergunta se o usuário quer ativar login biométrico
      if (!rememberMe) {
        Alert.alert(
          "Acesso Biométrico",
          "Deseja permitir login por biometria nas próximas vezes?",
          [
            { text: "Não", style: "cancel" },
            {
              text: "Sim",
              onPress: async () => {
                try {
                  const token = await ApiService.getToken();
                  if (token) {
                    await SecureStore.setItemAsync("app_biometric_token", token);
                  }
                } catch (err) {
                  console.warn("Erro ao salvar token biométrico:", err);
                }
              },
            },
          ]
        );
      }

    } catch (err: any) {
      Alert.alert("Erro", err.message || "Não foi possível realizar o login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.blueShape} />
      <View style={styles.yellowShape} />

      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Home")}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          accessibilityHint="Voltar para a tela inicial"
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Entrar</Text>
          <Text style={styles.subtitle}>
            Aprenda estrutura de dados de forma cativante
          </Text>

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@mail.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            accessibilityLabel="E-mail"
            accessibilityHint="Digite seu e-mail"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <Text style={styles.label}>Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Sua senha de acesso"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              ref={passwordRef}
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              accessibilityLabel="Senha"
              accessibilityHint="Digite sua senha"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? "Ocultar senha" : "Mostrar senha"}
              accessibilityHint="Alterna a visibilidade da senha"
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: rememberMe }}
            accessibilityLabel="Continuar conectado"
          >
            <View style={styles.checkbox}>
              {rememberMe && (
                <Ionicons name="checkmark" size={16} color="#3B5BDB" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Continuar conectado</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Acessar"
            accessibilityHint="Entrar no aplicativo"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Acessar</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem uma conta? </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate("Signup")}
            accessibilityRole="button"
            accessibilityLabel="Criar conta"
            accessibilityHint="Ir para tela de cadastro"
          >
            <Text style={styles.footerLink}>Criar conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
