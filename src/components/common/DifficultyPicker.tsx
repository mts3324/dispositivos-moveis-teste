import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface DifficultyPickerProps {
  value?: number;
  onChange: (value: number) => void;
  options?: Array<{ value: number; label: string }>;
}

const DEFAULT_OPTIONS = [
  { value: 1, label: 'Fácil' },
  { value: 2, label: 'Médio' },
  { value: 3, label: 'Intermediário' },
  { value: 4, label: 'Difícil' },
  { value: 5, label: 'Profissional' },
];

export default function DifficultyPicker({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
}: DifficultyPickerProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.difficultySelector}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.difficultyOption,
            value === option.value && styles.difficultyOptionSelected,
            { borderColor: colors.primary },
          ]}
          onPress={() => onChange(option.value)}
        >
          <Text
            style={[
              styles.difficultyOptionText,
              value === option.value && { color: colors.primary },
              { color: colors.text },
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  difficultySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  difficultyOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: 80,
    alignItems: 'center',
  },
  difficultyOptionSelected: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  difficultyOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

