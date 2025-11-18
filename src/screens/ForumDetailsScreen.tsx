import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';
import { RootStackParamList } from '../navigation/AppNavigator';

type ForumRoute = RouteProp<RootStackParamList, 'ForumDetails'>;

export default function ForumDetailsScreen() {
  const { colors, commonStyles } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<ForumRoute>();
  const { forumId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forum, setForum] = useState<any | null>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [f, ts, ps] = await Promise.all([
          ApiService.getForumById(forumId),
          ApiService.getForumTopics(forumId),
          ApiService.getForumParticipants(forumId),
        ]);
        if (!mounted) return;
        setForum(f);
        const list = Array.isArray(ts?.items) ? ts.items : Array.isArray(ts) ? ts : [];
        setTopics(list);
        const userIds = Array.isArray(ps?.members) ? ps.members.map((m: any) => String(m.userId || m.id)) : [];
        setIsMember(userIds.length > 0 ? true : false);
        setError(null);
      } catch (err: any) {
        if (!mounted) return;
        setError(ApiService.handleError(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [forumId]);

  async function handleJoinLeave() {
    try {
      setSaving(true);
      if (isMember) {
        await ApiService.leaveForum(forumId);
      } else {
        await ApiService.joinForum(forumId);
      }
      const ps = await ApiService.getForumParticipants(forumId);
      const userIds = Array.isArray(ps?.members) ? ps.members.map((m: any) => String(m.userId || m.id)) : [];
      setIsMember(userIds.length > 0 ? true : false);
    } catch (err: any) {
      setError(ApiService.handleError(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={[styles.headerRow]}> 
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}> 
            <Ionicons name="arrow-back" size={20} color={colors.text} /> 
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Detalhes do Fórum</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <View style={styles.cardHeader}> 
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{forum?.nome || forum?.title || 'Fórum'}</Text>
            <View style={[styles.tag, { borderColor: colors.border }]}> 
              <Ionicons name="planet" size={12} color={colors.primary} />
              <Text style={[styles.tagText, { color: colors.primary }]}>{(forum?.statusPrivacidade || '').toString().toUpperCase() === 'PUBLICO' ? 'Público' : 'Privado'}</Text>
            </View>
          </View>
          {!!forum?.descricao && <Text style={[styles.desc, { color: colors.textSecondary }]}>{forum.descricao}</Text>}

          <View style={styles.actionsRow}> 
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: saving ? 0.8 : 1 }]}
              onPress={handleJoinLeave}
              disabled={saving}
            >
              <Text style={styles.primaryButtonText}>{isMember ? 'Sair do Fórum' : 'Participar do Fórum'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tópicos</Text>
          {topics.length === 0 ? (
            <View style={styles.empty}><Text style={{ color: colors.textSecondary }}>Nenhum tópico encontrado</Text></View>
          ) : (
            <FlatList
              data={topics}
              keyExtractor={(item, index) => String(item.id || item._id || index)}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={[styles.topicItem, { borderColor: colors.border, backgroundColor: colors.card }]}> 
                  <Text style={[styles.topicTitle, { color: colors.text }]} numberOfLines={1}>{item.titulo || item.title}</Text>
                  {!!item.descricao && <Text style={[styles.topicDesc, { color: colors.textSecondary }]} numberOfLines={2}>{item.descricao}</Text>}
                </View>
              )}
            />
          )}
        </View>

        {!!error && (
          <View style={{ marginTop: 12 }}><Text style={{ color: colors.text }}>{String(error)}</Text></View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12, fontWeight: '700' },
  desc: { marginTop: 8, fontSize: 13 },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  primaryButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10 },
  topicItem: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 10 },
  topicTitle: { fontSize: 14, fontWeight: '700' },
  topicDesc: { fontSize: 12 },
});