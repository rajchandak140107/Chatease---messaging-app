import type { Message } from "../types";

const API_URL = "http://localhost:8080/api";

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getMessages(token: string, conversationId: number) {
  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to load messages");
  return res.json() as Promise<Message[]>;
}

export async function sendMessage(
  token: string,
  conversationId: number,
  content: string
) {
  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json() as Promise<Message>;
}