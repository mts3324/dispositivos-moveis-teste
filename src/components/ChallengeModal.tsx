import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import AttemptsService from '../services/AttemptsService';
import { 
  getDefaultTemplateFromExercise 
} from '../utils/judge0LanguageMapper';
import CodeEditorWithLines from './common/CodeEditorWithLines';
import CodeTestResult from './common/CodeTestResult';
import ChallengeTimer from './common/ChallengeTimer';
import ActionButton from './common/ActionButton';

interface ChallengeModalProps {
  exercise: {
    id: string;
    title: string;
    description: string;
    difficulty: number;
    baseXp: number;
    publicCode?: string;
    codeTemplate?: string;
    isCompleted?: boolean;
    languageId?: string | null;
    language?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
  onClose: () => void;
  onSubmit: (code: string, timeSpent: number) => Promise<void>;
  onTest: (code: string) => Promise<string>;
}

export default function ChallengeModal({
  exercise,
  onClose,
  onSubmit,
  onTest,
}: ChallengeModalProps) {
  const { colors, commonStyles, isDarkMode } = useTheme();
  const { user } = useAuth();

  const defaultCode = getDefaultTemplateFromExercise({
    languageId: exercise.languageId,
    language: exercise.language,
    codeTemplate: exercise.codeTemplate,
  });
  const [code, setCode] = useState(defaultCode);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isLoadingAttempt, setIsLoadingAttempt] = useState(true);
  const latestStateRef = useRef({ code: defaultCode, timeSpent: 0 });
  const skipAutoSaveRef = useRef(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    latestStateRef.current = { code, timeSpent };
  }, [code, timeSpent]);

  useEffect(() => {
    let canceled = false;
    setIsLoadingAttempt(true);

    (async () => {
      try {
        const attempt = await AttemptsService.getCurrent(exercise.id);
        if (!attempt || attempt.status !== 'IN_PROGRESS') {
          if (!canceled) setIsLoadingAttempt(false);
          return;
        }
        if (canceled) return;
        setCode(attempt.code || defaultCode);
        setTimeSpent(Math.floor((attempt.timeSpentMs ?? 0) / 1000));
        setLastSavedAt(attempt.updatedAt ? new Date(attempt.updatedAt) : null);
      } catch (error) {
        if (__DEV__) {
          console.error('Erro ao carregar rascunho do desafio:', error);
        }
      } finally {
        if (!canceled) {
          setIsLoadingAttempt(false);
        }
      }
    })();

    return () => {
      canceled = true;
      if (skipAutoSaveRef.current) return;
      const { code: latestCode, timeSpent: latestTime } = latestStateRef.current;
      const normalizedDefault = defaultCode.trim();
      const normalizedCurrent = (latestCode || '').trim();
      const hasProgress =
        (normalizedCurrent && normalizedCurrent !== normalizedDefault) || latestTime > 0;

      if (!hasProgress) return;

      AttemptsService.saveAttempt({
        exerciseId: exercise.id,
        code: latestCode,
        timeSpentMs: latestTime * 1000,
      }).catch(() => {});
    };
  }, [exercise.id, defaultCode]);


  const formatSavedLabel = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  };

  const handleSubmit = async () => {
    if (exercise.isCompleted) {
      Alert.alert('Desafio Concluído', 'Este desafio já foi concluído. Não é possível refazê-lo.');
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(code, timeSpent);
      skipAutoSaveRef.current = true;
    } catch (error) {
      if (__DEV__) {
        console.error('Erro durante a submissão do desafio:', error);
      }
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTest = async () => {
    if (exercise.isCompleted) {
      Alert.alert('Desafio Concluído', 'Este desafio já foi concluído. Não é possível testar novamente.');
      return;
    }

    setIsTesting(true);
    setTestError(null);
    try {
      const result = await onTest(code);
      setTestResult(result);
    } catch (error) {
      setTestResult(null);
      setTestError(
        error instanceof Error
          ? error.message
          : 'Não foi possível testar o código. Tente novamente.'
      );
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveDraft = async (closeAfter = false) => {
    if (exercise.isCompleted) {
      Alert.alert('Desafio Concluído', 'Este desafio já foi concluído. Não é possível salvar progresso.');
      if (closeAfter) {
        onClose();
      }
      return;
    }

    if (isSavingDraft) return;
    setIsSavingDraft(true);
    try {
      const saved = await AttemptsService.saveAttempt({
        exerciseId: exercise.id,
        code,
        timeSpentMs: timeSpent * 1000,
        status: 'IN_PROGRESS',
      });
      const updatedDate = saved?.updatedAt ? new Date(saved.updatedAt) : new Date();
      setLastSavedAt(updatedDate);
      if (closeAfter) {
        skipAutoSaveRef.current = true;
        onClose();
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Erro ao salvar progresso do desafio:', error);
      }
      if (!closeAfter) {
        Alert.alert('Erro', 'Não foi possível salvar seu progresso. Tente novamente.');
      }
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSaveAndExit = async () => {
    if (isSavingDraft) return;
    await handleSaveDraft(true);
  };

  const difficultyMap: Record<number, string> = {
    1: 'fácil',
    2: 'médio',
    3: 'difícil',
    4: 'expert',
    5: 'master',
  };

  const difficultyText = difficultyMap[exercise.difficulty] || 'médio';
  const codeToShow = exercise.publicCode ?? exercise.id;

  const difficultyColors: Record<string, string> = {
    fácil: '#43e97b',
    médio: '#f093fb',
    difícil: '#fa709a',
    expert: '#667eea',
    master: '#000000',
  };

  const difficultyColor = difficultyColors[difficultyText] || '#cbd5e0';

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[commonStyles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.headerLeft}>
            <Ionicons name="code" size={20} color="#fff" />
            <Text style={styles.headerTitle}>{exercise.title}</Text>
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
              <Text style={styles.difficultyBadgeText}>{difficultyText.toUpperCase()}</Text>
            </View>
            <View style={styles.codeBadge}>
              <Text style={styles.codeBadgeText}>Código: {codeToShow}</Text>
            </View>
          </View>
            <View style={styles.headerRight}>
              <ChallengeTimer seconds={timeSpent} variant="header" />
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.leftPanel, { backgroundColor: isDarkMode ? '#1e293b' : '#f8f9fa' }]}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#f8fafc' : '#2d3748' }]}>
                📋 Descrição do Desafio
              </Text>
              <Text style={[styles.description, { color: isDarkMode ? '#cbd5e1' : '#4a5568' }]}>
                {exercise.description}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#f8fafc' : '#2d3748' }]}>
                🎯 Objetivo
              </Text>
              <Text style={[styles.description, { color: isDarkMode ? '#cbd5e1' : '#4a5568' }]}>
                Resolva o desafio implementando uma solução eficiente e bem estruturada. Seu código será
                avaliado com base em correção, performance e boas práticas.
                {'\n\n'}
                <Text style={{ fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#1a202c' }}>
                  Recompensa:
                </Text>{' '}
                {exercise.baseXp} XP base + bônus por performance
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#f8fafc' : '#2d3748' }]}>
                💡 Dicas
              </Text>
              <Text style={[styles.description, { color: isDarkMode ? '#cbd5e1' : '#4a5568' }]}>
                • Leia o enunciado com atenção{'\n'}• Pense na solução antes de começar a codificar{'\n'}•
                Teste seu código com diferentes casos{'\n'}• Tempo mínimo: 10 minutos
              </Text>
            </View>
          </View>

          <View style={[styles.rightPanel, { backgroundColor: isDarkMode ? '#0c1220' : '#1e1e1e' }]}>
            <View style={[styles.editorHeader, { backgroundColor: isDarkMode ? '#1e293b' : '#2d2d2d' }]}>
              <View style={styles.editorHeaderLeft}>
                <Ionicons name="code" size={18} color={isDarkMode ? '#cbd5e1' : '#d4d4d4'} />
                <Text style={[styles.editorHeaderText, { color: isDarkMode ? '#cbd5e1' : '#d4d4d4' }]}>
                  Editor de Código
                </Text>
              </View>
            </View>

            <View style={styles.editorContainer}>
              {exercise.isCompleted ? (
                <View style={styles.completedOverlay}>
                  <Ionicons name="checkmark-circle" size={48} color="#10b981" />
                  <Text style={styles.completedTitle}>Desafio Concluído!</Text>
                  <Text style={styles.completedText}>
                    Você já completou este desafio com sucesso. Não é possível refazê-lo.
                  </Text>
                </View>
              ) : (
                <CodeEditorWithLines
                  value={code}
                  onChangeText={setCode}
                  editable={!exercise.isCompleted}
                />
              )}
            </View>

            <CodeTestResult
              result={testResult}
              error={testError}
              isTesting={isTesting}
            />
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: isDarkMode ? '#1e293b' : 'white', borderTopColor: colors.border }]}>
          <View style={styles.footerInfo}>
            <ChallengeTimer seconds={timeSpent} variant="footer" />
            <Text style={[styles.footerSaved, { color: isDarkMode ? '#cbd5e1' : '#4a5568' }]}>
              {isLoadingAttempt
                ? 'Carregando progresso salvo...'
                : lastSavedAt
                ? `Último salvamento: ${formatSavedLabel(lastSavedAt)}`
                : 'Rascunho ainda não salvo'}
            </Text>
          </View>
          <View style={styles.buttonGroup}>
            <ActionButton
              title={exercise.isCompleted ? 'Fechar' : 'Cancelar'}
              onPress={onClose}
              variant="secondary"
            />
            {!exercise.isCompleted && (
              <>
                <ActionButton
                  title={isSavingDraft ? 'Salvando...' : 'Salvar e sair'}
                  onPress={handleSaveAndExit}
                  variant="secondary"
                  disabled={isSavingDraft}
                  loading={isSavingDraft}
                />
                <ActionButton
                  title={isTesting ? 'Testando...' : 'Testar Código'}
                  onPress={handleTest}
                  variant="outline"
                  disabled={isTesting}
                  loading={isTesting}
                  icon="play-circle"
                />
                <ActionButton
                  title={isSubmitting ? 'Enviando...' : 'Submeter Solução'}
                  onPress={handleSubmit}
                  variant="primary"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  icon="checkmark-circle"
                />
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  difficultyBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  codeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  codeBadgeText: {
    color: '#fff',
    fontSize: 11,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  leftPanel: {
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#334155',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 400,
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0c1220',
  },
  editorHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editorHeaderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editorContainer: {
    flex: 1,
    position: 'relative',
  },
  completedOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 16,
    marginBottom: 8,
  },
  completedText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  footerInfo: {
    flex: 1,
  },
  footerSaved: {
    fontSize: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
});

