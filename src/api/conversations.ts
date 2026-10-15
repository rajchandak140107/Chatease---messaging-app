import { api } from "./client";

export interface Conversation {
  id: number;
  type: string;
  title: string | null;
  otherUserId: number | null;
  otherUserName: string | null;
  updatedAt: string;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  lastMessageSenderId?: number | null;
  unreadCount?: number;
}

// token ab api() client localStorage se khud uthata hai.
// Param sirf isliye hai ki purane calls (getConversations(token)) na toote.
export const getConversations = (_token?: string) =>
  api<Conversation[]>("/conversations");

export const createDirectConversation = (_token: string, otherUserId: number) =>
  api<Conversation>("/conversations", {
    method: "POST",
    body: JSON.stringify({ otherUserId }),
  });

export const markRead = (_token: string, conversationId: number) =>
  api<void>(`/conversations/${conversationId}/read`, { method: "POST" });

export const conversationName = (c: Conversation) =>
  c.title ?? c.otherUserName ?? "Unknown";