import Cookies from 'js-cookie';

const API_SERVER = process.env.REACT_APP_API_URL;

// Lấy token từ cookie (ưu tiên admin)
const getAuthHeader = () => {
  const token = Cookies.get('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Timeout helper (nếu server không phản hồi)
const fetchWithTimeout = async (url, options, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timeout. Vui lòng thử lại sau.');
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
};

// Hàm request chính
const request = async (method, path, data, extraHeaders = {}) => {
  let url = API_SERVER + path;

  // Xử lý query string cho GET / DELETE
  const isQuery = (method === 'GET' || method === 'DELETE') && data && typeof data === 'object';
  if (isQuery) {
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const params = new URLSearchParams(filtered).toString();
    if (params) url += (url.includes('?') ? '&' : '?') + params;
  }

  // Cấu hình fetch options
  const options = {
    method,
    // credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...getAuthHeader(),
      ...extraHeaders,
    },
  };

  // Body cho POST / PATCH
  const hasBody = ['POST', 'PATCH', 'PUT'].includes(method);
  if (hasBody && data) {
    if (data instanceof FormData) {
      options.body = data;
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
  }

  // Debug log
  if (process.env.NODE_ENV === 'development') {
    console.log(`${method} ${url}`, data || '');
  }

  // Gọi API với timeout
  let response;
  try {
    response = await fetchWithTimeout(url, options, 15000); 
  } catch (err) {
    if (err.message.includes('Failed to fetch')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra mạng hoặc backend.');
    }
    throw err;
  }

  // Xử lý các mã lỗi HTTP đặc biệt
  if (response.status === 401) {
    Cookies.remove('tokenAdmin');
    Cookies.remove('tokenUser');
    throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
  }

  if (response.status === 404) {
    throw new Error('API không tồn tại (404).');
  }

  // Nếu 204 (No Content) → return rỗng
  if (response.status === 204) {
    return null;
  }

  // Parse theo content-type
  const contentType = response.headers.get('content-type');
  let parsed;
  try {
    if (contentType?.includes('application/json')) {
      parsed = await response.json();
    } else if (contentType?.includes('text/')) {
      parsed = await response.text();
    } else {
      parsed = await response.blob(); 
    }
  } catch {
    if (process.env.NODE_ENV === 'development') {
      console.error('Non-JSON response:', await response.text());
    }
    throw new Error('Phản hồi không hợp lệ từ backend.');
  }

  // Kiểm tra lỗi logic từ backend
  if (!response.ok) {
    const msg = parsed?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(msg);
  }

  return parsed;
};

// Các hàm tiện ích
export const GET = (path, params, headers) => request('GET', path, params, headers);
export const POST = (path, data, headers) => request('POST', path, data, headers);
export const PATCH = (path, data, headers) => request('PATCH', path, data, headers);
export const PUT = (path, data, headers) => request('PUT', path, data, headers);
export const DELETE = (path, data, headers) => request('DELETE', path, data, headers);