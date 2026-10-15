import { api, tokenStore } from "./client";

export interface AuthResponse {
  token: string;
  id: number;
  name: string;
  username: string;
  email: string;
}

export async function login(email: string, password: string) {
  const data = await api<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  tokenStore.set(data.token);
  return data;
}