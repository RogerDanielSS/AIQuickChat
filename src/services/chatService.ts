// src/services/chatService.ts
import axios from "axios";

export interface ChatCompletionMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionParams {
  /** Ex: "https://api.deepseek.com/v1" */
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: ChatCompletionMessage[];
}

export interface ChatCompletionError {
  message: string;
}

/**
 * Chama um endpoint compatível com a OpenAI (Chat Completions) via axios.
 * Usa base_url + api_key do agente configurado no app.
 */
export async function sendChatCompletion({
  baseUrl,
  apiKey,
  model,
  messages,
}: ChatCompletionParams): Promise<string> {
  const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

  const response = await axios.post(
    url,
    {
      model,
      messages,
      max_tokens: 200,
      temperature: 0.7,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    },
  );

  const content: string | undefined =
    response.data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Resposta inesperada da API.");
  }
  return content;
}

/** Extrai uma mensagem de erro legível de respostas da API (axios) ou de erros genéricos. */
export function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const err = error as {
      response?: { data?: { error?: { message?: string } } };
      message?: string;
    };
    if (err.response?.data?.error?.message) {
      return err.response.data.error.message;
    }
    if (typeof err.message === "string" && err.message.length > 0) {
      return err.message;
    }
  }
  return "Falha ao se comunicar com a API. Verifique a conexão e as credenciais do agente.";
}
