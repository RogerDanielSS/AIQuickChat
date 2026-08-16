// src/app/chats-list.tsx
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatListItem } from '@/components/chat-list-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { db } from '@/db';
import { chats } from '@/db/schema';
import { useTheme } from '@/hooks/use-theme';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ChatsListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pickerVisible, setPickerVisible] = useState(false);

  const { data: chatRows } = useLiveQuery(
    db.query.chats.findMany({
      with: { agent: true },
      orderBy: (chats, { desc }) => [desc(chats.updated_at)],
    })
  );

  const { data: agentList } = useLiveQuery(
    db.query.agents.findMany({
      orderBy: (agents, { asc }) => [asc(agents.created_at)],
    })
  );

  const openChat = (id: number) =>
    router.push({ pathname: '/chat/[id]', params: { id: String(id) } });

  const createChat = async (agentId: number) => {
    setPickerVisible(false);
    const [row] = await db
      .insert(chats)
      .values({ agent_id: agentId })
      .returning({ id: chats.id });
    openChat(row.id);
  };

  const handleNewChat = () => {
    if (agentList.length === 0) {
      Alert.alert(
        'Nenhum agente configurado',
        'Crie um agente com modelo e API key antes de iniciar um chat.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Configurar agente', onPress: () => router.push('/agents') },
        ]
      );
      return;
    }
    setPickerVisible(true);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.push('/agents')} hitSlop={8} style={styles.iconButtonText}>
              <Ionicons name="settings-outline" size={14} color={theme.text} /> 
              <ThemedText type="smallBold">Agentes</ThemedText>
            </Pressable>
          ),
        }}
      />

      <FlatList
        data={chatRows}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.six + Spacing.four },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
        ListEmptyComponent={
          <ThemedView style={styles.emptyState}>
            <ThemedText type="subtitle" style={styles.centerText}>
              Sem chats ainda
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
              Toque em “+ Novo chat” para começar uma conversa com seus agentes.
            </ThemedText>
          </ThemedView>
        }
        renderItem={({ item }) => (
          <ChatListItem
            title={item.title ?? 'Novo chat'}
            subtitle={
              item.agent ? `${item.agent.name} · ${item.agent.model_name}` : 'Agente removido'
            }
            timestamp={item.updated_at}
            onPress={() => openChat(item.id)}
          />
        )}
      />

      <Pressable
        onPress={handleNewChat}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: theme.text, bottom: insets.bottom + Spacing.four },
          pressed && styles.fabPressed,
        ]}>
        <Text style={[styles.fabLabel, { color: theme.background }]}>+ Novo chat</Text>
      </Pressable>

      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPickerVisible(false)} />
          <ThemedView type="backgroundElement" style={styles.modalCard}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Escolher agente
            </ThemedText>
            {agentList.map((agent) => (
              <Pressable
                key={agent.id}
                onPress={() => createChat(agent.id)}
                style={({ pressed }) => pressed && styles.pressed}>
                <ThemedView type="background" style={styles.agentRow}>
                  <ThemedText type="default">{agent.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {agent.model_name}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            ))}
            <Pressable
              onPress={() => {
                setPickerVisible(false);
                router.push('/agents');
              }}>
              <ThemedText type="linkPrimary" style={styles.manageLink}>
                Gerenciar agentes
              </ThemedText>
            </Pressable>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: {
    padding: Spacing.three,
    gap: Spacing.two,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  centerText: { textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabPressed: { opacity: 0.8 },
  fabLabel: { fontSize: 16, fontWeight: '600' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalTitle: { fontSize: 24, lineHeight: 32 },
  agentRow: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  iconButtonText: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: Spacing.one, padding: Spacing.one },
  pressed: { opacity: 0.7 },
  manageLink: { textAlign: 'center' },
});
