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

export type CreateUserPayload = {
  email: string;
  password: string;
  fullName: string;
  role: string;
  citizenId?: string;
  employeeCode?: string;
};

export type UpdateUserPayload = {
  fullName?: string;
  role?: string;
  citizenId?: string;
  employeeCode?: string;
  email?: string;
  phoneNumber?: string;
};

export async function createUser(token: string, payload: CreateUserPayload) {
  return apiRequest<{ data: any }>("/users/admin/users", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function updateUser(token: string, userId: string, payload: UpdateUserPayload) {
  return apiRequest<{ data: any }>(`/users/admin/users/${userId}`, {
    method: "PUT",
    token,
    body: payload,
  });
}

export async function deleteUser(token: string, userId: string) {
  return apiRequest<{ data: null }>(`/users/admin/users/${userId}`, {
    method: "DELETE",
    token,
  });
}

export async function lockUser(token: string, userId: string) {
  return apiRequest<{ data: null }>(`/users/admin/users/${userId}/lock`, {
    method: "PUT",
    token,
  });
}

export async function unlockUser(token: string, userId: string) {
  return apiRequest<{ data: null }>(`/users/admin/users/${userId}/unlock`, {
    method: "PUT",
    token,
  });
}

export async function freezeUser(token: string, userId: string) {
  return apiRequest<{ data: null }>(`/users/admin/users/${userId}/freeze`, {
    method: "PUT",
    token,
  });
}

export async function unfreezeUser(token: string, userId: string) {
  return apiRequest<{ data: null }>(`/users/admin/users/${userId}/unfreeze`, {
    method: "PUT",
    token,
  });
}

// Counter APIs
export type Counter = {
  counterId: string;
  counterCode: string;
  name: string;
  address: string;
  maxStaff: number;
  adminUserId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CounterResponse = {
  data: Counter[];
};

export type CreateCounterPayload = {
  counterCode: string;
  name: string;
  address: string;
  maxStaff: number;
  adminUserId?: string;
};

export type UpdateCounterPayload = {
  counterCode: string;
  name: string;
  address: string;
  maxStaff: number;
};

export async function getCounters(token: string, role?: string) {
  // Gọi trực tiếp Transaction Service vì API Gateway có vấn đề với JWT
  const baseUrl = "http://localhost:8083/api/v1";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  if (role) headers["X-User-Role"] = role;

  const res = await fetch(`${baseUrl}/counters`, {
    method: "GET",
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch counters");
  }
  return data as CounterResponse;
}

export async function getCounter(token: string, counterId: string) {
  return apiRequest<{ data: Counter }>(`/counters/${counterId}`, {
    method: "GET",
    token,
  });
}

export async function getCounterStaff(token: string, counterId: string) {
  // Gọi trực tiếp Transaction Service
  const baseUrl = "http://localhost:8083/api/v1";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(`${baseUrl}/counters/${counterId}/staff`, {
    method: "GET",
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch counter staff");
  }
  return data as { data: string[] };
}

export async function createCounter(token: string, payload: CreateCounterPayload, role: string) {
  // Gọi trực tiếp Transaction Service
  const baseUrl = "http://localhost:8083/api/v1";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-User-Role": role,
  };

  const res = await fetch(`${baseUrl}/counters`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Failed to create counter");
  }
  return data as { data: Counter };
}

export async function updateCounter(token: string, counterId: string, payload: UpdateCounterPayload, role: string) {
  // Gọi trực tiếp Transaction Service
  const baseUrl = "http://localhost:8083/api/v1";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-User-Role": role,
  };

  const res = await fetch(`${baseUrl}/counters/${counterId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Failed to update counter");
  }
  return data as { data: Counter };
}

export async function deleteCounter(token: string, counterId: string, role: string) {
  // Gọi trực tiếp Transaction Service
  const baseUrl = "http://localhost:8083/api/v1";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-User-Role": role,
  };

  const res = await fetch(`${baseUrl}/counters/${counterId}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.message || "Failed to delete counter");
  }
  return { data: null };
}

export async function reactivateCounter(token: string, counterId: string, role: string) {
  // Gọi trực tiếp Transaction Service
  const baseUrl = "http://localhost:8083/api/v1";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-User-Role": role,
  };

  const res = await fetch(`${baseUrl}/counters/${counterId}/reactivate`, {
    method: "PUT",
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Failed to reactivate counter");
  }
  return data as { data: Counter };
}

// Get user by ID (internal API)
export type UserInfo = {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
};

export async function getUserById(token: string, userId: string): Promise<UserInfo | null> {
  try {
    const baseUrl = "http://localhost:8081/internal/users";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-Internal-Secret": "internal-secret",
    };

    const res = await fetch(`${baseUrl}/${userId}`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data as UserInfo;
  } catch {
    return null;
  }
}

// Get account by userId (internal API)
export type AccountInfo = {
  accountId: string;
  accountNumber: string;
  userId: string;
  balance: number;
  status: string;
};

export async function getAccountByUserId(userId: string): Promise<AccountInfo | null> {
  try {
    const baseUrl = "http://localhost:8082/internal/accounts";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Internal-Secret": "internal-secret",
    };

    const res = await fetch(`${baseUrl}/by-user/${userId}`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data as AccountInfo;
  } catch {
    return null;
  }
}

