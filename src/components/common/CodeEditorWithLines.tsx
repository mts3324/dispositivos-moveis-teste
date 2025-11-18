import React from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface CodeEditorWithLinesProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  minHeight?: number;
}

export default function CodeEditorWithLines({
  value,
  onChangeText,
  placeholder = '// Escreva seu código aqui...',
  editable = true,
  minHeight = 300,
}: CodeEditorWithLinesProps) {
  const { isDarkMode } = useTheme();
  const lineCount = value.split('\n').length;

  return (
    <View style={[styles.editorContainer, { backgroundColor: isDarkMode ? '#0c1220' : '#1e1e1e', minHeight }]}>
      <View style={[styles.lineNumbers, { backgroundColor: isDarkMode ? '#1e293b' : '#252526' }]}>
        {Array.from({ length: lineCount }, (_, i) => (
          <Text key={i + 1} style={[styles.lineNumber, { color: isDarkMode ? '#94a3b8' : '#858585' }]}>
            {i + 1}
          </Text>
        ))}
      </View>

      <TextInput
        style={[
          styles.codeInput,
          {
            color: isDarkMode ? '#e2e8f0' : '#d4d4d4',
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDarkMode ? '#64748b' : '#858585'}
        multiline
        textAlignVertical="top"
        spellCheck={false}
        autoCapitalize="none"
        autoCorrect={false}
        editable={editable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  editorContainer: {
    position: 'relative',
    paddingLeft: 60,
  },
  lineNumbers: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 50,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#0c1220',
    zIndex: 1,
  },
  lineNumber: {
    fontSize: 14,
    lineHeight: 22.4,
    textAlign: 'right',
    paddingRight: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  codeInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    lineHeight: 22.4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

