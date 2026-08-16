// src/components/agent-form-modal.tsx
import { eq } from 'drizzle-orm';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { db } from '@/db';
import { agents, type Agent } from '@/db/schema';
import { useTheme } from '@/hooks/use-theme';

interface AgentFormModalProps {
  visible: boolean;
  agent?: Agent | null;
  onClose: () => void;
}

const DEFAULT_BASE_URL = 'https://api.deepseek.com/v1';

export function AgentFormModal({ visible, agent, onClose }: AgentFormModalProps) {
  const theme = useTheme();
  // O estado é inicializado a partir das props; o componente é remontado via
  // `key` sempre que o modal abre (ver agents.tsx), então não há efeito aqui.
  const [name, setName] = useState(agent?.name ?? '');
  const [modelName, setModelName] = useState(agent?.model_name ?? '');
  const [apiKey, setApiKey] = useState(agent?.api_key ?? '');
  const [baseUrl, setBaseUrl] = useState(agent?.base_url ?? DEFAULT_BASE_URL);

  const canSave =
    name.trim().length > 0 && modelName.trim().length > 0 && apiKey.trim().length > 0;

  const save = async () => {
    if (!canSave) return;
    const values = {
      name: name.trim(),
      model_name: modelName.trim(),
      api_key: apiKey.trim(),
      base_url: baseUrl.trim() || DEFAULT_BASE_URL,
    };
    if (agent) {
      await db.update(agents).set(values).where(eq(agents.id, agent.id));
    } else {
      await db.insert(agents).values(values);
    }
    onClose();
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.background,
      color: theme.text,
      borderColor: theme.backgroundSelected,
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle" style={styles.title}>
            {agent ? 'Editar agente' : 'Novo agente'}
          </ThemedText>

          <ThemedText type="small" themeColor="textSecondary">
            Nome
          </ThemedText>
          <TextInput
            style={inputStyle}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Assistente DeepSeek"
            placeholderTextColor={theme.textSecondary}
          />

          <ThemedText type="small" themeColor="textSecondary">
            Modelo
          </ThemedText>
          <TextInput
            style={inputStyle}
            value={modelName}
            onChangeText={setModelName}
            placeholder="Ex: deepseek-chat"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <ThemedText type="small" themeColor="textSecondary">
            API key
          </ThemedText>
          <TextInput
            style={inputStyle}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="sk-…"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />

          <ThemedText type="small" themeColor="textSecondary">
            Base URL (endpoint compatível com OpenAI)
          </ThemedText>
          <TextInput
            style={inputStyle}
            value={baseUrl}
            onChangeText={setBaseUrl}
            placeholder={DEFAULT_BASE_URL}
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <View style={styles.actions}>
            <Pressable onPress={onClose} style={[styles.button, { backgroundColor: theme.background }]}>
              <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={save}
              disabled={!canSave}
              style={[styles.button, { backgroundColor: theme.text }, !canSave && styles.buttonDisabled]}>
              <Text style={{ color: theme.background, fontSize: 16, fontWeight: '600' }}>Salvar</Text>
            </Pressable>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.one + Spacing.half,
  },
  title: { fontSize: 24, lineHeight: 32, marginBottom: Spacing.two },
  input: {
    borderRadius: Spacing.two,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  button: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two + Spacing.one,
  },
  buttonDisabled: { opacity: 0.4 },
});
