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
  const headers: Record<string, string> = {};
  if (role) headers["X-User-Role"] = role;

  return apiRequest<CounterResponse>("/counters", {
    method: "GET",
    token,
    headers,
  });
}

export async function getCounter(token: string, counterId: string) {
  return apiRequest<{ data: Counter }>(`/counters/${counterId}`, {
    method: "GET",
    token,
  });
}

export async function getCounterStaff(token: string, counterId: string) {
  return apiRequest<{ data: string[] }>(`/counters/${counterId}/staff`, {
    method: "GET",
    token,
  });
}

export async function addStaffToCounter(token: string, counterId: string, payload: { userId?: string; email?: string }) {
  return apiRequest<{ data: null }>(`/counters/${counterId}/staff`, {
    method: "POST",
    token,
    body: payload,
    headers: { "X-User-Role": "ADMIN" },
  });
}

export async function removeStaffFromCounter(token: string, counterId: string, staffId: string) {
  return apiRequest<{ success: boolean }>(`/counters/${counterId}/staff/${staffId}`, {
    method: "DELETE",
    token,
    headers: { "X-User-Role": "ADMIN" },
  });
}

export async function createCounter(token: string, payload: CreateCounterPayload, role: string) {
  return apiRequest<{ data: Counter }>("/counters", {
    method: "POST",
    token,
    body: payload,
    headers: { "X-User-Role": role },
  });
}

export async function updateCounter(token: string, counterId: string, payload: UpdateCounterPayload, role: string) {
  return apiRequest<{ data: Counter }>(`/counters/${counterId}`, {
    method: "PUT",
    token,
    body: payload,
    headers: { "X-User-Role": role },
  });
}

export async function deleteCounter(token: string, counterId: string, role: string) {
  return apiRequest<{ data: null }>(`/counters/${counterId}`, {
    method: "DELETE",
    token,
    headers: { "X-User-Role": role },
  });
}

export async function reactivateCounter(token: string, counterId: string, role: string) {
  return apiRequest<{ data: Counter }>(`/counters/${counterId}/reactivate`, {
    method: "PUT",
    token,
    headers: { "X-User-Role": role },
  });
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
    // Gọi qua API Gateway - cần endpoint public cho admin
    const data = await apiRequest<{ data: UserInfo }>(`/users/admin/users/${userId}`, {
      method: "GET",
      token,
    });
    return data?.data || null;
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

export async function getAccountByUserId(token: string, userId: string): Promise<AccountInfo | null> {
  try {
    // Gọi qua API Gateway
    const data = await apiRequest<{ data: AccountInfo }>(`/account/by-user/${userId}`, {
      method: "GET",
      token,
    });
    return data?.data || null;
  } catch {
    return null;
  }
}

// KYC APIs
export type KycRequest = {
  kycId: string;
  userId: string;
  citizenId: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  placeOfIssue: string;
  dateOfIssue: string;
  expiryDate: string;
  permanentAddress: string;
  currentAddress: string;
  phoneNumber: string;
  email: string;
  frontIdImageUrl: string;
  backIdImageUrl: string;
  selfieImageUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  verifiedBy: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type KycListResponse = {
  data: KycRequest[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
};

export async function getKycRequests(token: string, status?: string, page = 0, size = 10) {
  let path = `/kyc/admin/requests?page=${page}&size=${size}`;
  if (status) path += `&status=${status}`;

  return apiRequest<KycListResponse>(path, {
    method: "GET",
    token,
  });
}

export async function getKycRequestDetail(token: string, kycId: string) {
  return apiRequest<{ data: KycRequest }>(`/kyc/admin/requests/${kycId}`, {
    method: "GET",
    token,
  });
}

export async function reviewKycRequest(
  token: string,
  kycId: string,
  payload: { status: "APPROVED" | "REJECTED"; rejectionReason?: string; notes?: string }
) {
  return apiRequest<{ data: KycRequest }>(`/kyc/admin/requests/${kycId}/review`, {
    method: "PUT",
    token,
    body: payload,
  });
}

export async function countPendingKyc(token: string) {
  try {
    const data = await apiRequest<{ count: number }>("/kyc/admin/pending-count", {
      method: "GET",
      token,
    });
    return data?.count || 0;
  } catch {
    return 0;
  }
}

// Transaction APIs for Admin
export type TransactionItem = {
  transactionId: string;
  fromAccountId: string | null;
  toAccountId: string | null;
  amount: number;
  type: "DEPOSIT" | "WITHDRAW" | "TRANSFER" | "COUNTER_DEPOSIT";
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  timestamp: string;
  transactionCode?: string;
};

export type TransactionListResponse = {
  data: {
    items: TransactionItem[];
    page: number;
    size: number;
    total: number;
  };
};

export async function getAdminTransactions(
  token: string,
  params?: {
    page?: number;
    size?: number;
    type?: string;
    status?: string;
    from?: string;
    to?: string;
  }
) {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append("page", String(params.page));
  if (params?.size !== undefined) queryParams.append("size", String(params.size));
  if (params?.type) queryParams.append("type", params.type);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.from) queryParams.append("from", params.from);
  if (params?.to) queryParams.append("to", params.to);

  const path = `/transactions/admin/all${queryParams.toString() ? "?" + queryParams.toString() : ""}`;

  return apiRequest<TransactionListResponse>(path, {
    method: "GET",
    token,
    headers: { "X-User-Role": "ADMIN" },
  });
}

// Admin Dashboard Statistics API
export type DailyTransactionStat = {
  date: string;
  depositCount: number;
  withdrawCount: number;
  transferCount: number;
  counterDepositCount: number;
  depositAmount: number;
  withdrawAmount: number;
  transferAmount: number;
  counterDepositAmount: number;
};

export type AdminDashboardResponse = {
  data: {
    totalTransactionsToday: number;
    totalAmountToday: number;
    failedTransactionsToday: number;
    pendingTransactionsToday: number;
    transactionCountsByType: Record<string, number>;
    transactionAmountsByType: Record<string, number>;
    dailyStats: DailyTransactionStat[];
    recentTransactions: TransactionItem[];
  };
};

export async function getAdminDashboard(token: string, days = 7) {
  return apiRequest<AdminDashboardResponse>(`/transactions/admin/dashboard?days=${days}`, {
    method: "GET",
    token,
    headers: { "X-User-Role": "ADMIN" },
  });
}

// Admin System Report API (from admin-service)
export type SystemReportResponse = {
  data: {
    totalUsers: number;
    totalTransactionsToday: number;
    totalAmount: number;
    failedTransactions: number;
    transactionCountsByType: Record<string, number>;
    userStatusCounts: Record<string, number>;
  };
};

export async function getSystemReport(token: string) {
  return apiRequest<SystemReportResponse>("/admin/report", {
    method: "GET",
    token,
  });
}

