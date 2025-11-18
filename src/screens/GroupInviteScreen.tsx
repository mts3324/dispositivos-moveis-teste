import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTheme } from "../contexts/ThemeContext";
import ApiService from "../services/ApiService";

 type GroupInviteRoute = RouteProp<RootStackParamList, "GroupInvite">;

export default function GroupInviteScreen() {
  const { colors, commonStyles } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<GroupInviteRoute>();
  const { groupId, token } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        await ApiService.joinGroupByToken(String(groupId), String(token));
        if (!mounted) return;
        navigation.replace("GroupDetails", { groupId: String(groupId) });
      } catch (err: any) {
        if (!mounted) return;
        setError(ApiService.handleError(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [groupId, token]);

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.text, { color: colors.textSecondary }]}>Entrando no grupo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.center}>
        {error ? (
          <Text style={[styles.text, { color: colors.text }]}>{error}</Text>
        ) : (
          <Text style={[styles.text, { color: colors.text }]}>Redirecionando...</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
  },
});
