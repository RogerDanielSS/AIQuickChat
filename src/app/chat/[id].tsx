// src/app/chat/[id].tsx
import { asc, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { db } from '@/db';
import { chats, messages } from '@/db/schema';
import { useTheme } from '@/hooks/use-theme';
import {
  ChatCompletionMessage,
  getErrorMessage,
  sendChatCompletion,
} from '@/services/chatService';
import { titleFromMessage } from '@/utils/formatters';

export default function ChatDetailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatId = Number(id);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const { data: chat } = useLiveQuery(
    db.query.chats.findFirst({
      where: eq(chats.id, chatId),
      with: { agent: true },
    })
  );

  const { data: messageRows } = useLiveQuery(
    db
      .select()
      .from(messages)
      .where(eq(messages.chat_id, chatId))
      .orderBy(asc(messages.created_at), asc(messages.id))
  );

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending || !chat || !chat.agent) return;
    setInput('');
    setSending(true);

    try {
      // 1. Persiste a mensagem do usuário e o título automático.
      await db.insert(messages).values({ chat_id: chatId, role: 'user', content: text });
      if (!chat.title) {
        await db
          .update(chats)
          .set({ title: titleFromMessage(text) })
          .where(eq(chats.id, chatId));
      }

      // 2. Monta o histórico e chama a API do agente.
      const history: ChatCompletionMessage[] = messageRows.map((m) => ({
        role: m.role as ChatCompletionMessage['role'],
        content: m.content,
      }));
      history.push({ role: 'user', content: text });

      const { base_url, api_key, model_name } = chat.agent;
      const reply = await sendChatCompletion({
        baseUrl: base_url,
        apiKey: api_key,
        model: model_name,
        messages: history,
      });

      // 3. Persiste a resposta do assistente.
      await db.insert(messages).values({ chat_id: chatId, role: 'assistant', content: reply });
      await db.update(chats).set({ updated_at: Date.now() }).where(eq(chats.id, chatId));
    } catch (error) {
      const detail = getErrorMessage(error);
      await db.insert(messages).values({
        chat_id: chatId,
        role: 'assistant',
        content: `⚠️ Erro: ${detail}`,
      });
    } finally {
      setSending(false);
    }
  };

  if (!chat) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="small" themeColor="textSecondary">
          Carregando…
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: chat.title ?? 'Chat' }} />

      <FlatList
        ref={listRef}
        data={messageRows}
        keyExtractor={(item) => String(item.id)}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <ThemedText type="small" themeColor="textSecondary" style={styles.placeholder}>
            Pergunte algo para começar 🤖
          </ThemedText>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.role === 'user'
                ? [styles.userBubble, { backgroundColor: theme.text }]
                : [styles.aiBubble, { backgroundColor: theme.backgroundElement }],
            ]}>
            <Text
              style={{
                color: item.role === 'user' ? theme.background : theme.text,
                fontSize: 16,
                lineHeight: 22,
              }}>
              {item.content}
            </Text>
          </View>
        )}
      />

      {!chat.agent && (
        <ThemedView type="backgroundElement" style={styles.banner}>
          <ThemedText type="small" themeColor="textSecondary">
            Agente removido. Configure um agente em “Agentes” para continuar conversando.
          </ThemedText>
        </ThemedView>
      )}

      <View
        style={[
          styles.inputContainer,
          { borderTopColor: theme.backgroundSelected, paddingBottom: insets.bottom + Spacing.two },
        ]}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          value={input}
          onChangeText={setInput}
          editable={!!chat.agent && !sending}
          placeholder={chat.agent ? 'Digite sua mensagem…' : 'Sem agente configurado'}
          placeholderTextColor={theme.textSecondary}
          multiline
        />
        <Pressable
          onPress={sendMessage}
          disabled={sending || !chat.agent}
          style={[styles.sendButton, { backgroundColor: theme.text }]}>
          {sending ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text style={[styles.sendButtonText, { color: theme.background }]}>Enviar</Text>
          )}
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatArea: { flex: 1, paddingHorizontal: Spacing.three },
  chatContent: { paddingVertical: Spacing.three, gap: Spacing.two },
  placeholder: {
    textAlign: 'center',
    marginTop: Spacing.six,
  },
  messageBubble: {
    maxWidth: '82%',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  aiBubble: {
    alignSelf: 'flex-start',
  },
  banner: {
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two + Spacing.one,
    justifyContent: 'center',
  },
  sendButtonText: { fontSize: 16, fontWeight: 'bold' },
});
