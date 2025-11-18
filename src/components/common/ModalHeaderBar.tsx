import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ModalHeaderBarProps {
  title: string;
  onClose: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
}

export default function ModalHeaderBar({
  title,
  onClose,
  onSave,
  isSaving = false,
  saveLabel = 'Salvar',
  cancelLabel = 'Cancelar',
}: ModalHeaderBarProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={onClose}>
        <Text style={[styles.cancelButton, { color: colors.textSecondary }]}>{cancelLabel}</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {onSave ? (
        <TouchableOpacity onPress={onSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.saveButton, { color: colors.primary }]}>{saveLabel}</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={{ width: 60 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  cancelButton: {
    fontSize: 16,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
});

