import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import CodeEditorWithLines from './CodeEditorWithLines';
import CodeTestResult from './CodeTestResult';

interface ChallengeEditorPanelProps {
  code: string;
  onCodeChange: (code: string) => void;
  onTest?: () => void;
  testResult?: string | null;
  testError?: string | null;
  isTesting?: boolean;
  editable?: boolean;
  showTestButton?: boolean;
}

export default function ChallengeEditorPanel({
  code,
  onCodeChange,
  onTest,
  testResult,
  testError,
  isTesting = false,
  editable = true,
  showTestButton = true,
}: ChallengeEditorPanelProps) {
  const { colors, isDarkMode } = useTheme();

  return (
    <View style={[styles.editorPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.editorHeader, { backgroundColor: isDarkMode ? '#1e293b' : '#2d2d2d' }]}>
        <View style={styles.editorHeaderLeft}>
          <Ionicons name="code" size={18} color={isDarkMode ? '#cbd5e1' : '#d4d4d4'} />
          <Text style={[styles.editorHeaderText, { color: isDarkMode ? '#cbd5e1' : '#d4d4d4' }]}>
            Editor de Código
          </Text>
        </View>
        {showTestButton && onTest && (
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: colors.primary }]}
            onPress={onTest}
            disabled={isTesting}
          >
            <Ionicons name="play-circle" size={16} color="#fff" />
            <Text style={styles.testButtonText}>{isTesting ? 'Testando...' : 'Testar Código'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <CodeEditorWithLines value={code} onChangeText={onCodeChange} editable={editable} />

      {(testResult || testError || isTesting) && (
        <CodeTestResult result={testResult} error={testError} isTesting={isTesting} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  editorPanel: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
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
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

