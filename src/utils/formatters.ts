// src/utils/formatters.ts

/** Converte timestamp (ms) em tempo relativo curto: "agora", "5min", "3h", "2d" ou data. */
export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "agora";
  if (diff < hour) return `${Math.floor(diff / minute)}min`;
  if (diff < day) return `${Math.floor(diff / hour)}h`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d`;

  return new Date(timestamp).toLocaleDateString();
}

/** Mascara uma API key para exibição, mantendo só o início e o fim. */
export function maskApiKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "••••";
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

/** Gera um título curto a partir do conteúdo da primeira mensagem. */
export function titleFromMessage(content: string, maxLength = 42): string {
  const singleLine = content.replace(/\s+/g, " ").trim();
  if (singleLine.length <= maxLength) return singleLine;
  return `${singleLine.slice(0, maxLength).trimEnd()}…`;
}
