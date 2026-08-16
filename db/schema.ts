// db/schema.ts
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const agents = sqliteTable("agents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  model_name: text("model_name").notNull(),
  api_key: text("api_key").notNull(),
  base_url: text("base_url").notNull().default("https://api.deepseek.com/v1"),
  created_at: integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now()),
});

export const chats = sqliteTable("chats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agent_id: integer("agent_id").references(() => agents.id, {
    onDelete: "set null",
  }),
  title: text("title"),
  created_at: integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now()),
  updated_at: integer("updated_at")
    .notNull()
    .$defaultFn(() => Date.now())
    .$onUpdateFn(() => Date.now()),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chat_id: integer("chat_id")
    .notNull()
    .references(() => chats.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant' | 'system'
  content: text("content").notNull(),
  created_at: integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now()),
});

export const agentsRelations = relations(agents, ({ many }) => ({
  chats: many(chats),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  agent: one(agents, {
    fields: [chats.agent_id],
    references: [agents.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chat_id],
    references: [chats.id],
  }),
}));

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
