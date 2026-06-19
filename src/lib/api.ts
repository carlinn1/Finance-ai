export const API_BASE = (import.meta.env.VITE_API_URL || "/api/v1").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}

type Tokens = { access_token: string; refresh_token: string; expires_at: string };

export function saveTokens(tokens: Tokens) {
  localStorage.setItem("access_token", tokens.access_token);
  localStorage.setItem("refresh_token", tokens.refresh_token);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function hasSession() { return Boolean(localStorage.getItem("access_token")); }

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return false;
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).then(async (response) => {
      if (!response.ok) return false;
      const data = await response.json() as { tokens: Tokens };
      saveTokens(data.tokens);
      return true;
    }).catch(() => false).finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

export async function api<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const token = localStorage.getItem("access_token");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (response.status === 401 && retry && !path.startsWith("/auth/")) {
    if (await refreshSession()) return api<T>(path, options, false);
    clearTokens();
    window.dispatchEvent(new Event("financeai:session-expired"));
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: { code?: string; message?: string } } | null;
    throw new ApiError(response.status, payload?.error?.code || "request_failed", payload?.error?.message || "Não foi possível concluir a operação.");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function apiDownload(path: string) {
  const response = await fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${localStorage.getItem("access_token") || ""}` } });
  if (!response.ok) throw new ApiError(response.status, "download_failed", "Não foi possível exportar o arquivo.");
  return response.blob();
}

export type User = { id: string; full_name: string; email: string; profile_type: "personal" | "self_employed" | "business"; default_currency: string; timezone: string; avatar_url: string | null; email_verified: boolean; two_factor_enabled: boolean };
export type Account = { id: string; name: string; type: string; institution: string; currency: string; initial_balance: number; current_balance: number; status: string };
export type Category = { id: string; name: string; type: string; icon: string; color: string; is_default: boolean };
export type Transaction = { id: string; description: string; type: "income" | "expense" | "transfer"; amount: number; value: number; date: string; account_id: string; account: string; category_id: string | null; category: string; created_at: string };
export type Bill = { id: string; description: string; type: "payable" | "receivable"; amount: number; paid_amount: number; due_date: string; paid_at: string | null; status: "pending" | "paid" | "overdue" | "partial"; is_recurring: boolean; account_id: string | null; account: string; category_id: string | null; category: string; notes: string };
export type Budget = { id: string; category_id: string; category: string; month: number; year: number; limit: number; spent: number; is_recurring: boolean };
export type Goal = { id: string; name: string; target: number; saved: number; deadline: string; description: string; monthly: number; status: "active" | "completed" | "paused"; account_id: string | null };

export function toDateLabel(value: string) {
  if (!value) return "—";
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
}
