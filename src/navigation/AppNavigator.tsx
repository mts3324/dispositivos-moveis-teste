import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import DashboardScreen from "../screens/DashboardScreen";
import DiscussionsScreen from "../screens/DiscussionsScreen";
import RankingScreen from "../screens/RankingScreen";
import ChallengesScreen from "../screens/ChallengesScreen";
import ChallengeDetailsScreen from "../screens/ChallengeDetailsScreen";
import GroupChallengesScreen from "../screens/GroupChallengesScreen";
import GroupRankingScreen from "../screens/GroupRankingScreen";
import GroupInviteScreen from "../screens/GroupInviteScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import GroupsScreen from "../screens/GroupsScreen";
import { useAuth } from "../contexts/AuthContext";
import GroupProgressScreen from "../screens/GroupProgressScreen";
import GroupDetailsScreen from "../screens/GroupDetailsScreen";
import { useTheme } from "../contexts/ThemeContext";

// Tipagem para o Stack Navigator
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Dashboard: undefined;
  GroupDetails: { groupId: string };
  GroupProgress: { groupId: string; groupName?: string };
  GroupChallenges: { groupId: string; groupName?: string; groupDescription?: string };
  GroupRanking: { groupId: string; groupName?: string };
  GroupInvite: { groupId: string; token: string };
  ForumDetails: { forumId: string };
  ChallengeDetails: { exerciseId: string };
};

// Tipagem para o Tab Navigator
type TabParamList = {
  DashboardTab: undefined;
  ChallengesTab: undefined;
  DiscussionsTab: undefined;
  GroupsTab: undefined;
  RankingTab: undefined;
  SettingsTab: undefined;
  ProfileTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { colors, isDarkMode } = useTheme();

  if (loading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  if (!user) {
    return (
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard">
        {() => (
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.textSecondary,
              tabBarStyle: {
                backgroundColor: colors.card,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                height: 70,
                paddingBottom: 10,
                paddingTop: 10,
                borderTopColor: colors.border,
              },
            }}
          >
            <Tab.Screen
              name="DashboardTab"
              component={DashboardScreen}
              options={{
                tabBarLabel: "Home",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="home" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="ChallengesTab"
              component={ChallengesScreen}
              options={{
                tabBarLabel: "Desafios",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="code-slash" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="DiscussionsTab"
              component={DiscussionsScreen}
              options={{
                tabBarLabel: "Discussões",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="chatbubbles" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="GroupsTab"
              component={GroupsScreen}
              options={{
                tabBarLabel: "Grupos",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="people" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="RankingTab"
              component={RankingScreen}
              options={{
                tabBarLabel: "Ranking",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="trophy" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="ProfileTab"
              component={ProfileScreen}
              options={{
                tabBarLabel: "Perfil",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="person" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="SettingsTab"
              component={SettingsScreen}
              options={{
                tabBarLabel: "Configurações",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="settings" size={size} color={color} />
                ),
              }}
            />
          </Tab.Navigator>
        )}
      </Stack.Screen>
      {/* Telas de grupos */}
      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
      <Stack.Screen name="GroupProgress" component={GroupProgressScreen} />
      <Stack.Screen name="GroupChallenges" component={GroupChallengesScreen} />
      <Stack.Screen name="GroupRanking" component={GroupRankingScreen} />
      <Stack.Screen name="GroupInvite" component={GroupInviteScreen} />
      <Stack.Screen name="ForumDetails" component={require('../screens/ForumDetailsScreen').default} />
      <Stack.Screen name="ChallengeDetails" component={ChallengeDetailsScreen} />
    </Stack.Navigator>
  );
}
