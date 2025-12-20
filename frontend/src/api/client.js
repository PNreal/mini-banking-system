const GATEWAY_API_BASE =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

async function request(
  baseUrl,
  path,
  { method = 'GET', body, token, headers: extraHeaders } = {}
) {
  const headers = {
    'Content-Type': 'application/json',
    ...(extraHeaders || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    let message;
    if (data) {
      if (typeof data.error === 'object' && data.error?.message) {
        message = data.error.message;
      } else if (typeof data.message === 'string') {
        message = data.message;
      } else if (typeof data.error === 'string') {
        message = data.error;
      } else {
        try {
          message = JSON.stringify(data);
        } catch (e) {
          message = `Request failed with status ${res.status}`;
        }
      }
    } else {
      message = `Request failed with status ${res.status}`;
    }
    throw new Error(message);
  }

  return data;
}

export async function loginApi(payload) {
  // Gọi qua API Gateway: POST http://localhost:8080/api/v1/users/login
  return request(GATEWAY_API_BASE, '/users/login', {
    method: 'POST',
    body: payload,
  });
}

export async function loginAdminApi(payload) {
  return request(GATEWAY_API_BASE, '/users/admin/login', {
    method: 'POST',
    body: payload,
  });
}

export async function loginStaffApi(payload) {
  return request(GATEWAY_API_BASE, '/users/staff/login', {
    method: 'POST',
    body: payload,
  });
}

export async function registerApi(payload) {
  // Gọi qua API Gateway: POST http://localhost:8080/api/v1/users/register
  return request(GATEWAY_API_BASE, '/users/register', {
    method: 'POST',
    body: payload,
  });
}

export async function getAccountInfoApi(token) {
  // GET /account/me - Lấy thông tin tài khoản
  return request(GATEWAY_API_BASE, '/account/me', {
    method: 'GET',
    token,
  });
}

export async function getUserInfoApi(token) {
  // Lấy thông tin user từ endpoint user profile
  // Nếu backend có endpoint riêng, sử dụng endpoint đó
  try {
    // Thử gọi endpoint user profile nếu có
    const response = await request(GATEWAY_API_BASE, '/users/me', {
      method: 'GET',
      token,
    });
    return response;
  } catch (error) {
    // Nếu không có endpoint (404), trả về null để dùng thông tin từ login
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return null;
    }
    throw error;
  }
}

export async function updateUserProfileApi(token, payload) {
  // Cập nhật thông tin user profile
  // PUT /users/me hoặc PATCH /users/me
  return request(GATEWAY_API_BASE, '/users/me', {
    method: 'PUT',
    body: payload,
    token,
  });
}

