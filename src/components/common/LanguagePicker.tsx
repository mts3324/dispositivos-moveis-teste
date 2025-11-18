import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import type { Language } from '../../services/LanguagesService';

interface LanguagePickerProps {
  languages: Language[];
  selectedLanguageId?: string;
  onSelect: (languageId: string) => void;
  loading?: boolean;
}

export default function LanguagePicker({
  languages,
  selectedLanguageId,
  onSelect,
  loading = false,
}: LanguagePickerProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.selectContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              style={[
                styles.languageOption,
                selectedLanguageId === lang.id && styles.languageOptionSelected,
                { borderColor: colors.primary },
              ]}
              onPress={() => onSelect(lang.id)}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  selectedLanguageId === lang.id && { color: colors.primary },
                  { color: colors.text },
                ]}
              >
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  selectContainer: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  languageOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    marginRight: 8,
  },
  languageOptionSelected: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  languageOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

