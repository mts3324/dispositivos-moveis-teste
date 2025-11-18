import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, FlatList, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import ApiService from '../services/ApiService';

 type GroupRankingRoute = RouteProp<RootStackParamList, 'GroupRanking'>;

export default function GroupRankingScreen() {
  const { colors, commonStyles } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<GroupRankingRoute>();
  const { groupId, groupName } = route.params;
  const { height } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const resp = await ApiService.getLeaderboardByGroup(groupId);
        const lbItems = Array.isArray(resp) ? resp : resp?.items || resp?.data || [];
        if (!mounted) return;
        setItems(lbItems.slice(0, 10));
      } catch (err: any) {
        if (!mounted) return;
        // Em caso de erro, apenas deixa lista vazia e mostra mensagem
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [groupId]);

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const minCardHeight = Math.max(320, height * 0.55);

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}> 
        {/* Header amarelo */}
        <View style={styles.headerBanner}> 
          <Text style={styles.headerTitle}>Ranking do Grupo</Text>
          {!!groupName && <Text style={styles.headerSubtitle}>{groupName}</Text>}
        </View>

        {/* Card TOP 10 */}
        <View style={[styles.card, { backgroundColor: colors.card, minHeight: minCardHeight }]}> 
          <View style={styles.cardHeaderRow}> 
            <View style={styles.iconCircle}> 
              <Text style={styles.iconEmoji}>🏆</Text>
            </View>
            <Text style={[styles.cardTitle]}>TOP 10 do Grupo</Text>
          </View>

          <View style={styles.cardDivider} />

          {/* Cabeçalho da "tabela" */}
          <View style={styles.tableHeaderRow}> 
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>POSIÇÃO</Text>
            <Text style={[styles.tableHeaderText, { flex: 3 }]}>NOME</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>PONTOS</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>COLOCAÇÃO</Text>
          </View>

          {items.length === 0 ? (
            <View style={styles.emptyBox}> 
              <Text style={styles.emptyText}>Nenhum dado disponível no momento.</Text>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item: any, index: number) => String(item.userId || item.id || index)}
              scrollEnabled={false}
              renderItem={({ item, index }) => {
                const position = item.position ?? index + 1;
                const name = item.name || item.userName || 'Usuário';
                const points = item.points ?? item.xpTotal ?? 0;
                return (
                  <View style={styles.tableRow}> 
                    <Text style={[styles.tableCellText, { flex: 1 }]}>{position}</Text>
                    <Text style={[styles.tableCellText, { flex: 3 }]} numberOfLines={1}>{name}</Text>
                    <Text style={[styles.tableCellText, { flex: 2 }]}>{points}</Text>
                    <Text style={[styles.tableCellText, { flex: 2 }]}>#{position}</Text>
                  </View>
                );
              }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBanner: {
    marginHorizontal: -16,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: '#fbbf24',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2933',
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginTop: -24,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconEmoji: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  cardDivider: {
    marginTop: 4,
    marginBottom: 12,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(15,23,42,0.6)',
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: 'rgba(248,250,252,0.8)',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
    backgroundColor: 'rgba(15,23,42,0.4)',
  },
  tableCellText: {
    fontSize: 13,
    color: '#E5E7EB',
  },
  emptyBox: {
    marginTop: 16,
    paddingVertical: 32,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