export async function uploadAvatarApi(token, file) {
  // Upload ảnh đại diện
  // POST /users/me/avatar hoặc POST /users/avatar
  const formData = new FormData();
  formData.append('file', file);
  formData.append('image', file); // Thử cả hai tên field

  const headers = {
    Authorization: `Bearer ${token}`,
    // Không set Content-Type, browser sẽ tự động set với boundary cho FormData
  };

  try {
    // Thử endpoint /users/me/avatar trước
    const res = await fetch(`${GATEWAY_API_BASE}/users/me/avatar`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      // Nếu không có, thử /users/avatar
      const res2 = await fetch(`${GATEWAY_API_BASE}/users/avatar`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res2.ok) {
        throw new Error(`Upload failed with status ${res2.status}`);
      }

      return await res2.json();
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function depositApi(token, amount) {
  // Nạp tiền vào tài khoản
  // POST /transactions/deposit
  return request(GATEWAY_API_BASE, '/transactions/deposit', {
    method: 'POST',
    body: { amount },
    token,
  });
}

export async function getCountersApi(token) {
  // Lấy danh sách quầy giao dịch
  // GET /counters
  return request(GATEWAY_API_BASE, '/counters', {
    method: 'GET',
    token,
  });
}

export async function assignCounterAdminApi(token, counterId, payload) {
  // Admin tổng chỉ định admin quầy
  // PATCH /counters/{counterId}/admin-user
  return request(GATEWAY_API_BASE, `/counters/${counterId}/admin-user`, {
    method: 'PATCH',
    body: payload,
    token,
  });
}

export async function depositAtCounterApi(token, amount, counterId) {
  // Nạp tiền ở quầy
  // POST /transactions/deposit-counter
  return request(GATEWAY_API_BASE, '/transactions/deposit-counter', {
    method: 'POST',
    body: { amount, counterId },
    token,
  });
}

export async function cancelCounterDepositApi(token, transactionId) {
  // Hủy giao dịch nạp tiền ở quầy
  // POST /transactions/deposit-counter/{transactionId}/cancel
  return request(GATEWAY_API_BASE, `/transactions/deposit-counter/${transactionId}/cancel`, {
    method: 'POST',
    token,
  });
}

export async function confirmCounterDepositApi(token, transactionId) {
  // Nhân viên xác nhận nạp tiền ở quầy
  // POST /transactions/deposit-counter/{transactionId}/confirm
  return request(GATEWAY_API_BASE, `/transactions/deposit-counter/${transactionId}/confirm`, {
    method: 'POST',
    token,
  });
}

export async function validateAccountNumberApi(token, accountNumber) {
  // Kiểm tra số tài khoản có tồn tại và lấy thông tin
  // GET /accounts/validate?accountNumber={accountNumber}
  return request(GATEWAY_API_BASE, `/accounts/validate?accountNumber=${accountNumber}`, {
    method: 'GET',
    token,
  });
}

export async function transferApi(token, toAccountId, amount, note) {
  // Chuyển tiền từ tài khoản hiện tại đến tài khoản khác
  // POST /transactions/transfer
  return request(GATEWAY_API_BASE, '/transactions/transfer', {
    method: 'POST',
    body: { toAccountId, amount, note },
    token,
  });
}

export async function getTransactionsHistoryApi(token, params = {}) {
  // Lấy lịch sử giao dịch
  // GET /transactions/history?page=0&size=10&type=...
  const queryParams = new URLSearchParams();
  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size !== undefined) queryParams.append('size', params.size);
  if (params.type) queryParams.append('type', params.type);
  if (params.from) queryParams.append('from', params.from);
  if (params.to) queryParams.append('to', params.to);
  
  const queryString = queryParams.toString();
  const url = `/transactions/history${queryString ? '?' + queryString : ''}`;
  
  return request(GATEWAY_API_BASE, url, {
    method: 'GET',
    token,
  });
}

export async function getStaffDashboardApi(token, params = {}) {
  // Dashboard dành cho STAFF (counter deposit stats + pending approvals + recent customers)
  // GET /transactions/staff/dashboard?pendingLimit=...&recentCustomersLimit=...
  const queryParams = new URLSearchParams();
  if (params.pendingLimit !== undefined) queryParams.append('pendingLimit', params.pendingLimit);
  if (params.recentCustomersLimit !== undefined) queryParams.append('recentCustomersLimit', params.recentCustomersLimit);
  const queryString = queryParams.toString();

  return request(GATEWAY_API_BASE, `/transactions/staff/dashboard${queryString ? '?' + queryString : ''}`, {
    method: 'GET',
    token,
  });
}

// ========== Admin Counter Management APIs ==========

export async function createCounterApi(token, payload) {
  // Tạo quầy giao dịch mới
  // POST /admin/counters
  return request(GATEWAY_API_BASE, '/admin/counters', {
    method: 'POST',
    body: payload,
    token,
  });
}

export async function updateCounterApi(token, counterId, payload) {
  // Cập nhật thông tin quầy giao dịch
  // PUT /admin/counters/{counterId}
  return request(GATEWAY_API_BASE, `/admin/counters/${counterId}`, {
    method: 'PUT',
    body: payload,
    token,
  });
}

export async function deleteCounterApi(token, counterId) {
  // Xóa quầy giao dịch
  // DELETE /admin/counters/{counterId}
  return request(GATEWAY_API_BASE, `/admin/counters/${counterId}`, {
    method: 'DELETE',
    token,
  });
}

export async function getCounterDetailsApi(token, counterId) {
  // Lấy chi tiết quầy giao dịch (bao gồm danh sách nhân viên)
  // GET /admin/counters/{counterId}
  return request(GATEWAY_API_BASE, `/admin/counters/${counterId}`, {
    method: 'GET',
    token,
  });
}

export async function getCounterStaffIdsApi(token, counterId) {
  return request(GATEWAY_API_BASE, `/counters/${counterId}/staff`, {
    method: 'GET',
    token,
  });
}

// ========== Admin Staff Management APIs ==========

export async function addStaffToCounterApi(token, counterId, payload) {
  // Thêm nhân viên vào quầy giao dịch
  // POST /admin/counters/{counterId}/staff
  return request(GATEWAY_API_BASE, `/admin/counters/${counterId}/staff`, {
    method: 'POST',
    body: payload,
    token,
  });
}

export async function updateStaffInCounterApi(token, counterId, staffId, payload) {
  // Cập nhật thông tin nhân viên trong quầy
  // PUT /admin/counters/{counterId}/staff/{staffId}
  return request(GATEWAY_API_BASE, `/admin/counters/${counterId}/staff/${staffId}`, {
    method: 'PUT',
    body: payload,
    token,
  });
}

export async function removeStaffFromCounterApi(token, counterId, staffId) {
  // Xóa nhân viên khỏi quầy giao dịch
  // DELETE /admin/counters/{counterId}/staff/{staffId}
  return request(GATEWAY_API_BASE, `/admin/counters/${counterId}/staff/${staffId}`, {
    method: 'DELETE',
    token,
  });
}

// ========== Admin Employee Management APIs ==========

export async function getEmployeesApi(token) {
  // Lấy danh sách tất cả nhân viên
  // GET /admin/employees
  return request(GATEWAY_API_BASE, '/admin/employees', {
    method: 'GET',
    token,
  });
}

export async function getEmployeeByIdApi(token, employeeId) {
  // Lấy thông tin chi tiết nhân viên
  // GET /admin/employees/{employeeId}
  return request(GATEWAY_API_BASE, `/admin/employees/${employeeId}`, {
    method: 'GET',
    token,
  });
}

export async function createEmployeeApi(token, payload) {
  // Tạo nhân viên mới
  // POST /admin/employees
  return request(GATEWAY_API_BASE, '/admin/employees', {
    method: 'POST',
    body: payload,
    token,
  });
}

export async function updateEmployeeApi(token, employeeId, payload) {
  // Cập nhật thông tin nhân viên
  // PUT /admin/employees/{employeeId}
  return request(GATEWAY_API_BASE, `/admin/employees/${employeeId}`, {
    method: 'PUT',
    body: payload,
    token,
  });
}

export async function deleteEmployeeApi(token, employeeId) {
  // Xóa nhân viên
  // DELETE /admin/employees/{employeeId}
  return request(GATEWAY_API_BASE, `/admin/employees/${employeeId}`, {
    method: 'DELETE',
    token,
  });
}

export async function toggleEmployeeStatusApi(token, employeeId, status) {
  // Thay đổi trạng thái nhân viên (ACTIVE/INACTIVE)
  // PATCH /admin/employees/{employeeId}/status
  return request(GATEWAY_API_BASE, `/admin/employees/${employeeId}/status`, {
    method: 'PATCH',
    body: { status },
    token,
  });
}

// ========== Admin User Management APIs ==========

export async function getAdminUsersApi(token) {
  return request(GATEWAY_API_BASE, '/admin/users', {
    method: 'GET',
    token,
  });
}

export async function lockUserApi(token, adminId, userId) {
  return request(GATEWAY_API_BASE, `/admin/lock/${userId}`, {
    method: 'PATCH',
    token,
    headers: {
      'X-User-Id': adminId,
    },
  });
}

export async function unlockUserApi(token, adminId, userId) {
  return request(GATEWAY_API_BASE, `/admin/unlock/${userId}`, {
    method: 'PATCH',
    token,
    headers: {
      'X-User-Id': adminId,
    },
  });
}

export async function freezeUserApi(token, adminId, userId) {
  return request(GATEWAY_API_BASE, `/admin/freeze/${userId}`, {
    method: 'PATCH',
    token,
    headers: {
      'X-User-Id': adminId,
    },
  });
}

export async function unfreezeUserApi(token, adminId, userId) {
  return request(GATEWAY_API_BASE, `/admin/unfreeze/${userId}`, {
    method: 'PATCH',
    token,
    headers: {
      'X-User-Id': adminId,
    },
  });
}

export async function getAdminReportApi(token) {
  return request(GATEWAY_API_BASE, '/admin/report', {
    method: 'GET',
    token,
  });
}

// ========== Counter Admin APIs ==========

export async function getCounterByAdminApi(token) {
  // Lấy thông tin quầy mà user là admin
  // GET /counter/admin/my-counter
  return request(GATEWAY_API_BASE, '/counter/admin/my-counter', {
    method: 'GET',
    token,
  });
}

export async function checkIsCounterAdminApi(token) {
  // Kiểm tra xem user có phải là admin quầy không
  // GET /counter/admin/check
  try {
    const response = await request(GATEWAY_API_BASE, '/counter/admin/check', {
      method: 'GET',
      token,
    });
    // Backend thường trả ApiResponse với data dạng:
    // - boolean (true/false), hoặc
    // - object { isCounterAdmin: true/false }
    const data = response?.data;
    if (typeof data === 'boolean') return data;
    if (data && typeof data === 'object') return data.isCounterAdmin === true;
    return false;
  } catch (error) {
    // Nếu API không tồn tại hoặc lỗi, trả về false
    return false;
  }
}

export async function getCounterStaffApi(token, counterId) {
  // Lấy danh sách nhân viên trong quầy (cho counter admin)
  // GET /counter/admin/{counterId}/staff
  return request(GATEWAY_API_BASE, `/counter/admin/${counterId}/staff`, {
    method: 'GET',
    token,
  });
}

export async function addCounterStaffApi(token, counterId, payload) {
  // Thêm nhân viên vào quầy (counter admin)
  // POST /counter/admin/{counterId}/staff
  return request(GATEWAY_API_BASE, `/counter/admin/${counterId}/staff`, {
    method: 'POST',
    body: payload,
    token,
  });
}

export async function updateCounterStaffApi(token, counterId, staffId, payload) {
  // Cập nhật nhân viên trong quầy (counter admin)
  // PUT /counter/admin/{counterId}/staff/{staffId}
  return request(GATEWAY_API_BASE, `/counter/admin/${counterId}/staff/${staffId}`, {
    method: 'PUT',
    body: payload,
    token,
  });
}

export async function removeCounterStaffApi(token, counterId, staffId) {
  // Xóa nhân viên khỏi quầy (counter admin)
  // DELETE /counter/admin/{counterId}/staff/{staffId}
  return request(GATEWAY_API_BASE, `/counter/admin/${counterId}/staff/${staffId}`, {
    method: 'DELETE',
    token,
  });
}

export async function getCounterTransactionsApi(token, counterId, params = {}) {
  // Lấy danh sách giao dịch của quầy (counter admin)
  // GET /counter/admin/{counterId}/transactions
  const queryParams = new URLSearchParams(params).toString();
  return request(GATEWAY_API_BASE, `/counter/admin/${counterId}/transactions${queryParams ? '?' + queryParams : ''}`, {
    method: 'GET',
    token,
  });
}

export async function getCounterStatsApi(token, counterId) {
  // Lấy thống kê quầy (counter admin)
  // GET /counter/admin/{counterId}/stats
  return request(GATEWAY_API_BASE, `/counter/admin/${counterId}/stats`, {
    method: 'GET',
    token,
  });
}

export async function getNotificationsApi(token, params = {}) {
  // Lấy danh sách thông báo của user hiện tại
  // GET /notifications/me?page=0&size=50
  const queryParams = new URLSearchParams();
  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size !== undefined) queryParams.append('size', params.size);
  
  const queryString = queryParams.toString();
  const url = `/notifications/me${queryString ? '?' + queryString : ''}`;
  
  return request(GATEWAY_API_BASE, url, {
    method: 'GET',
    token,
  });
}

export async function markNotificationAsReadApi(token, notificationId) {
  // Đánh dấu thông báo đã đọc
  // PATCH /notifications/me/{notificationId}/read
  return request(GATEWAY_API_BASE, `/notifications/me/${notificationId}/read`, {
    method: 'PATCH',
    token,
  });
}

export async function markAllNotificationsAsReadApi(token) {
  // Đánh dấu tất cả thông báo đã đọc
  // PATCH /notifications/me/read-all
  return request(GATEWAY_API_BASE, '/notifications/me/read-all', {
    method: 'PATCH',
    token,
  });
}

