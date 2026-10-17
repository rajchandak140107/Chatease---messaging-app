
const API_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD
    ? "https://chatease-messaging-app-production.up.railway.app/api"
    : "http://localhost:8080/api");


export const tokenStore = {
  get: () => localStorage.getItem("token"),
  set: (t: string) => localStorage.setItem("token", t),
  clear: () => localStorage.removeItem("token"),
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError("Server se connect nahi ho paya", 0);
  }

  if (res.status === 401) tokenStore.clear();

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.message ?? "Something went wrong", res.status);
  }

  return res.status === 204 ? (undefined as T) : res.json();
}