import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import ApiService from "../services/ApiService";
import { Ionicons } from "@expo/vector-icons";

export default function RankingScreen() {
  const { commonStyles, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await ApiService.getLeaderboards({ limit: 50 });
        if (!mounted) return;
        // Garante array
        const items = Array.isArray(data) ? data : data?.items || [];
        setLeaderboard(items);
        setError(null);
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
  }, []);

  const top10 = useMemo(() => (Array.isArray(leaderboard) ? leaderboard.slice(0, 10) : []), [leaderboard]);

  const getPositionBadge = (pos: number) => {
    if (pos === 1) return { bg: "#FFF4E6", text: "#E67E22" }; // ouro
    if (pos === 2) return { bg: "#F5F7FA", text: "#7F8C8D" }; // prata
    if (pos === 3) return { bg: "#FFF0EA", text: "#D35400" }; // bronze
    return { bg: "#F3F4F6", text: colors.textSecondary };
  };

  const MedalIcon = ({ pos }: { pos: number }) => {
    const color = pos === 1 ? "#F39C12" : pos === 2 ? "#95A5A6" : pos === 3 ? "#D35400" : colors.textSecondary;
    const name = pos === 1 ? "trophy" : "ribbon";
    return <Ionicons name={name as any} size={18} color={color} />;
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: (colors as any).heroOrange || "#F59E0B" }]}> 
        <Text style={styles.heroTitle}>Ranking dos Melhores</Text>
        <Text style={styles.heroSubtitle}>Veja os melhores dessa temporada</Text>
      </View>

      {loading ? (
        <View style={styles.center}> 
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}> 
          <Text style={{ color: colors.text }}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <View style={[styles.cardContainer, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            {/* Título do card */}
            <View style={styles.cardHeader}> 
              <View style={styles.cardHeaderLeft}> 
                <Ionicons name="trophy" size={20} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>TOP 10° Melhores do Ano</Text>
              </View>
            </View>

            {/* Cabeçalho tabela */}
            <View style={[styles.tableHeader, { backgroundColor: (colors as any).tableHeader || "#F7F9FC", borderColor: colors.border }]}> 
              <Text style={[styles.th, styles.thPosicao, { color: colors.textSecondary }]}>POSIÇÃO</Text>
              <Text style={[styles.th, styles.thNome, { color: colors.textSecondary }]}>NOME</Text>
              <Text style={[styles.th, styles.thPontos, { color: colors.textSecondary }]}>PONTOS</Text>
              <Text style={[styles.th, styles.thPontuacao, { color: colors.textSecondary }]}>PONTUAÇÃO</Text>
            </View>

            {/* Linhas */}
            {top10.length === 0 ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Ionicons name="information-circle-outline" size={22} color={colors.textSecondary} />
                <Text style={{ marginTop: 8, color: colors.textSecondary }}>
                  Nenhum ranking disponível no momento.
                </Text>
              </View>
            ) : top10.map((item, idx) => {
              const pos = idx + 1;
              const badge = getPositionBadge(pos);
              const rawPoints = item?.xpTotal ?? item?.xp ?? item?.points;
              const points = typeof rawPoints === 'number' ? rawPoints : 0;
              let name: any = item?.user?.name ?? item?.name ?? item?.handle;
              if (typeof name !== 'string') {
                name = typeof name?.message === 'string' ? name.message : 'Usuário';
              }
              const initial = typeof name === 'string' ? (name?.[0]?.toUpperCase() || "?") : "?";
              return (
                <TouchableOpacity key={String(item.id || item.userId || idx)} activeOpacity={0.9} style={[styles.tableRow, { borderColor: colors.border }]}> 
                  {/* Posicao */}
                  <View style={[styles.posicaoCell]}> 
                    <View style={[styles.posBadge, { backgroundColor: badge.bg }]}> 
                      <Text style={[styles.posText, { color: badge.text }]}>{pos}º</Text>
                    </View>
                  </View>
                  {/* Nome */}
                  <View style={[styles.nomeCell]}> 
                    <View style={[styles.avatar, { backgroundColor: (colors as any).avatarBg || '#1F2937' }]}> 
                      <Text style={styles.avatarText}>{initial}</Text>
                    </View>
                    <View style={{ flex: 1 }}> 
                      <Text style={[styles.nomeText, { color: colors.text }]} numberOfLines={1}>{String(name)}</Text>
                </View>
              </View>
              {/* Pontos */}
              <View style={[styles.pontosCell]}> 
                <Text style={[styles.pontosText, { color: colors.text }]}>{Number(points)} pts</Text>
              </View>
                  {/* Pontuação */}
                  <View style={[styles.pontuacaoCell]}> 
                    {pos <= 3 ? (
                      <MedalIcon pos={pos} />
                    ) : (
                      <View style={styles.scoreBadge}> 
                        <Text style={[styles.scoreText, { color: colors.textSecondary }]}>{Math.min(points, 999)}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Barra de progresso visual decorativa */}
            <View style={[styles.progressTrack, { backgroundColor: (colors as any).trackBg || '#E5E7EB' }]}>
              <View style={[styles.progressThumb, { backgroundColor: colors.primary }]} />
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { height: 120, paddingHorizontal: 20, paddingTop: 18, justifyContent: 'center' },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  heroSubtitle: { fontSize: 13, fontWeight: '600', color: '#fff', opacity: 0.9, marginTop: 6 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContainer: { borderWidth: 1, borderRadius: 16, padding: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 8 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  tableHeader: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 8, marginHorizontal: 4 },
  th: { fontSize: 12, fontWeight: '700' },
  thPosicao: { width: 70 },
  thNome: { flex: 1 },
  thPontos: { width: 100, textAlign: 'center' },
  thPontuacao: { width: 110, textAlign: 'center' },
  tableRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 8, marginTop: 10, marginHorizontal: 4 },
  posicaoCell: { width: 70, alignItems: 'center' },
  posBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  posText: { fontWeight: '800' },
  nomeCell: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 28, height: 28, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  nomeText: { fontSize: 14, fontWeight: '700' },
  pontosCell: { width: 100, alignItems: 'center' },
  pontosText: { fontSize: 13, fontWeight: '700' },
  pontuacaoCell: { width: 110, alignItems: 'center' },
  scoreBadge: { minWidth: 40, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#F3F4F6', alignItems: 'center' },
  scoreText: { fontSize: 12, fontWeight: '700' },
  progressTrack: { height: 6, borderRadius: 999, marginTop: 14, marginHorizontal: 8 },
  progressThumb: { width: 120, height: 6, borderRadius: 999 },
});
