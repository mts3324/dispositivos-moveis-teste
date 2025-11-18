import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

interface BottomNavigationProps {
  activeRoute: "Home" | "Dashboard" | "Discussions" | "Ranking" | "Challenges" | "Settings";
}

export default function BottomNavigation({ activeRoute }: BottomNavigationProps) {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={[styles.navItem, activeRoute === "Ranking" && styles.navItemActive]}
        onPress={() => navigation.navigate("Ranking")}
      >
        <Ionicons
          name="trophy"
          size={24}
          color={activeRoute === "Ranking" ? "#4A90E2" : "#1A1A1A"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeRoute === "Discussions" && styles.navItemActive]}
        onPress={() => navigation.navigate("Discussions")}
      >
        <Ionicons
          name="chatbubbles"
          size={24}
          color={activeRoute === "Discussions" ? "#4A90E2" : "#1A1A1A"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeRoute === "Dashboard" && styles.navItemActive]}
        onPress={() => navigation.navigate("Dashboard")}
      >
        <Ionicons
          name="home"
          size={28}
          color={activeRoute === "Dashboard" ? "#4A90E2" : "#1A1A1A"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeRoute === "Challenges" && styles.navItemActive]}
        onPress={() => navigation.navigate("ChallengesTab")}
      >
        <Ionicons
          name="code-slash"
          size={24}
          color={activeRoute === "Challenges" ? "#4A90E2" : "#1A1A1A"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeRoute === "Settings" && styles.navItemActive]}
        onPress={() => navigation.navigate("Settings")}
      >
        <Ionicons
          name="settings"
          size={24}
          color={activeRoute === "Settings" ? "#4A90E2" : "#1A1A1A"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  navItem: {
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  navItemActive: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 15,
  },
});

