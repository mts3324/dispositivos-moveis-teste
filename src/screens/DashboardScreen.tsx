import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import ApiService from "../services/ApiService";
import { deriveLevelFromXp } from "../utils/levels";
import type { RootStackParamList } from "../navigation/AppNavigator";

// Tipo para navegação entre tabs
type TabParamList = {
  DashboardTab: undefined;
  ChallengesTab: { openCreate?: boolean } | undefined;
  DiscussionsTab: undefined;
  GroupsTab: undefined;
  RankingTab: undefined;
  SettingsTab: undefined;
  ProfileTab: undefined;
};

type TabNavigationProp = BottomTabNavigationProp<TabParamList>;
type StackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AppNavigationProp = CompositeNavigationProp<TabNavigationProp, StackNavigationProp>;

interface DashboardStats {
  languages: number;
  challenges: number;
  forumsCreated: number;
  totalXp: number;
  level: number;
  weekProgress: number;
}

export default function DashboardScreen() {
  const { user, loading: authLoading } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<AppNavigationProp>();
  const { width } = useWindowDimensions();

  const [stats, setStats] = useState<DashboardStats>({
    languages: 0,
    challenges: 0,
    forumsCreated: 0,
    totalXp: 0,
    level: 1,
    weekProgress: 0,
  });
  const [exercises, setExercises] = useState<any[]>([]);
  const [allExercises, setAllExercises] = useState<any[]>([]); // Todos os exercícios (sem filtro)
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [avatarError, setAvatarError] = useState(false);

  // Responsive layout metrics
  const layout = useMemo(() => {
    const gutter = 12;
    const horizontalPadding = 20 * 2;
    const availableWidth = width - horizontalPadding - gutter;
    const cardWidth = Math.max(280, Math.min(320, availableWidth * 0.85)); // 85% da largura disponível, mínimo 280, máximo 320
    return { gutter, cardWidth };
  }, [width]);

  // Calcular level baseado no XP
  const currentXpTotal = user?.xpTotal || 0;
  const currentLevel = useMemo(() => {
    return user?.level || deriveLevelFromXp(currentXpTotal);
  }, [user?.level, currentXpTotal]);

  const avatarUrl = useMemo(() => {
    if (!user?.avatarUrl) {
      return null;
    }
    
    if (user.avatarUrl.startsWith('http://') || user.avatarUrl.startsWith('https://')) {
      return user.avatarUrl;
    }
    
    const baseUrl = ApiService.getBaseUrl();
    const avatarPath = user.avatarUrl.startsWith('/') ? user.avatarUrl : `/${user.avatarUrl}`;
    return `${baseUrl}${avatarPath}`;
  }, [user?.avatarUrl]);

  // Filtrar exercícios baseado na busca (com debounce para melhor performance)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!searchQuery.trim()) {
        setExercises(allExercises);
      } else {
        const filtered = allExercises.filter((exercise) => {
          const title = exercise.title?.toLowerCase() || "";
          const description = exercise.description?.toLowerCase() || "";
          const query = searchQuery.toLowerCase();
          return title.includes(query) || description.includes(query);
        });
        setExercises(filtered);
      }
    }, 300); // Debounce de 300ms para melhor performance

    return () => clearTimeout(timeoutId);
  }, [searchQuery, allExercises]);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const [statsData, exercisesData, completedIds] = await Promise.all([
        ApiService.getDashboardStats(user.id).catch(() => {
          return { languages: 0, challenges: 0, forumsCreated: 0, weekProgress: 0 };
        }),
        ApiService.getChallenges({ page: 1, limit: 8 }).catch(() => {
          return { items: [], total: 0 };
        }),
        ApiService.getMyCompletedExercises().catch(() => {
          return [];
        }),
      ]);

      setStats({
        ...statsData,
        totalXp: user.xpTotal || 0,
        level: user.level || deriveLevelFromXp(user.xpTotal || 0),
      });
      
      const exercisesList = exercisesData?.items || [];
      const normalizedExercises = exercisesList.map((ex: any) => ({
        ...ex,
        id: ex.id || ex._id || ex.publicCode,
      }));
      
      setAllExercises(normalizedExercises);
      setExercises(normalizedExercises);
      setCompletedExerciseIds(completedIds || []);
    } catch (err: any) {
      setError(ApiService.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.loginContainer}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>Bem-vindo!</Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            Faça login para continuar
          </Text>
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("Login")}
            accessibilityLabel="Fazer login"
            accessibilityRole="button"
          >
            <Text style={styles.loginButtonText}>Fazer Login</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.signupButton, { borderColor: colors.primary }]}
            onPress={() => navigation.navigate("Signup")}
            accessibilityLabel="Criar conta"
            accessibilityRole="button"
          >
            <Text style={[styles.signupButtonText, { color: colors.primary }]}>Criar Conta</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const completedIdsSet = new Set(completedExerciseIds);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header com Perfil e Barra de Pesquisa */}
      <View style={[styles.topHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {/* Perfil no canto superior direito */}
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate("ProfileTab")}
          accessibilityLabel={`Perfil de ${user?.name || 'usuário'}`}
          accessibilityRole="button"
        >
          {avatarUrl && !avatarError ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.profileAvatar}
              onError={() => {
                setAvatarError(true);
              }}
              onLoad={() => {
                setAvatarError(false);
              }}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.profileAvatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]} numberOfLines={1}>
              {user?.name || 'Usuário'}
            </Text>
            <Text style={[styles.profileLevel, { color: colors.textSecondary }]}>
              Level {currentLevel}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Barra de Pesquisa Minimalista e Centralizada */}
      <View style={[styles.searchBarContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: isDarkMode ? colors.cardSecondary : "#F0F0F0", borderColor: colors.border }]}>
          <Ionicons name="search" size={14} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Campo de busca de desafios"
            accessibilityRole="search"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
              accessibilityLabel="Limpar busca"
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: colors.primary }]}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              <Text style={styles.bracket}>{"{"}</Text>
              Hello World!
              <Text style={styles.bracket}>{"}"}</Text>
            </Text>
            <Text style={styles.heroDescription}>
              Bem-vindo de volta, <Text style={styles.heroName}>{user?.name}</Text>! Continue sua
              jornada de aprendizado e conquiste novos desafios. Você está indo muito bem!
          </Text>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate("ChallengesTab", { openCreate: true })}
              accessibilityLabel="Criar novo desafio"
              accessibilityRole="button"
            >
              <Ionicons name="add-circle" size={18} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>Criar Desafio</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroStats}>
            <View style={[styles.statCard, { backgroundColor: "rgba(255, 255, 255, 0.2)" }]}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <View style={styles.statCardContent}>
                <Text style={styles.statValue}>Level {currentLevel}</Text>
                <Text style={styles.statLabel}>Seu Nível</Text>
              </View>
            </View>
            <View style={[styles.statCard, { backgroundColor: "rgba(255, 255, 255, 0.2)" }]}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <View style={styles.statCardContent}>
                <Text style={styles.statValue}>{currentXpTotal} XP</Text>
                <Text style={styles.statLabel}>Experiência</Text>
              </View>
            </View>
          </View>
          </View>

        {error && (
          <View style={[styles.errorAlert, { backgroundColor: colors.card }]}>
            <Text style={[styles.errorText, { color: "#F44336" }]}>
              <Text style={styles.errorBold}>Erro ao carregar dados:</Text> {error}
            </Text>
            <TouchableOpacity 
              style={[styles.refreshButton, { backgroundColor: colors.primary }]}
              onPress={loadDashboardData}
              accessibilityLabel="Tentar novamente"
              accessibilityRole="button"
            >
              <Text style={styles.refreshButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Seção Em Andamento */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flame" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Em Andamento</Text>
          </View>
          <View style={styles.progressGrid}>
            <TouchableOpacity
              style={[styles.progressCard, { backgroundColor: colors.card, flex: 1 }]}
              onPress={() => navigation.navigate("ChallengesTab")}
              accessibilityLabel="Ver linguagens utilizadas"
              accessibilityRole="button"
              activeOpacity={0.7}
            >
              <View style={[styles.progressIcon, { backgroundColor: "#667eea" }]}>
                <Ionicons name="code-slash" size={20} color="#fff" />
              </View>
              <View style={styles.progressInfo}>
                <Text style={[styles.progressValue, { color: colors.text }]}>
                  {loading ? "..." : stats.languages}
                </Text>
                <Text style={[styles.progressLabel, { color: colors.textSecondary }]} numberOfLines={1}>Linguagens</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.progressCard, { backgroundColor: colors.card, flex: 1, marginLeft: 12 }]}
              onPress={() => navigation.navigate("ChallengesTab")}
              accessibilityLabel="Ver desafios publicados"
              accessibilityRole="button"
              activeOpacity={0.7}
            >
              <View style={[styles.progressIcon, { backgroundColor: "#3b82f6" }]}>
                <Ionicons name="trophy" size={20} color="#fff" />
              </View>
              <View style={styles.progressInfo}>
                <Text style={[styles.progressValue, { color: colors.text }]}>
                  {loading ? "..." : stats.challenges}
                </Text>
                <Text style={[styles.progressLabel, { color: colors.textSecondary }]} numberOfLines={2}>
                  Desafios Publicados
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seção Comunidade */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Comunidade</Text>
          </View>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Participe de grupos de estudo e fóruns de discussão
          </Text>
          <View style={styles.progressGrid}>
            <TouchableOpacity
              style={[styles.progressCard, { backgroundColor: colors.card, flex: 1 }]}
              onPress={() => navigation.navigate("GroupsTab")}
              accessibilityLabel="Ver grupos"
              accessibilityRole="button"
            >
              <View style={[styles.progressIcon, { backgroundColor: "#10b981" }]}>
                <Ionicons name="people" size={20} color="#fff" />
              </View>
              <View style={styles.progressInfo}>
                <Text style={[styles.progressValue, { color: colors.text }]}>Grupos</Text>
                <Text style={[styles.progressLabel, { color: colors.textSecondary }]} numberOfLines={2}>
                  Estude em grupo e compartilhe conhecimento
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.progressCard, { backgroundColor: colors.card, flex: 1, marginLeft: 12 }]}
              onPress={() => navigation.navigate("DiscussionsTab")}
              accessibilityLabel="Ver fóruns"
              accessibilityRole="button"
            >
              <View style={[styles.progressIcon, { backgroundColor: "#667eea" }]}>
                <Ionicons name="chatbubbles" size={20} color="#fff" />
              </View>
              <View style={styles.progressInfo}>
                <Text style={[styles.progressValue, { color: colors.text }]}>
                  {loading ? "..." : stats.forumsCreated}
                </Text>
                <Text style={[styles.progressLabel, { color: colors.textSecondary }]} numberOfLines={1}>Fóruns Criados</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seção Desafios Publicados */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="code-slash" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Desafios Publicados</Text>
          </View>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Todos os desafios disponíveis na plataforma
          </Text>
          {loading ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
              style={styles.carouselScrollView}
            >
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={[styles.exerciseCardSkeleton, { backgroundColor: colors.card, marginRight: 12, width: layout.cardWidth }]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ))}
            </ScrollView>
          ) : exercises.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
              style={styles.carouselScrollView}
            >
              {exercises.map((exercise) => {
                const exerciseId = exercise.id || exercise._id || exercise.publicCode;
                const isCompleted = completedIdsSet.has(String(exerciseId)) || exercise.isCompleted === true;
                const difficultyMap: Record<number, string> = {
                  1: "Fácil",
                  2: "Médio",
                  3: "Difícil",
                  4: "Expert",
                  5: "Master",
                };
                const difficultyText = difficultyMap[exercise.difficulty] || "Médio";
                const difficultyColor =
                  difficultyText === "Fácil"
                    ? "#4CAF50"
                    : difficultyText === "Médio"
                    ? "#FF9800"
                    : "#F44336";

                return (
                  <View
                    key={exerciseId || exercise.publicCode || `exercise-${Math.random()}`}
                    style={[
                      styles.exerciseCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: isCompleted ? "#10b981" : colors.border,
                        borderWidth: isCompleted ? 2 : 1,
                        marginRight: 12,
                        width: layout.cardWidth,
                      },
                    ]}
                  >
                    {isCompleted && (
                      <View style={styles.completedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                        <Text style={styles.completedBadgeText}>Concluído</Text>
                      </View>
                    )}
                    <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
                      <Text style={styles.difficultyBadgeText}>{difficultyText}</Text>
                    </View>
                    {exercise.language && (
                      <View style={styles.languageBadge}>
                        <Text style={styles.languageBadgeText}>{exercise.language.name}</Text>
                      </View>
                    )}
                    <View style={[styles.cardHeader, { backgroundColor: colors.cardSecondary }]}>
                      <View style={styles.xpBadge}>
                        <Ionicons name="trophy" size={14} color={colors.primary} />
                        <Text style={[styles.xpBadgeText, { color: colors.primary }]}>
                          {exercise.baseXp || exercise.xp || 0} XP
                        </Text>
                      </View>
                    </View>
                    <View style={styles.cardBody}>
                      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                        {exercise.title}
                      </Text>
                      <Text
                        style={[styles.cardDescription, { color: colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {exercise.description || "Resolva este desafio e ganhe experiência"}
                      </Text>
                    </View>
                    <View style={styles.cardFooter}>
                      {isCompleted ? (
                        <View style={[styles.completedButton, { backgroundColor: "#10b981" }]}>
                          <Ionicons name="checkmark-circle" size={16} color="#fff" />
                          <Text style={styles.completedButtonText}>Concluído</Text>
              </View>
                      ) : (
                        <TouchableOpacity
                          style={[styles.startButton, { backgroundColor: colors.primary }]}
                          onPress={() => {
                            if (exerciseId) {
                              try {
                                navigation.navigate("ChallengeDetails", { exerciseId: String(exerciseId) });
                              } catch (navError: any) {
                                Alert.alert('Erro', 'Não foi possível abrir o desafio. Tente novamente.');
                              }
                            } else {
                              Alert.alert('Erro', 'ID do desafio não encontrado.');
                            }
                          }}
                          accessibilityLabel={`Iniciar desafio: ${exercise.title}`}
                          accessibilityRole="button"
                        >
                          <Text style={styles.startButtonText}>Iniciar Desafio</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <View style={[styles.noExercises, { backgroundColor: colors.card }]}>
              <Text style={[styles.noExercisesText, { color: colors.textSecondary }]}>
                Nenhum desafio disponível no momento.
              </Text>
              <TouchableOpacity
                style={[styles.refreshButton, { backgroundColor: colors.primary }]}
                onPress={loadDashboardData}
                accessibilityLabel="Recarregar desafios"
                accessibilityRole="button"
              >
                <Text style={styles.refreshButtonText}>Recarregar</Text>
            </TouchableOpacity>
          </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  // Top Header com Perfil
  topHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#E0E0E0",
  },
  profileAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  profileLevel: {
    fontSize: 13,
  },
  // Search Bar Minimalista e Centralizada
  searchBarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    zIndex: 9,
    alignItems: "center",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
    maxWidth: 300,
    width: "auto",
    borderWidth: 1,
    alignSelf: "center",
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    margin: 0,
  },
  clearButton: {
    marginLeft: 6,
    padding: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
  },
  loginButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signupButton: {
    backgroundColor: "transparent",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    borderWidth: 2,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  // Hero Section
  heroSection: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  heroContent: {
    marginBottom: 16,
    flex: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  bracket: {
    color: "#FFD700",
  },
  heroDescription: {
    fontSize: 14,
    color: "#fff",
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.95,
  },
  heroName: {
    fontWeight: "bold",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: "flex-start",
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  heroStats: {
    gap: 10,
    flex: 1,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    flex: 1,
  },
  statCardContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 11,
    color: "#fff",
    opacity: 0.9,
    marginTop: 2,
  },
  // Sections
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  sectionDescription: {
    fontSize: 12,
    marginBottom: 12,
    marginTop: -6,
  },
  // Progress Grid
  progressGrid: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
  },
  progressCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    minHeight: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    flex: 1,
  },
  progressIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  progressInfo: {
    flex: 1,
    minWidth: 0,
  },
  progressValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
  // Exercises Carousel
  carouselScrollView: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  carouselContainer: {
    paddingRight: 20,
  },
  exerciseCardSkeleton: {
    width: 280,
    borderRadius: 16,
    padding: 16,
    minHeight: 240,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  exerciseCard: {
    width: 280,
    borderRadius: 16,
    overflow: "visible",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
    flexShrink: 0,
  },
  completedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    zIndex: 10,
    gap: 4,
  },
  completedBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  difficultyBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  difficultyBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  languageBadge: {
    position: "absolute",
    top: 12,
    right: 100,
    backgroundColor: "#3b82f6",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  languageBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  cardHeader: {
    padding: 12,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 4,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardBody: {
    padding: 16,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    lineHeight: 20,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardFooter: {
    padding: 16,
    paddingTop: 0,
  },
  startButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  completedButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    gap: 6,
    opacity: 0.9,
  },
  completedButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  noExercises: {
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
  },
  noExercisesText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  errorAlert: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F44336",
  },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
  },
  errorBold: {
    fontWeight: "bold",
  },
  refreshButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
