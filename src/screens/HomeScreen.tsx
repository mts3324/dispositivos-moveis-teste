import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

export default function HomeScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: colors.background }]}
      accessibilityLabel="Tela inicial"
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View 
            style={[styles.logoContainer, { backgroundColor: colors.card }]}
            accessibilityRole="image"
            accessibilityLabel="Logo do DevQuest"
          >
            <Ionicons name="code-slash" size={48} color={colors.primary} />
          </View>
          <Text 
            style={[styles.appName, { color: colors.text }]}
            accessibilityRole="header"
          >
            DevQuest
          </Text>
          <Text 
            style={[styles.tagline, { color: colors.textSecondary }]}
            accessibilityRole="text"
          >
            Domine estruturas de dados de forma prática e divertida
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Entrar"
            accessibilityHint="Navegar para a tela de login"
          >
            <Text style={styles.primaryButtonText}>Entrar</Text>
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.primary }]}
            onPress={() => navigation.navigate("Signup")}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Criar conta"
            accessibilityHint="Navegar para a tela de cadastro"
          >
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
              Criar conta
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  tagline: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonsContainer: {
    gap: 16,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 56,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
