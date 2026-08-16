import axios from "axios";
import Constants from "expo-constants";
import { useTheme } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const DEEPSEEK_API_KEY = Constants.expoConfig?.extra?.DEEPSEEK_API_KEY;

export default function Chat() {
  const theme = useTheme();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(
    [] as { role: string; content: string }[]
  );
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [...messages, userMessage],
          max_tokens: 200,
          temperature: 0.7, // Optional: controls randomness
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          },
        }
      );

      const aiMessage = {
        role: "assistant",
        content: response.data.choices[0].message.content,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("DeepSeek API Error:", error.response?.data || error.message);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error: ${error.response?.data?.error?.message || "Please check your API key or connection."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
      >
        {messages.length === 0 && (
          <Text style={styles.placeholder}>Ask me anything! 🤖</Text>
        )}
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              msg.role === "user" ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text style={msg.role === "user" ? styles.userText : styles.aiText}>
              {msg.content}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90D9" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your question..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={loading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chatArea: { flex: 1, paddingHorizontal: 16 },
  chatContent: { paddingVertical: 20 },
  placeholder: {
    textAlign: "center",
    fontSize: 18,
    color: "#AAA",
    marginTop: 40,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#4A90D9",
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#E9ECEF",
  },
  userText: { color: "#FFF" },
  aiText: { color: "#000" },
  loadingContainer: { alignSelf: "center", marginVertical: 10 },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#FFF",
  },
  input: {
    flex: 1,
    backgroundColor: "#F1F3F5",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#4A90D9",
    borderRadius: 25,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  sendButtonText: { color: "#FFF", fontWeight: "bold" },
});