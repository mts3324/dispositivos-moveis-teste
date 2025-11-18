import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import ApiService from '../services/ApiService';
import DetailedChallengeCard from '../components/DetailedChallengeCard';

export type GroupChallengesRoute = RouteProp<RootStackParamList, 'GroupChallenges'>;

const difficultyOptions = [
  { value: 'all', label: 'Todas as dificuldades' },
  { value: '1', label: 'Fácil' },
  { value: '2', label: 'Médio' },
  { value: '3', label: 'Difícil' },
];

const statusOptions = [
  { value: 'all', label: 'Todos os status' },
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
];

export default function GroupChallengesScreen() {
  const { colors, commonStyles } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<GroupChallengesRoute>();
  const { groupId, groupName, groupDescription } = route.params;

  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);

  const [difficulty, setDifficulty] = useState<'all' | '1' | '2' | '3'>('all');
  const [status, setStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [language, setLanguage] = useState<'all' | string>('all');

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 1,
    xp: 100,
    isPublic: true,
    codeTemplate: '// Seu código aqui\n',
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [exResp, langResp] = await Promise.all([
          ApiService.getGroupChallenges(groupId),
          ApiService.getLanguages().catch(() => []),
        ]);
        if (!mounted) return;
        const exItems = Array.isArray(exResp) ? exResp : exResp?.items || [];
        const langItems = Array.isArray(langResp) ? langResp : langResp?.items || [];
        setChallenges(exItems);
        setLanguages(langItems);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [groupId]);

  const filteredChallenges = useMemo(() => {
    return challenges.filter((ch: any) => {
      const diff = String(ch.difficulty ?? '');
      const st = String(ch.status || '').toLowerCase();
      const langId = String(ch.languageId || ch.language?.id || '');

      if (difficulty !== 'all' && diff !== difficulty) return false;
      if (status === 'draft' && !st.includes('draft')) return false;
      if (status === 'published' && !st.includes('publish')) return false;
      if (language !== 'all' && langId && langId !== language) return false;
      return true;
    });
  }, [challenges, difficulty, status, language]);

  async function handleCreateChallenge() {
    if (!formData.title.trim()) {
      Alert.alert('Erro', 'Título é obrigatório');
      return;
    }
    try {
      setCreating(true);
      await ApiService.createGroupChallenge(String(groupId), {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        xp: formData.xp,
        isPublic: formData.isPublic,
        codeTemplate: formData.codeTemplate,
      });
      setShowCreate(false);
      setFormData({ title: '', description: '', difficulty: 1, xp: 100, isPublic: true, codeTemplate: '// Seu código aqui\n' });
      // recarrega desafios
      try {
        const exResp = await ApiService.getGroupChallenges(groupId);
        const exItems = Array.isArray(exResp) ? exResp : exResp?.items || [];
        setChallenges(exItems);
      } catch {}
      Alert.alert('Sucesso', 'Desafio criado com sucesso');
    } catch (err: any) {
      Alert.alert('Erro', ApiService.handleError(err));
    } finally {
      setCreating(false);
    }
  }

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
        <TouchableOpacity style={[styles.backBtn, { borderColor: colors.border }]} onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: colors.textSecondary }]}>← Voltar para o Grupo</Text>
        </TouchableOpacity>

        <View style={styles.headerRow}> 
          <View style={{ flex: 1 }}> 
            <Text style={[styles.title, { color: colors.text }]}>Desafios do Grupo</Text>
            {!!groupName && (
              <Text style={[styles.groupName, { color: colors.textSecondary }]}>{groupName}</Text>
            )}
            {!!groupDescription && (
              <Text style={[styles.groupDesc, { color: colors.textSecondary }]}>{groupDescription}</Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowCreate(true)}
          >
            <Text style={styles.primaryButtonText}>+ Criar Desafio</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.filterCard, { backgroundColor: colors.card }]}> 
          <Text style={[styles.filterTitle, { color: colors.text }]}>Filtrar Desafio</Text>
          <View style={styles.filterRow}> 
            <View style={styles.filterCol}> 
              <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Dificuldade</Text>
              <View style={styles.chipRow}> 
                {difficultyOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, difficulty === opt.value && [styles.chipSelected, { borderColor: colors.primary }]]}
                    onPress={() => setDifficulty(opt.value as any)}
                  >
                    <Text style={[styles.chipText, { color: difficulty === opt.value ? colors.primary : colors.textSecondary }]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterCol}> 
              <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Status</Text>
              <View style={styles.chipRow}> 
                {statusOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, status === opt.value && [styles.chipSelected, { borderColor: colors.primary }]]}
                    onPress={() => setStatus(opt.value as any)}
                  >
                    <Text style={[styles.chipText, { color: status === opt.value ? colors.primary : colors.textSecondary }]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterCol}> 
              <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Linguagem</Text>
              <View style={styles.chipRow}> 
                <TouchableOpacity
                  style={[styles.chip, language === 'all' && [styles.chipSelected, { borderColor: colors.primary }]]}
                  onPress={() => setLanguage('all')}
                >
                  <Text style={[styles.chipText, { color: language === 'all' ? colors.primary : colors.textSecondary }]}>Todas as linguagens</Text>
                </TouchableOpacity>
                {languages.map((lang: any) => {
                  const id = String(lang.id || lang._id);
                  return (
                    <TouchableOpacity
                      key={id}
                      style={[styles.chip, language === id && [styles.chipSelected, { borderColor: colors.primary }]]}
                      onPress={() => setLanguage(id)}
                    >
                      <Text style={[styles.chipText, { color: language === id ? colors.primary : colors.textSecondary }]}>{lang.name || lang.title}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.clearBtn, { borderColor: colors.border }]}
              onPress={() => {
                setDifficulty('all');
                setStatus('all');
                setLanguage('all');
              }}
            >
              <Text style={[styles.clearText, { color: colors.textSecondary }]}>Limpar Filtros</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.countText, { color: colors.textSecondary }]}>Mostrando {filteredChallenges.length} de {challenges.length} exercícios</Text>

        <View style={{ marginTop: 12, gap: 8 }}> 
          {filteredChallenges.map((ch, idx) => {
            const diffNum = Number(ch.difficulty ?? 1);
            const diffLabel = diffNum <= 1 ? 'Fácil' : diffNum === 2 ? 'Médio' : 'Difícil';
            const xp = ch.xp ?? ch.baseXp ?? 0;
            return (
              <DetailedChallengeCard
                key={String(ch.id || ch._id || idx)}
                title={ch.title || 'Desafio'}
                description={ch.description}
                difficulty={diffLabel}
                progress={ch.progress ?? 0}
                isPublic={Boolean(ch.isPublic ?? false)}
                xp={xp}
                onPress={() => {}}
              />
            );
          })}
          {filteredChallenges.length === 0 && (
            <View style={[styles.emptyBox, { borderColor: colors.border }]}> 
              <Text style={styles.emptyTitle}>Nenhum Desafio encontrado</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Tente ajustar os filtros para ver mais Desafios.</Text>
            </View>
          )}
        </View>

        {/* Modal Criar Desafio */}
        <Modal visible={showCreate} animationType="slide" onRequestClose={() => setShowCreate(false)}>
          <SafeAreaView style={commonStyles.container}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}> 
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={[styles.title, { color: colors.text }]}>
                {creating ? 'Criando...' : 'Criar Desafio'}
              </Text>
              <TouchableOpacity onPress={handleCreateChallenge} disabled={creating}>
                {creating ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}> 
              <View style={[styles.card, { backgroundColor: colors.card }]}> 
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Título *</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  value={formData.title}
                  onChangeText={(t) => setFormData({ ...formData, title: t })}
                  placeholder="Digite o título do desafio"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>Descrição</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text, height: 90 }]}
                  value={formData.description}
                  onChangeText={(t) => setFormData({ ...formData, description: t })}
                  placeholder="Descrição do desafio"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                />

                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>Dificuldade</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[1, 2, 3].map((value) => {
                    const label = value === 1 ? 'Fácil' : value === 2 ? 'Médio' : 'Difícil';
                    const color = value === 1 ? '#4CAF50' : value === 2 ? '#FF9800' : '#F44336';
                    return (
                      <TouchableOpacity
                        key={value}
                        style={[
                          { flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 2, alignItems: 'center' },
                          formData.difficulty === value && { backgroundColor: '#F0F8FF' },
                          { borderColor: color },
                        ]}
                        onPress={() => setFormData({ ...formData, difficulty: value })}
                      >
                        <Text style={[{ fontSize: 14, fontWeight: '600' }, formData.difficulty === value && { color }]}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>XP Base</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                  value={String(formData.xp)}
                  onChangeText={(t) => setFormData({ ...formData, xp: parseInt(t) || 0 })}
                  keyboardType="numeric"
                />

                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>Template de Código</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text, height: 120 }]}
                  value={formData.codeTemplate}
                  onChangeText={(t) => setFormData({ ...formData, codeTemplate: t })}
                  multiline
                />

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10 }}> 
                  <TouchableOpacity
                    style={[styles.checkbox, formData.isPublic && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                    onPress={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                  >
                    {formData.isPublic && <Text style={{ color: '#fff', fontWeight: '700' }}>✓</Text>}
                  </TouchableOpacity>
                  <Text style={{ color: colors.text }}>Desafio público (visível para todos)</Text>
                </View>
                <View style={{ height: 8 }} />
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backBtn: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  backText: { fontWeight: '600' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  title: { fontSize: 24, fontWeight: '800' },
  groupName: { marginTop: 4, fontSize: 14 },
  groupDesc: { marginTop: 4, fontSize: 12 },
  primaryButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  filterCard: { marginTop: 24, borderRadius: 14, padding: 16 },
  filterTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  filterRow: { gap: 12 },
  filterCol: { gap: 4 },
  filterLabel: { fontSize: 13 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  chipSelected: { backgroundColor: '#1A365D' },
  chipText: { fontSize: 12, fontWeight: '600' },
  clearBtn: { marginTop: 8, alignSelf: 'flex-start', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  clearText: { fontSize: 13, fontWeight: '600' },
  countText: { marginTop: 16, fontSize: 13 },
  emptyBox: { marginTop: 16, borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, padding: 24, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4, color: '#fff' },
  emptySubtitle: { fontSize: 13, textAlign: 'center' },
  card: { borderRadius: 14, padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 12 },
  input: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, borderWidth: 1 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
