import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import ApiService from "../services/ApiService";

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
}

export default function CreateGroupModal({ visible, onClose, onCreated }: CreateGroupModalProps) {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      Alert.alert("Erro", "Informe o nome do grupo");
      return;
    }
    try {
      setCreating(true);
      await ApiService.createGroup({ name: name.trim(), description: description.trim() || undefined, isPublic });
      setName("");
      setDescription("");
      setIsPublic(true);
      if (onCreated) await onCreated();
      Alert.alert("Sucesso", "Grupo criado com sucesso");
      onClose();
    } catch (err: any) {
      Alert.alert("Erro", ApiService.handleError(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.card }]}> 
          <Text style={[styles.modalTitle, { color: colors.text }]}>Criar Grupo</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="Nome do grupo"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text, height: 90 }]}
            placeholder="Descrição (opcional)"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <View style={styles.modalRow}> 
            <TouchableOpacity style={[styles.choiceBtn, isPublic && { borderColor: colors.primary }]} onPress={() => setIsPublic(true)}>
              <Text style={[styles.choiceText, { color: isPublic ? colors.primary : colors.textSecondary }]}>Público</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.choiceBtn, !isPublic && { borderColor: colors.primary }]} onPress={() => setIsPublic(false)}>
              <Text style={[styles.choiceText, { color: !isPublic ? colors.primary : colors.textSecondary }]}>Privado</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalActions}> 
            <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.primary }]} onPress={onClose} disabled={creating}>
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: creating ? 0.7 : 1 }]} onPress={handleCreate} disabled={creating}>
              <Text style={styles.primaryButtonText}>{creating ? 'Criando...' : 'Criar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalCard: { width: '100%', maxWidth: 560, borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 },
  modalRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  choiceBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  choiceText: { fontWeight: '700' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 6 },
  primaryButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  secondaryButtonText: { fontWeight: '700' },
});
