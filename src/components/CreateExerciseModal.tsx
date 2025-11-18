import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import LanguagesService from '../services/LanguagesService';
import Judge0Service from '../services/Judge0Service';
import type { Language } from '../services/LanguagesService';
import { 
  getJudge0LanguageIdFromExercise, 
  getDefaultTemplateFromExercise,
} from '../utils/judge0LanguageMapper';
import ModalHeaderBar from './common/ModalHeaderBar';
import FormTextField from './common/FormTextField';
import DifficultyPicker from './common/DifficultyPicker';
import LanguagePicker from './common/LanguagePicker';
import ChallengeEditorPanel from './common/ChallengeEditorPanel';

export interface CreateExerciseData {
  title: string;
  subject: string;
  description: string;
  difficulty?: number;
  baseXp: number;
  codeTemplate: string;
  isPublic: boolean;
  languageId?: string;
}

interface CreateExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExerciseData) => Promise<void>;
  codeTemplate?: string;
  exercise?: any; // Para edição
}

export default function CreateExerciseModal({
  isOpen,
  onClose,
  onSubmit,
  codeTemplate,
  exercise,
}: CreateExerciseModalProps) {
  const { user } = useAuth();
  const { colors, commonStyles, isDarkMode } = useTheme();
  const isAdmin = user?.role === 'ADMIN';

  const [formData, setFormData] = useState<CreateExerciseData>({
    title: '',
    subject: '',
    description: '',
    difficulty: undefined,
    baseXp: 100,
    codeTemplate: codeTemplate || '// start coding...',
    isPublic: true,
    languageId: undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLanguages();
      if (exercise) {
        setFormData({
          title: exercise.title || '',
          subject: exercise.subject || '',
          description: exercise.description || '',
          difficulty: exercise.difficulty,
          baseXp: exercise.baseXp || 100,
          codeTemplate: getDefaultTemplateFromExercise({
            languageId: exercise.languageId,
            language: exercise.language,
            codeTemplate: exercise.codeTemplate,
          }),
          isPublic: exercise.isPublic !== false,
          languageId: exercise.languageId || undefined,
        });
      } else {
        setFormData({
          title: '',
          subject: '',
          description: '',
          difficulty: undefined,
          baseXp: 100,
          codeTemplate: codeTemplate || '// start coding...',
          isPublic: true,
          languageId: undefined,
        });
      }
      setFormError('');
      setTestResult(null);
      setTestError(null);
    }
  }, [isOpen, exercise, codeTemplate]);

  const loadLanguages = async () => {
    setLoadingLanguages(true);
    try {
      const langs = await LanguagesService.getAll();
      setLanguages(langs);
      
      if (!formData.languageId && langs.length > 0) {
        const javaLanguage = langs.find(l => 
          l.name.toLowerCase() === 'java' || 
          l.slug === 'java' ||
          l.slug === 'java-lang'
        );
        const cLanguage = langs.find(l => 
          l.name.toLowerCase() === 'c' || 
          l.slug === 'c' ||
          l.slug === 'c-lang'
        );
        const bashLanguage = langs.find(l => 
          l.name.toLowerCase() === 'bash' || 
          l.slug === 'bash' ||
          l.slug === 'shell'
        );
        const pythonLanguage = langs.find(l => 
          l.name.toLowerCase() === 'python' || 
          l.slug === 'python'
        );
        
          const defaultLanguage = javaLanguage || cLanguage || bashLanguage || pythonLanguage || langs[0];
          if (defaultLanguage) {
            setFormData(prev => {
              const newData = { ...prev, languageId: defaultLanguage.id };
              
              if (!prev.codeTemplate || prev.codeTemplate === '// start coding...') {
                const template = getDefaultTemplateFromExercise({
                  languageId: defaultLanguage.id,
                  language: defaultLanguage,
                });
                newData.codeTemplate = template;
              }
              
              return newData;
            });
          }
      }
    } catch (error) {
      console.warn('Erro ao carregar linguagens:', error);
    } finally {
      setLoadingLanguages(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.title.trim() ||
      !formData.subject.trim() ||
      !formData.description.trim() ||
      formData.difficulty === undefined ||
      formData.difficulty === null ||
      !formData.languageId
    ) {
      setFormError('Preencha todos os campos obrigatórios: Título, Assunto, Descrição, Dificuldade e Linguagem.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error: any) {
      setFormError(error?.message || 'Erro ao salvar desafio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      subject: '',
      description: '',
      difficulty: undefined,
      baseXp: 100,
      codeTemplate: codeTemplate || '// start coding...',
      isPublic: true,
      languageId: undefined,
    });
    setFormError('');
    setTestResult(null);
    setTestError(null);
    onClose();
  };

  const handleInputChange = (field: keyof CreateExerciseData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTestCode = async () => {
    if (!formData.codeTemplate.trim()) {
      setTestError('Digite algum código para testar');
      setTestResult(null);
      return;
    }

    setIsTesting(true);
    setTestError(null);
    setTestResult(null);

    try {
      const selectedLanguage = languages.find(l => l.id === formData.languageId);
      const judge0LanguageId = getJudge0LanguageIdFromExercise({
        languageId: formData.languageId,
        language: selectedLanguage || null,
      });

      const compileResult = await Judge0Service.executeCode(formData.codeTemplate, judge0LanguageId);

      if (!compileResult.sucesso) {
        throw new Error(compileResult.resultado || 'Erro na execução do código');
      }

      setTestResult(compileResult.resultado || 'Código executado com sucesso!');
    } catch (error: any) {
      setTestResult(null);
      setTestError(error?.message || 'Não foi possível testar o código. Tente novamente.');
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[commonStyles.container, { backgroundColor: colors.background }]}>
        <ModalHeaderBar
          title={exercise ? 'Editar Desafio' : 'Criar Novo Desafio'}
          onClose={handleClose}
          onSave={handleSubmit}
          isSaving={isSubmitting}
        />

        <ScrollView style={[commonStyles.scrollView, styles.scrollView]}>
          <View style={styles.formContainer}>
            <FormTextField
              label="Título"
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
              placeholder="Digite o título do Desafio"
              required
            />

            <FormTextField
              label="Assunto"
              value={formData.subject}
              onChangeText={(text) => handleInputChange('subject', text)}
              placeholder="Ex: Desenvolvimento Web, Backend, Frontend..."
              required
            />

            <FormTextField
              label="Descrição"
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              placeholder="Descreva o Desafio..."
              multiline
              numberOfLines={3}
              required
            />

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.text }]}>Dificuldade *</Text>
                <DifficultyPicker
                  value={formData.difficulty}
                  onChange={(value) => handleInputChange('difficulty', value)}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <FormTextField
                  label="XP Base"
                  value={String(formData.baseXp)}
                  onChangeText={(text) => handleInputChange('baseXp', parseInt(text) || 0)}
                  placeholder="100"
                  keyboardType="numeric"
                  required
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Linguagem *</Text>
              <LanguagePicker
                languages={languages}
                selectedLanguageId={formData.languageId}
                onSelect={(languageId) => handleInputChange('languageId', languageId)}
                loading={loadingLanguages}
              />
            </View>

            {formError ? (
              <View style={[styles.errorContainer, { backgroundColor: colors.card, borderColor: '#F44336' }]}>
                <Text style={[styles.errorText, { color: '#F44336' }]}>{formError}</Text>
              </View>
            ) : null}

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  formData.isPublic && styles.checkboxSelected,
                  { borderColor: colors.primary },
                  formData.isPublic && { backgroundColor: colors.primary },
                ]}
                onPress={() => handleInputChange('isPublic', !formData.isPublic)}
              >
                {formData.isPublic && <Ionicons name="checkmark" size={16} color="#fff" />}
              </TouchableOpacity>
              <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                Desafio público (visível para todos)
              </Text>
            </View>
          </View>

          <ChallengeEditorPanel
            code={formData.codeTemplate}
            onCodeChange={(text) => handleInputChange('codeTemplate', text)}
            onTest={handleTestCode}
            testResult={testResult}
            testError={testError}
            isTesting={isTesting}
            showTestButton={true}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    padding: 16,
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    borderColor: '#4A90E2',
  },
  checkboxLabel: {
    fontSize: 14,
    flex: 1,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
  },
});

