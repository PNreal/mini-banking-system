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


