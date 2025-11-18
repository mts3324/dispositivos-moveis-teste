import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import ApiService from '../services/ApiService';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';

export type GroupProgressRoute = RouteProp<RootStackParamList, 'GroupProgress'>;

export default function GroupProgressScreen() {
  const { colors, commonStyles } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<GroupProgressRoute>();
  const { groupId, groupName } = route.params;
  const { user } = useAuth();
  const { width } = useWindowDimensions();

  // Responsive helpers
  const scale = useMemo(() => {
    const factor = Math.min(1.35, Math.max(0.85, width / 375));
    return (n: number) => Math.round(n * factor);
  }, [width]);

  const layout = useMemo(() => {
    const gutter = 16;
    const minWidth = 280;
    // breakpoints: 1 col (<700), 2 cols (700-1199), 3 cols (>=1200)
    const cols = width >= 1200 ? 3 : width >= 700 ? 2 : 1;
    const horizontalPadding = 16 * 2; // content padding
    const totalGutters = gutter * (cols - 1);
    const available = Math.max(0, width - horizontalPadding - totalGutters);
    const rawCard = available / cols;
    const cardWidth = Math.max(minWidth, rawCard);
    return { gutter, cols, cardWidth };
  }, [width]);

  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [exResp, lbResp, subResp] = await Promise.all([
          ApiService.getGroupChallenges(groupId),
          ApiService.getLeaderboardByGroup(groupId),
          ApiService.getMySubmissions({ status: 'Accepted', limit: 500 })
        ]);

        const exItems = Array.isArray(exResp) ? exResp : exResp?.items || [];
        const lbItems = Array.isArray(lbResp) ? lbResp : lbResp?.items || lbResp?.data || [];
        const subs = Array.isArray(subResp) ? subResp : subResp?.items || [];
        if (!mounted) return;
        setExercises(exItems);
        setLeaderboard(lbItems);
        setMySubmissions(subs);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [groupId]);

  const metrics = useMemo(() => {
    const total = exercises.length;
    const groupExerciseIds = new Set(
      exercises.map((e: any) => String(e.id || e._id))
    );
    const acceptedInGroup = mySubmissions.filter((s: any) => groupExerciseIds.has(String(s.exerciseId || s.exercise?.id || s.exercise?._id)) && String(s.status || s.result || '').toUpperCase().includes('ACCEPT'));
    const completed = new Set(acceptedInGroup.map((s: any) => String(s.exerciseId || s.exercise?.id || s.exercise?._id))).size;

    const avgDifficulty = total > 0 ? (exercises.reduce((acc: number, e: any) => acc + Number(e.difficulty ?? 1), 0) / total) : 0;

    // posição do ranking do usuário
    let myPosition: number | null = null;
    let myPoints = 0;
    for (let i = 0; i < leaderboard.length; i++) {
      const r = leaderboard[i];
      if (String(r.userId || r.id) === String(user?.id || '')) {
        myPosition = (r.position ?? i + 1);
        myPoints = Number(r.points ?? r.xpTotal ?? 0);
        break;
      }
    }

    return {
      total,
      completed,
      completionPct: total > 0 ? (completed / total) * 100 : 0,
      xpTotal: myPoints,
      myPosition,
      membersCount: Math.max(leaderboard.length, 1),
      avgDifficulty,
      summary: {
        done: completed,
        inProgress: 0, // sem endpoint específico por enquanto
        todo: Math.max(total - completed, 0),
      }
    };
  }, [exercises, leaderboard, mySubmissions, user?.id]);

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.center}> 
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}> 
        <TouchableOpacity style={[styles.backButton, { borderColor: colors.primary }]} onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: colors.primary, fontSize: scale(14) }]}>← Voltar para o Grupo</Text>
        </TouchableOpacity>

        <Text style={[styles.pageTitle, { color: colors.text, fontSize: scale(28) }]}>Meu Progresso no Grupo</Text>
        <Text style={[styles.groupName, { color: colors.textSecondary, fontSize: scale(14) }]}>{groupName || ''}</Text>

        <View style={[styles.grid, { gap: layout.gutter, justifyContent: layout.cols === 1 ? 'center' : 'space-between' }]}> 
          <View style={[styles.card, { backgroundColor: colors.card, width: layout.cardWidth }]}> 
            <Text style={[styles.kpiNumber, { color: colors.text, fontSize: scale(32) }]}>{metrics.completed}/{metrics.total}</Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Exercícios Concluídos</Text>
            <View style={[styles.progressBar, { backgroundColor: colors.border, height: scale(8) }]}> 
              <View style={[styles.progressFill, { width: `${metrics.completionPct}%`, backgroundColor: colors.primary, borderRadius: scale(8) }]} />
            </View>
            <Text style={[styles.progressCaption, { color: colors.textSecondary }]}>{metrics.completionPct.toFixed(1)}% de conclusão</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, width: layout.cardWidth }]}> 
            <Text style={[styles.kpiNumber, { color: colors.text, fontSize: scale(32) }]}>{metrics.xpTotal}</Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>XP Total Conquistado</Text>
            <Text style={[styles.caption, { color: colors.textSecondary }]}>No grupo {groupName || ''}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, width: layout.cardWidth }]}> 
            <Text style={[styles.kpiNumber, { color: colors.text, fontSize: scale(32) }]}>#{metrics.myPosition ?? '-'}</Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Posição no Ranking</Text>
            <Text style={[styles.caption, { color: colors.textSecondary }]}>Entre {metrics.membersCount} membros</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, width: layout.cardWidth }]}> 
            <Text style={[styles.kpiNumber, { color: colors.text, fontSize: scale(32) }]}>{metrics.avgDifficulty.toFixed(1)}/5</Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Dificuldade Média</Text>
            <Text style={[styles.caption, { color: colors.textSecondary }]}>Dos exercícios do grupo</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, marginTop: layout.gutter }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scale(20) }]}>📊 Resumo de Progresso</Text>
          <Text style={[styles.caption, { color: colors.textSecondary, fontSize: scale(12) }]}>Atividade no {groupName || ''}</Text>
          <View style={styles.summaryRow}> 
            <View style={styles.summaryItem}> 
              <Text style={[styles.summaryNumber, { color: colors.text, fontSize: scale(18) }]}>{metrics.summary.done}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Concluídos</Text>
            </View>
            <View style={styles.summaryItem}> 
              <Text style={[styles.summaryNumber, { color: colors.text, fontSize: scale(18) }]}>{metrics.summary.inProgress}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Em Andamento</Text>
            </View>
            <View style={styles.summaryItem}> 
              <Text style={[styles.summaryNumber, { color: colors.primary, fontSize: scale(18) }]}>{metrics.summary.todo}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Para Fazer</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, marginTop: layout.gutter }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scale(20) }]}>Meu Progresso nos Exercícios</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, marginTop: layout.gutter }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: scale(20) }]}>Próximos Desafios Sugeridos</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backButton: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  backText: { fontWeight: '600' },
  pageTitle: { fontSize: 28, fontWeight: '800', marginTop: 8 },
  groupName: { fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  card: { borderRadius: 12, padding: 16, flexGrow: 1 },
  kpiNumber: { fontSize: 32, fontWeight: '800' },
  kpiLabel: { marginTop: 6, fontSize: 13 },
  caption: { fontSize: 12, marginTop: 4 },
  progressBar: { marginTop: 10, height: 8, borderRadius: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 8 },
  progressCaption: { marginTop: 6, fontSize: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', gap: 20, marginTop: 12 },
  summaryItem: { alignItems: 'flex-start' },
  summaryNumber: { fontSize: 18, fontWeight: '800' },
  summaryLabel: { fontSize: 12 }
});
