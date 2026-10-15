export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

export interface Conversation {
  id: number;
  type: string; // "DIRECT" | "GROUP"
  title: string | null;
  otherUserId: number | null;
  otherUserName: string | null;
  updatedAt: string;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
    lastMessageSenderId?: number | null;
  unreadCount?: number;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: string;
  // sirf mere bheje messages pe aata hai, doosron ke messages pe null
  status?: "SENT" | "DELIVERED" | "READ" | null;
}