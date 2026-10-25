import riceSack1 from '../assets/images/white_rice_sack_1_1786553727373.jpg';
import riceSack2 from '../assets/images/white_rice_sack_2_1786553744148.jpg';
import riceSack3 from '../assets/images/white_rice_sack_3_1786553768867.jpg';

// -------------------------------------------------------------
// Direct Environment URL Configuration (.env)
// -------------------------------------------------------------
const trimSlash = (str) => (str ? str.trim().replace(/\/+$/, '') : '');

const getRawBackend = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.VITE_BACKEND_URL && import.meta.env.VITE_BACKEND_URL.trim()) {
      return import.meta.env.VITE_BACKEND_URL.trim();
    }
    if (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.trim()) {
      return import.meta.env.VITE_API_BASE_URL.trim();
    }
  }
  return 'http://localhost:5000';
};

const rawUrl = getRawBackend();
const normalizedBackend = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `http://${rawUrl}`;

export const BACKEND_ORIGIN = trimSlash(normalizedBackend).replace(/\/api$/, '');
export const API_BASE_URL = `${BACKEND_ORIGIN}/api`;

export function getBackendOrigin() {
  return BACKEND_ORIGIN;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

const LOCAL_RICE_IMAGES = [
  riceSack1,
  riceSack2,
  riceSack3
];

export function getLocalFallbackImage(index = 0) {
  return LOCAL_RICE_IMAGES[Math.abs(index) % LOCAL_RICE_IMAGES.length];
}

export function handleImageError(e, index = 0) {
  if (e && e.target) {
    const fallback = getLocalFallbackImage(index);
    if (e.target.src !== fallback && !e.target.src.endsWith(fallback)) {
      e.target.onerror = null;
      e.target.src = fallback;
    }
  }
}

export function getImageUrl(imgPath, fallbackIndex = 0) {
  const DEFAULT_FALLBACK = getLocalFallbackImage(fallbackIndex);
  if (!imgPath || typeof imgPath !== 'string') return DEFAULT_FALLBACK;

  const trimmed = imgPath.trim();
  if (!trimmed) return DEFAULT_FALLBACK;

  // Data URIs and Blob URIs
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Local Vite bundled asset
  if (
    trimmed.startsWith('/src/') ||
    trimmed.startsWith('src/') ||
    trimmed.startsWith('/assets/') ||
    trimmed.startsWith('assets/')
  ) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }

  // Any uploaded file path containing /uploads/
  const uploadsIndex = trimmed.indexOf('/uploads/');
  if (uploadsIndex !== -1) {
    const relativeUploadPath = trimmed.slice(uploadsIndex);
    return `${BACKEND_ORIGIN}${relativeUploadPath}`;
  }

  // Path starting with uploads/
  if (trimmed.startsWith('uploads/')) {
    return `${BACKEND_ORIGIN}/${trimmed}`;
  }

  // External full HTTP/HTTPS URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // If backend stored localhost/127.0.0.1 in DB, replace origin with BACKEND_ORIGIN
    if (trimmed.includes('localhost') || trimmed.includes('127.0.0.1')) {
      try {
        const parsed = new URL(trimmed);
        return `${BACKEND_ORIGIN}${parsed.pathname}${parsed.search}`;
      } catch {
        // fallback
      }
    }
    return trimmed;
  }

  // Any other relative path
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${BACKEND_ORIGIN}${cleanPath}`;
}

export const TOKEN_STORAGE_KEY = 'aala_rice_token';


export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('Could not store token:', err);
  }
}

/**
 * Modern native fetch wrapper with automatic token injection & error handling
 */
export async function request(endpoint, options = {}) {
  const currentBaseUrl = getApiBaseUrl();
  let url = endpoint.startsWith('http')
    ? endpoint
    : `${currentBaseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  // Automatically serialize options.params if provided (Axios compatibility)
  if (options.params && typeof options.params === 'object') {
    const query = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const qs = query.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  const token = getStoredToken();
  const rawBody = options.body !== undefined ? options.body : options.data;
  const isFormData = typeof FormData !== 'undefined' && rawBody instanceof FormData;
  const isAuthPublicRoute = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');

  // Preserve Content-Type and Accept headers properly without options.headers overwriting Content-Type
  const customHeaders = { ...(options.headers || {}) };
  if (isFormData) {
    delete customHeaders['Content-Type'];
    delete customHeaders['content-type'];
  }

  const headers = {
    'Accept': 'application/json',
    'X-Tunnel-Skip-Anti-Phishing-Page': 'true',
    'ngrok-skip-browser-warning': 'true',
    'Bypass-Tunnel-Remainder': 'true',
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && !isAuthPublicRoute && !options.skipAuth ? { 'Authorization': `Bearer ${token}` } : {}),
    ...customHeaders
  };

  let body = undefined;
  if (rawBody !== undefined && rawBody !== null) {
    if (isFormData || typeof rawBody === 'string') {
      body = rawBody;
    } else {
      body = JSON.stringify(rawBody);
    }
  }

  const { headers: _h, body: _b, data: _d, ...restOptions } = options;

  const config = {
    method: options.method || 'GET',
    headers,
    ...restOptions
  };

  if (body !== undefined && config.method !== 'GET' && config.method !== 'HEAD') {
    config.body = body;
  }

  try {
    const response = await fetch(url, config);
    let data = null;
    const isNoBody = response.status === 304 || response.status === 204;

    if (!isNoBody) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = {};
        }
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }
    } else {
      data = { status: response.status, success: true };
    }

    if (!response.ok && response.status !== 304) {
      let rawMsg = data?.message || data?.error;
      const isHtmlError = !rawMsg || typeof rawMsg !== 'string' || rawMsg.trim().startsWith('<') || rawMsg.includes('<!DOCTYPE') || rawMsg.includes('<html');

      let errorMsg = !isHtmlError ? rawMsg : '';

      if (response.status === 401) {
        if (isAuthPublicRoute) {
          errorMsg = errorMsg || 'شماره موبایل یا رمز عبور وارد شده اشتباه است.';
        } else {
          errorMsg = errorMsg || 'نشست کاربری شما پایان یافته است. لطفاً دوباره وارد حساب کاربری خود شوید.';
          setStoredToken(null);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { endpoint, status: 401 } }));
          }
        }
      } else if (response.status === 403) {
        errorMsg = errorMsg || 'دسترسی به این بخش نیازمند مجوز مدیریت سامانه است.';
      } else if (response.status === 400) {
        errorMsg = errorMsg || 'اطلاعات ارسالی نامعتبر یا شماره موبایل تکراری است.';
      } else if (response.status === 422) {
        errorMsg = errorMsg || 'فرمت اطلاعات ورودی نامعتبر است. لطفاً شماره موبایل و رمز عبور را بررسی کنید.';
      } else if (response.status === 404) {
        errorMsg = errorMsg || 'اطلاعات مورد نظر در سرور یافت نشد.';
      } else if (response.status >= 500) {
        errorMsg = 'سرور با خطای موقت مواجه شد. لطفاً لحظاتی بعد مجدداً تلاش نمایید.';
      } else if (!errorMsg) {
        errorMsg = 'مشکلی در برقراری ارتباط با سرور رخ داده است.';
      }

      const error = new Error(errorMsg);
      error.status = response.status;
      error.statusCode = response.status;
      error.data = data;
      error.response = { status: response.status, data };
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const networkError = new Error('عدم برقراری ارتباط با وب‌سرویس بک‌اند (لطفاً اتصال اینترنت یا آدرس سرور را بررسی کنید).');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw err;
  }
}

export const client = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' })
};

export default client;
