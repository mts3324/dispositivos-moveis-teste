import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface CodeTestResultProps {
  result?: string | null;
  error?: string | null;
  isTesting?: boolean;
}

export default function CodeTestResult({ result, error, isTesting = false }: CodeTestResultProps) {
  const { isDarkMode } = useTheme();

  return (
    <View style={[styles.testOutput, { backgroundColor: isDarkMode ? '#0f172a' : '#111827' }]}>
      <View style={styles.testOutputHeader}>
        <Ionicons name="code" size={16} color={isDarkMode ? '#cbd5e1' : '#e2e8f0'} />
        <Text style={[styles.testOutputHeaderText, { color: isDarkMode ? '#cbd5e1' : '#e2e8f0' }]}>
          {error ? 'Erro' : 'Resultado do Teste'}
        </Text>
      </View>
      
      {isTesting && (
        <Text style={[styles.testPlaceholder, { color: isDarkMode ? '#94a3b8' : '#94a3b8' }]}>
          Executando seu código...
        </Text>
      )}
      
      {!isTesting && error && (
        <View style={[styles.errorMessage, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
          <Text style={[styles.errorMessageText, { color: '#f87171' }]}>{error}</Text>
        </View>
      )}
      
      {!isTesting && result && !error && (
        <View style={[styles.testResultContainer, { backgroundColor: isDarkMode ? '#111c2e' : '#1f2a3a' }]}>
          <Text style={[styles.testResultText, { color: isDarkMode ? '#cbd5e1' : '#e2e8f0' }]}>
            {result}
          </Text>
        </View>
      )}
      
      {!isTesting && !result && !error && (
        <Text style={[styles.testPlaceholder, { color: isDarkMode ? '#94a3b8' : '#94a3b8' }]}>
          Execute um teste para visualizar a saída do seu código.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  testOutput: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  testOutputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  testOutputHeaderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  testPlaceholder: {
    fontSize: 14,
  },
  errorMessage: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorMessageText: {
    fontSize: 14,
  },
  testResultContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e2f47',
  },
  testResultText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

