import React from "react";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ThemeProvider } from "./src/contexts/ThemeContext"; // 🌙 Importa o tema
import { RootStackParamList } from "./src/navigation/AppNavigator";

export default function App() {
  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: ["myapp://", "https://seu-dominio.com"],
    config: {
      screens: {
        GroupInvite: "invite/:groupId/:token",
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </NavigationContainer>
  );
}
