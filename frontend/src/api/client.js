const GATEWAY_API_BASE =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

async function request(baseUrl, path, { method = 'GET', body, token } = {}) {
  const headers = {
    'Content-Type': 'application/json',
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


