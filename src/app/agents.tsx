// src/app/agents.tsx
import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AgentFormModal } from '@/components/agent-form-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { db } from '@/db';
import { agents, type Agent } from '@/db/schema';
import { maskApiKey } from '@/utils/formatters';

export default function AgentsScreen() {
  const [editing, setEditing] = useState<Agent | null>(null);
  const [formVisible, setFormVisible] = useState(false);

  const { data: agentList } = useLiveQuery(
    db.query.agents.findMany({
      orderBy: (agents, { asc }) => [asc(agents.created_at)],
    })
  );

  const openCreate = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const openEdit = (agent: Agent) => {
    setEditing(agent);
    setFormVisible(true);
  };

  const handleDelete = (agent: Agent) => {
    Alert.alert(
      'Excluir agente',
      `Excluir "${agent.name}"? Os chats criados com ele serão mantidos, mas ficarão sem agente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => void db.delete(agents).where(eq(agents.id, agent.id)),
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={openCreate} hitSlop={8} style={styles.iconButtonText}>
              <ThemedText type="smallBold">+ Novo</ThemedText>
            </Pressable>
          ),
        }}
      />

      <FlatList
        data={agentList}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
        ListEmptyComponent={
          <ThemedView style={styles.emptyState}>
            <ThemedText type="subtitle" style={styles.centerText}>
              Sem agentes ainda
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
              Configure um modelo e uma API key para começar. Toque em “+ Novo” no topo.
            </ThemedText>
          </ThemedView>
        }
        renderItem={({ item }) => (
          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText type="default" style={styles.cardName}>
                {item.name}
              </ThemedText>
              <View style={styles.cardActions}>
                <Pressable onPress={() => openEdit(item)} hitSlop={8}>
                  <ThemedText type="link">Editar</ThemedText>
                </Pressable>
                <Pressable onPress={() => handleDelete(item)} hitSlop={8}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Excluir
                  </ThemedText>
                </Pressable>
              </View>
            </View>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {item.model_name} · {item.base_url}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              API key: {maskApiKey(item.api_key)}
            </ThemedText>
          </ThemedView>
        )}
      />

      <AgentFormModal
        key={`${editing?.id ?? 'new'}:${formVisible ? 'open' : 'closed'}`}
        visible={formVisible}
        agent={editing}
        onClose={() => setFormVisible(false)}
      />
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
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  iconButtonText: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: Spacing.one, padding: Spacing.two },
  cardName: { flex: 1 },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
});
