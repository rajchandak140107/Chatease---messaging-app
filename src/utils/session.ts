import type { AuthResponse } from "../api/auth";

const KEY = "chatease_session";

export function saveSession(auth: AuthResponse) {
  localStorage.setItem(KEY, JSON.stringify(auth));
}

export function getSession(): AuthResponse | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(KEY);
}