import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/ApiService';
import Judge0Service from '../services/Judge0Service';
import SubmissionsService from '../services/SubmissionsService';
import AttemptsService from '../services/AttemptsService';
import ChallengeModal from '../components/ChallengeModal';
import { getJudge0LanguageIdFromExercise } from '../utils/judge0LanguageMapper';
import { RootStackParamList } from '../navigation/AppNavigator';

type ChallengeDetailsRoute = RouteProp<RootStackParamList, 'ChallengeDetails'>;

export default function ChallengeDetailsScreen() {
  const { colors, commonStyles } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<ChallengeDetailsRoute>();
  const { exerciseId } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const challengeData = await ApiService.getChallengeById(exerciseId);
        if (!mounted) return;
        setChallenge(challengeData);
        setShowModal(true);
      } catch (err: any) {
        if (!mounted) return;
        setError(ApiService.handleError(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [exerciseId]);

  const handleTestChallenge = async (code: string) => {
    try {
      // Obter o ID do Judge0 baseado na linguagem do exercício
      const judge0LanguageId = getJudge0LanguageIdFromExercise({
        languageId: challenge.languageId,
        language: challenge.language,
      });
      
      const compileResult = await Judge0Service.executeCode(code, judge0LanguageId);

      if (!compileResult.sucesso) {
        throw new Error(compileResult.resultado || 'Erro na execução do código');
      }

      return compileResult.resultado;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.details?.resultado ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'Erro ao testar o código';
      throw new Error(errorMessage);
    }
  };

  const handleSubmitChallenge = async (code: string, timeSpent: number) => {
    if (!challenge || !user) return;

    if (challenge.isCompleted) {
      Alert.alert('Desafio Concluído', 'Este desafio já foi concluído. Não é possível refazê-lo.');
      setShowModal(false);
      return;
    }

    try {
      // Obter o ID do Judge0 baseado na linguagem do exercício
      const judge0LanguageId = getJudge0LanguageIdFromExercise({
        languageId: challenge.languageId,
        language: challenge.language,
      });
      
      const compileResult = await Judge0Service.executeCode(code, judge0LanguageId);

      if (!compileResult.sucesso) {
        Alert.alert('Erro na compilação', compileResult.resultado);
        return;
      }

      const score = 100;
      const timeSpentMs = timeSpent * 1000;

      const submission = await SubmissionsService.create({
        exerciseId: challenge.id || challenge._id,
        code: code,
        score: score,
        timeSpentMs: timeSpentMs,
      });

      Alert.alert(
        'Sucesso!',
        `Código compilado e submetido com sucesso!\n\nResultado:\n${compileResult.resultado}\n\nScore: ${score}%`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

      if (submission.status === 'ACCEPTED') {
        await AttemptsService.deleteAttempt(challenge.id || challenge._id).catch(() => {});
      }

      setShowModal(false);
      navigation.goBack();
    } catch (error: any) {
      const errorMessage = error?.message || error?.error?.message || 'Erro desconhecido';
      if (errorMessage.includes('já foi concluído') || errorMessage.includes('não é possível refazê-lo')) {
        Alert.alert('Erro', errorMessage);
        setShowModal(false);
        navigation.goBack();
        return;
      }
      Alert.alert('Erro ao submeter desafio', errorMessage);
      throw error;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[commonStyles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando desafio...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !challenge) {
    return (
      <SafeAreaView style={[commonStyles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error || 'Desafio não encontrado'}
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      {showModal && challenge && (
        <ChallengeModal
          exercise={{
            id: challenge.id || challenge._id,
            title: challenge.title,
            description: challenge.description || '',
            difficulty: challenge.difficulty || 1,
            baseXp: challenge.baseXp || challenge.xp || 100,
            publicCode: challenge.publicCode,
            codeTemplate: challenge.codeTemplate,
            isCompleted: challenge.isCompleted,
            languageId: challenge.languageId,
          }}
          onClose={() => {
            setShowModal(false);
            navigation.goBack();
          }}
          onSubmit={handleSubmitChallenge}
          onTest={handleTestChallenge}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timerContainer: {
    padding: 16,
    borderRadius: 8,
    margin: 16,
    marginBottom: 12,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timerBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  timerBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  challengeInfo: {
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  challengeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  difficultyBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    marginRight: 8,
    marginBottom: 8,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  languageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  languageBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  codeEditorContainer: {
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  codeEditorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  codeEditor: {
    minHeight: 300,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  submitContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  submitButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
