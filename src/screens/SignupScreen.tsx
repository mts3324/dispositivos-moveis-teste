import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/authStyles";

const { height } = Dimensions.get("window");

interface College {
  id: string;
  name: string;
}

const collegesList: College[] = [
  { id: "1", name: "Faculdade de Minas (FAMINAS)" },
  { id: "2", name: "Universidade de São Paulo (USP)" },
  { id: "3", name: "Universidade Federal de Minas Gerais (UFMG)" },
  { id: "4", name: "Pontifícia Universidade Católica (PUC-SP)" },
];

export default function SignupScreen() {
  const { signup } = useAuth();
  const navigation = useNavigation<any>();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [collegeModalVisible, setCollegeModalVisible] = useState(false);

  async function handleSignup() {
    if (!firstName || !lastName || !handle || !email || !password || !college) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    setLoading(true);
    try {
      await signup(
        email,
        password,
        firstName + " " + lastName,
        handle,
        college.id
      );
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Não foi possível cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.blueShape} />

      <View style={styles.yellowShape} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { minHeight: height }]}
        showsVerticalScrollIndicator={false}
      >
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

        <View style={styles.container}>
          <View style={styles.contentSignup}>
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>
              Junte-se a nós e comece sua jornada de aprendizado
            </Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.inputSignup}
              placeholder="Seu primeiro nome"
              placeholderTextColor="#999"
              value={firstName}
              onChangeText={setFirstName}
              accessibilityLabel="Nome"
              accessibilityHint="Digite seu primeiro nome"
              textContentType="givenName"
              autoComplete="name-given"
            />

            <Text style={styles.label}>Sobrenome</Text>
            <TextInput
              style={styles.inputSignup}
              placeholder="Seu sobrenome"
              placeholderTextColor="#999"
              value={lastName}
              onChangeText={setLastName}
              accessibilityLabel="Sobrenome"
              accessibilityHint="Digite seu sobrenome"
              textContentType="familyName"
              autoComplete="name-family"
            />

            <Text style={styles.label}>Nome de usuário</Text>
            <TextInput
              style={styles.inputSignup}
              placeholder="joaosilva (sem espaços)"
              placeholderTextColor="#999"
              value={handle}
              onChangeText={(text) =>
                setHandle(text.toLowerCase().replace(/\s/g, ""))
              }
              autoCapitalize="none"
              accessibilityLabel="Nome de usuário"
              accessibilityHint="Digite um nome de usuário sem espaços"
              textContentType="username"
              autoComplete="username"
            />

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.inputSignup}
              placeholder="seu@mail.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="E-mail"
              accessibilityHint="Digite seu e-mail"
              textContentType="emailAddress"
              autoComplete="email"
            />

            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainerSignup}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                accessibilityLabel="Senha"
                accessibilityHint="Digite sua senha com no mínimo 6 caracteres"
                textContentType="newPassword"
                autoComplete="password-new"
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

            <Text style={styles.label}>Faculdade</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setCollegeModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Selecionar faculdade"
              accessibilityHint="Abre a lista de faculdades"
            >
              <Text
                style={college ? styles.selectText : styles.selectPlaceholder}
              >
                {college ? college.name : "Selecione sua faculdade"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonSignup, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Cadastrar"
              accessibilityHint="Criar conta no aplicativo"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Cadastrar</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem conta? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate("Login")}
              accessibilityRole="button"
              accessibilityLabel="Fazer login"
              accessibilityHint="Voltar para tela de login"
            >
              <Text style={styles.footerLink}>Fazer login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={collegeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCollegeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione sua faculdade</Text>
              <TouchableOpacity
                onPress={() => setCollegeModalVisible(false)}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={collegesList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.collegeItem}
                  onPress={() => {
                    setCollege(item);
                    setCollegeModalVisible(false);
                  }}
                >
                  <Text style={styles.collegeItemText}>{item.name}</Text>
                  {college?.id === item.id && (
                    <Ionicons name="checkmark" size={20} color="#3B5BDB" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
