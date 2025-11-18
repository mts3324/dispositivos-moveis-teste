import React, { useEffect, useState, useCallback, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Alert,
  ActivityIndicator, 
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import ApiService from "../services/ApiService";
import ChallengeService from "../services/ChallengeService";
import { useFocusEffect } from '@react-navigation/native';
import DetailedChallengeCard from "../components/DetailedChallengeCard";
import CreateExerciseModal from "../components/CreateExerciseModal";


const difficultyOptions = [
  { value: 1, label: "Fácil", color: "#4CAF50" },
  { value: 2, label: "Médio", color: "#FF9800" },
  { value: 3, label: "Difícil", color: "#F44336" },
];

const ScreenHeader = ({ title, onAddPress }: { title: string; onAddPress: () => void }) => {
  const { colors, commonStyles } = useTheme();
  
  return (
    <View style={[commonStyles.header, styles.header]}>
      <Text style={[commonStyles.text, styles.title]}>{title}</Text>
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: colors.primary }]} 
        onPress={onAddPress}
      >
        <Text style={styles.addButtonText}>Criar</Text>
      </TouchableOpacity>
    </View>
  );
};

// Estilos para SolveChallengeModal
const modalStyles = StyleSheet.create({
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  timerContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  timerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  timerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  timerBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  timerBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  descriptionContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  codeEditorContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  codeEditorLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  codeEditor: {
    minHeight: 200,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
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
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

// Componente Modal para Resolver Desafio
const SolveChallengeModal = ({ challenge, onClose, colors, commonStyles }: any) => {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0); // em segundos
  const [isRunning, setIsRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!challenge) return;
    
    // Inicializar código com template
    setCode(challenge.codeTemplate || '// Seu código aqui\n');
    
    // Inicializar tempo (valor padrão fixo de 60 minutos, converter para segundos)
    // Nota: timeLimit não é suportado pelo backend, usando valor padrão
    const timeLimitMinutes = 60;
    setTimeLeft(timeLimitMinutes * 60);
    setIsRunning(true);
    startTimeRef.current = Date.now();

    // Timer countdown
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          Alert.alert('Tempo Esgotado!', 'O tempo limite foi atingido.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [challenge]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      Alert.alert('Erro', 'Por favor, escreva seu código antes de submeter.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Erro', 'Você precisa estar autenticado para submeter.');
      return;
    }

    setSubmitting(true);
    try {
      const timeSpent = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
      
      const result = await ApiService.submitChallenge({
        exerciseId: challenge.id || challenge._id || challenge.publicCode,
        code: code,
        languageId: challenge.languageId || '1', // Usar languageId do desafio ou padrão
      });

      // Parar o timer
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      const status = result.status || result.data?.status;
      const score = result.score || result.data?.score || 0;
      const xpAwarded = result.xpAwarded || result.data?.xpAwarded || 0;

      Alert.alert(
        status === 'ACCEPTED' || status === 'Accepted' ? 'Parabéns! 🎉' : 'Tente Novamente',
        status === 'ACCEPTED' || status === 'Accepted'
          ? `Sua solução foi aceita!\nPontuação: ${score}%\nXP Ganho: ${xpAwarded}`
          : `Sua solução não passou em todos os testes.\nPontuação: ${score}%`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error: any) {
      Alert.alert('Erro', ApiService.handleError(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (!challenge) return null;

  // Usar valor padrão fixo de 60 minutos (timeLimit não é suportado pelo backend)
  const timeLimitMinutes = 60;
  const timePercentage = (timeLeft / (timeLimitMinutes * 60)) * 100;

  return (
    <SafeAreaView style={[commonStyles.container, { backgroundColor: colors.background }]}>
      <View style={[modalStyles.modalHeader, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onClose}>
          <Text style={[modalStyles.cancelButton, { color: colors.textSecondary }]}>Fechar</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[modalStyles.modalTitle, { color: colors.text }]}>{challenge.title}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={[commonStyles.scrollView, { flex: 1 }]}>
        {/* Timer */}
        <View style={[modalStyles.timerContainer, { backgroundColor: colors.card }]}>
          <View style={modalStyles.timerHeader}>
            <Text style={[modalStyles.timerLabel, { color: colors.text }]}>Tempo Restante</Text>
            <Text style={[
              modalStyles.timerText, 
              { color: timeLeft < 300 ? '#F44336' : colors.primary } // Vermelho se menos de 5 min
            ]}>
              {formatTime(timeLeft)}
            </Text>
          </View>
          <View style={[modalStyles.timerBar, { backgroundColor: colors.border }]}>
            <View 
              style={[
                modalStyles.timerBarFill, 
                { 
                  width: `${timePercentage}%`, 
                  backgroundColor: timeLeft < 300 ? '#F44336' : colors.primary 
                }
              ]} 
            />
          </View>
        </View>

        {/* Descrição do Desafio */}
        {challenge.description && (
          <View style={[modalStyles.descriptionContainer, { backgroundColor: colors.card }]}>
            <Text style={[modalStyles.descriptionTitle, { color: colors.text }]}>Descrição</Text>
            <Text style={[modalStyles.descriptionText, { color: colors.textSecondary }]}>
              {challenge.description}
            </Text>
          </View>
        )}

        {/* Editor de Código */}
        <View style={[modalStyles.codeEditorContainer, { backgroundColor: colors.card }]}>
          <Text style={[modalStyles.codeEditorLabel, { color: colors.text }]}>Seu Código</Text>
          <TextInput
            style={[modalStyles.codeEditor, { 
              backgroundColor: colors.background, 
              color: colors.text, 
              borderColor: colors.border 
            }]}
            value={code}
            onChangeText={setCode}
            placeholder="// Escreva sua solução aqui"
            placeholderTextColor={colors.textSecondary}
            multiline
            textAlignVertical="top"
            editable={isRunning && timeLeft > 0}
          />
        </View>
      </ScrollView>

      {/* Botão de Submeter */}
      <View style={[modalStyles.submitContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            modalStyles.submitButton,
            { 
              backgroundColor: isRunning && timeLeft > 0 ? colors.primary : colors.textSecondary,
              opacity: (isRunning && timeLeft > 0 && !submitting) ? 1 : 0.5
            }
          ]}
          onPress={handleSubmit}
          disabled={!isRunning || timeLeft === 0 || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={modalStyles.submitButtonText}>
              {timeLeft === 0 ? 'Tempo Esgotado' : 'Submeter Solução'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default function ChallengesScreen() {
  const { commonStyles, colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, { openCreate?: boolean }>, string>>();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSolveModal, setShowSolveModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingChallenge, setDeletingChallenge] = useState<any>(null);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const handleAddPress = () => {
    setEditingChallenge(null);
    setShowCreateModal(true);
  };

  useFocusEffect(
    useCallback(() => {
      loadChallenges();
    }, [user?.id])
  );

  useEffect(() => {
    loadChallenges();
  }, [user]);

  useEffect(() => {
    if ((route.params as any)?.openCreate) {
      handleAddPress();
    }
  }, [route.params]);

  const loadChallenges = async () => {
    setInitialLoading(true);
    try {
      const response = await ApiService.getMyChallenges();
      const items = response?.items || response?.data || (Array.isArray(response) ? response : []);
      setChallenges(items);
    } catch (err) {
      Alert.alert("Erro", ApiService.handleError(err));
    } finally {
      setInitialLoading(false);
    }
  };

  const handleEditPress = (challenge: any) => {
    setEditingChallenge(challenge);
    setShowCreateModal(true);
  };

  const handleDeletePress = (challenge: any) => {
    setDeletingChallenge(challenge);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingChallenge) return;
    try {
      const challengeId = deletingChallenge.id || deletingChallenge._id;
      await ApiService.deleteChallenge(String(challengeId));
      if (ChallengeService.deleteChallenge) {
        try { await ChallengeService.deleteChallenge(String(challengeId)); } catch {}
      }
      setShowDeleteModal(false);
      setDeletingChallenge(null);
      await loadChallenges();
      Alert.alert('Sucesso', 'Desafio excluído com sucesso!');
    } catch (error: any) {
      setShowDeleteModal(false);
      setDeletingChallenge(null);
      Alert.alert('Erro', ApiService.handleError(error));
    }
  };

  const handleChallengePress = (challenge: any) => {
    const id = challenge?.id || challenge?._id;
    if (!id) return;
    // @ts-ignore
    navigation.navigate('ChallengeDetails', { exerciseId: String(id) });
  };

  const handleSaveChallenge = async (data: any) => {
    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }
    try {
      if (editingChallenge) {
        // Editar
        const challengeId = editingChallenge.id || editingChallenge._id;
        await ApiService.updateChallenge(String(challengeId), {
          title: data.title,
          description: data.description,
          difficulty: data.difficulty,
          xp: data.baseXp,
          isPublic: data.isPublic,
          codeTemplate: data.codeTemplate,
          languageId: data.languageId,
        });
        Alert.alert("Sucesso", "Desafio atualizado com sucesso!");
      } else {
        // Criar
        const created = await ApiService.createChallenge({
          title: data.title,
          subject: data.subject,
          description: data.description,
          difficulty: data.difficulty,
          xp: data.baseXp,
          isPublic: data.isPublic,
          codeTemplate: data.codeTemplate,
          languageId: data.languageId,
        });

        const ex = created?.exercise || created;
        const code = ex?.publicCode || ex?.public_code || ex?.code;
        const message = code
          ? `Desafio criado!\n\nCódigo do desafio: ${code}`
          : 'Desafio criado!';

        Alert.alert("Sucesso", message);
      }
      await loadChallenges();
      setShowCreateModal(false);
      setEditingChallenge(null);
    } catch (e: any) {
      Alert.alert("Erro", ApiService.handleError(e));
      throw e;
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando desafios...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScreenHeader 
        title="Meus Desafios" 
        onAddPress={handleAddPress}
      />
      
      <ScrollView style={[commonStyles.scrollView, styles.scrollView]}>
        {challenges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhum desafio criado ainda. Clique em "Criar" para começar!
            </Text>
          </View>
        ) : (
          challenges.map((challenge, idx) => {
            const diffNum = Number(challenge.difficulty ?? 1);
            // Backend retorna difficulty como número (1-5), mas o componente espera string
            const diffLabel = typeof challenge.difficulty === 'number' 
              ? difficultyOptions.find(d => d.value === challenge.difficulty)?.label || 'Fácil'
              : diffNum <= 1 ? 'Fácil' : diffNum === 2 ? 'Médio' : 'Difícil';
            const xp = challenge.baseXp || challenge.xp || 0; // Backend retorna 'baseXp', mas mantém compatibilidade
            const code = challenge.publicCode || challenge.public_code || challenge.code;
            return (
              <DetailedChallengeCard
                key={String(challenge.id || challenge._id || idx)}
                title={challenge.title}
                description={challenge.description}
                difficulty={diffLabel}
                progress={challenge.progress}
                isPublic={challenge.isPublic}
                xp={xp}
                code={code}
                onPress={() => handleChallengePress(challenge)}
                onEdit={() => handleEditPress(challenge)}
                onDelete={() => handleDeletePress(challenge)}
                onCopyCode={code ? () => handleCopyCode(code) : undefined}
              />
            );
          })
        )}
      </ScrollView>
      
      <CreateExerciseModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingChallenge(null);
        }}
        onSubmit={handleSaveChallenge}
        exercise={editingChallenge}
      />

      {/* Modal para Resolver Desafio */}
      <Modal
        visible={showSolveModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SolveChallengeModal
          challenge={selectedChallenge}
          onClose={() => {
            setShowSolveModal(false);
            setSelectedChallenge(null);
          }}
          colors={colors}
          commonStyles={commonStyles}
        />
      </Modal>

      {/* Modal para Confirmar Exclusão */}
      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent
      >
        <View style={styles.overlay}> 
          <View style={[styles.confirmBox, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <Text style={[styles.confirmTitle, { color: colors.text }]}>Excluir Desafio</Text>
            <Text style={[styles.confirmDesc, { color: colors.textSecondary }]}>Tem certeza que deseja excluir {deletingChallenge?.title ? `"${deletingChallenge.title}"` : 'este desafio'}?</Text>
            <View style={styles.confirmActions}> 
              <TouchableOpacity style={[styles.cancelBtn]} onPress={() => { setShowDeleteModal(false); setDeletingChallenge(null); }}>
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.deleteBtn]} onPress={confirmDelete}>
                <Text style={styles.deleteText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmBox: {
    width: '86%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  confirmTitle: { fontSize: 18, fontWeight: '800' },
  confirmDesc: { marginTop: 8, fontSize: 13 },
  confirmActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 16 },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#F44336', borderRadius: 8 },
  cancelText: { fontWeight: '700' },
  deleteText: { color: '#fff', fontWeight: '700' },
  scrollView: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  challengeCard: {
    borderRadius: 12,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  challengeContent: {
    padding: 16,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "600",
  },
  challengeDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  challengeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
  },
  challengeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  xpText: {
    fontSize: 12,
    fontWeight: "600",
  },
  visibilityText: {
    fontSize: 12,
    fontWeight: "500",
  },
  challengeActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
  },
  actionButton: {
    padding: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    fontSize: 16,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  codeInput: {
    fontFamily: "monospace",
    height: 120,
  },
  difficultySelector: {
    flexDirection: "row",
    gap: 8,
  },
  difficultyOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
  },
  difficultyOptionSelected: {
    backgroundColor: "#F0F8FF",
  },
  difficultyOptionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: "#4A90E2",
  },
  checkmark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 16,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});

  const handleCopyCode = async (code?: string) => {
    if (!code) return;
    try {
      if (Platform.OS === 'web' && (navigator as any)?.clipboard) {
        await (navigator as any).clipboard.writeText(String(code));
        Alert.alert('Copiado', 'Código copiado para a área de transferência');
        return;
      }
      Alert.alert('Código do desafio', String(code));
    } catch {
      Alert.alert('Código do desafio', String(code));
    }
  };