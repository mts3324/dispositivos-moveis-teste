import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import ApiService from '../services/ApiService';
import { useNavigation } from '@react-navigation/native';

type Group = {
  id: string;
  name: string;
  description?: string;
  isPublic?: boolean;
  members?: any[];
  membersCount?: number;
  createdAt?: string;
  ownerId?: string;
};

export default function GroupsScreen() {
  const { colors, isDarkMode, commonStyles } = useTheme();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  const [tab, setTab] = useState<'public' | 'mine'>('public');
  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupPublic, setNewGroupPublic] = useState(true);

  async function loadData(initial = false) {
    try {
      if (initial) setLoading(true);
      const [allRes, mineRes] = await Promise.all([
        ApiService.getGroups(),
        ApiService.getMyGroups(),
      ]);
      setPublicGroups(Array.isArray(allRes?.items) ? allRes.items : (Array.isArray(allRes) ? allRes : []));
      setMyGroups(Array.isArray(mineRes?.items) ? mineRes.items : (Array.isArray(mineRes) ? mineRes : []));
    } catch (err) {
      console.log('Erro ao carregar grupos:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData(true);
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
  }

  async function handleCreateGroup() {
    if (!newGroupName.trim()) return;
    try {
      setLoading(true);
      await ApiService.createGroup({
        name: newGroupName.trim(),
        description: newGroupDesc.trim() || undefined,
        isPublic: newGroupPublic,
      });
      setCreateOpen(false);
      setNewGroupName('');
      setNewGroupDesc('');
      setNewGroupPublic(true);
      await loadData();
      setTab('mine');
    } catch (err) {
      console.log('Erro ao criar grupo:', err);
    } finally {
      setLoading(false);
    }
  }

  function renderGroupItem({ item }: { item: Group }) {
    const memberCount = (item as any).memberCount ?? item.membersCount ?? (Array.isArray(item.members) ? item.members.length : 0);
    const createdLabel = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';

    return (
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600' }}>{item.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {item.isPublic ? (
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Público</Text>
            ) : (
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Privado</Text>
            )}
          </View>
        </View>

        {item.description ? (
          <Text style={{ color: colors.textSecondary, marginTop: 8 }}>{item.description}</Text>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="people" size={16} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
              {memberCount} {memberCount === 1 ? 'membro' : 'membros'}
            </Text>
          </View>
          {createdLabel ? (
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Criado em: {createdLabel}</Text>
          ) : null}
        </View>

        <View style={{ flexDirection: isSmallScreen ? 'column' : 'row', marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => {
              // @ts-ignore
              navigation.navigate('GroupDetails', { groupId: String(item.id) });
            }}
            style={{
              minHeight: 44,
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 8,
              backgroundColor: isDarkMode ? '#2A2A2A' : '#EFEFEF',
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              ...(isSmallScreen ? { marginBottom: 8 } : { marginRight: 12 }),
            }}
          >
            <Text style={{ color: colors.text }}>Ver Detalhes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              try {
                await ApiService.joinGroup(item.id);
                await loadData();
                // @ts-ignore
                navigation.navigate('GroupDetails', { groupId: String(item.id) });
              } catch (err) {
                console.log('Erro ao acessar grupo:', err);
              }
            }}
            style={{
              minHeight: 44,
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 8,
              backgroundColor: colors.primary,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              ...(isSmallScreen ? {} : { }),
              gap: 6,
            }}
          >
            <Text style={{ color: isDarkMode ? '#1A1A1A' : '#fff', fontWeight: '600' }}>Acessar</Text>
            <Ionicons name="arrow-forward" size={16} color={isDarkMode ? '#1A1A1A' : '#fff'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const data = tab === 'public' ? publicGroups : myGroups;

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700' }}>{'{'} Grupos de Estudo {'}'}</Text>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => setTab('public')}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 999,
              backgroundColor: tab === 'public' ? colors.primary : (isDarkMode ? '#2A2A2A' : '#EFEFEF'),
            }}
          >
            <Text style={{ color: tab === 'public' ? (isDarkMode ? '#1A1A1A' : '#fff') : colors.text }}>Grupos Públicos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab('mine')}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 999,
              backgroundColor: tab === 'mine' ? colors.primary : (isDarkMode ? '#2A2A2A' : '#EFEFEF'),
            }}
          >
            <Text style={{ color: tab === 'mine' ? (isDarkMode ? '#1A1A1A' : '#fff') : colors.text }}>Meus Grupos</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            onPress={() => setCreateOpen(true)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 10,
              backgroundColor: colors.primary,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Ionicons name="add" size={20} color={isDarkMode ? '#1A1A1A' : '#fff'} />
            <Text style={{ color: isDarkMode ? '#1A1A1A' : '#fff', fontWeight: '600' }}>Criar Novo Grupo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View style={{ padding: 16 }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        renderItem={renderGroupItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? (
            <View style={{ padding: 16 }}>
              <Text style={{ color: colors.textSecondary }}>
                {tab === 'public' ? 'Nenhum grupo público encontrado.' : 'Você ainda não participa de nenhum grupo.'}
              </Text>
            </View>
          ) : null
        }
      />

      <Modal visible={createOpen} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Criar novo grupo</Text>

            <Text style={{ color: colors.text, marginBottom: 6 }}>Nome</Text>
            <TextInput
              value={newGroupName}
              onChangeText={setNewGroupName}
              placeholder="Nome do grupo"
              placeholderTextColor={colors.textSecondary}
              style={{
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors.text,
                backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
                marginBottom: 10,
              }}
            />

            <Text style={{ color: colors.text, marginBottom: 6 }}>Descrição (opcional)</Text>
            <TextInput
              value={newGroupDesc}
              onChangeText={setNewGroupDesc}
              placeholder="Breve descrição"
              placeholderTextColor={colors.textSecondary}
              style={{
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors.text,
                backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
                marginBottom: 10,
              }}
            />

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => setNewGroupPublic(true)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  backgroundColor: newGroupPublic ? colors.primary : (isDarkMode ? '#2A2A2A' : '#EFEFEF'),
                }}
              >
                <Text style={{ color: newGroupPublic ? (isDarkMode ? '#1A1A1A' : '#fff') : colors.text }}>Público</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setNewGroupPublic(false)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  backgroundColor: !newGroupPublic ? colors.primary : (isDarkMode ? '#2A2A2A' : '#EFEFEF'),
                }}
              >
                <Text style={{ color: !newGroupPublic ? (isDarkMode ? '#1A1A1A' : '#fff') : colors.text }}>Privado</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: isSmallScreen ? 'column' : 'row', marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => setCreateOpen(false)}
                style={{
                  minHeight: 44,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 8,
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#EFEFEF',
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  ...(isSmallScreen ? { marginBottom: 8 } : { marginRight: 12 }),
                }}
              >
                <Text style={{ color: colors.text }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreateGroup}
                style={{
                  minHeight: 44,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: isDarkMode ? '#1A1A1A' : '#fff', fontWeight: '600' }}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}