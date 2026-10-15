import type { User } from "../types";

const API_URL = "http://localhost:8080/api";

export async function searchUsers(
  token: string,
  query: string,
  signal?: AbortSignal
) {
  const res = await fetch(
    `${API_URL}/users/search?q=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      signal,
    }
  );
  if (!res.ok) throw new Error("Search failed");
  return res.json() as Promise<User[]>;
}