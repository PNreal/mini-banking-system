const DEFAULT_API_BASE_URL = "http://localhost:8080/api/v1";

export const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

export type ApiRequestOptions = {
  method?: string;
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
};

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, token, headers: extraHeaders }: ApiRequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(extraHeaders || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && (data?.message || data?.error?.message)) ||
      (typeof data?.error === "string" && data.error) ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

export type AdminLoginPayload = { email: string; password: string };
export type AdminLoginResponse = any;

export async function loginAdmin(payload: AdminLoginPayload) {
  return apiRequest<AdminLoginResponse>("/users/admin/login", {
    method: "POST",
    body: payload,
  });
}

export async function getAdminUsers(token: string) {
  return apiRequest<{ data: any[] }>("/users/admin/users", {
    method: "GET",
    token,
  });
}


