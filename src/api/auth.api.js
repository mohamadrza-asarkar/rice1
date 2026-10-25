// -------------------------------------------------------------
// Authentication API (/api/auth) using Axios
// -------------------------------------------------------------
import axiosInstance, { getStoredToken, setStoredToken } from './axios';

// Unwraps Mongoose documents (_doc) and API envelopes
export function unwrapDoc(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  let target = raw;
  if (target._doc && typeof target._doc === 'object') {
    target = { ...target, ...target._doc };
  }
  if (target.data && typeof target.data === 'object' && !Array.isArray(target.data)) {
    target = target.data._doc ? { ...target.data, ...target.data._doc } : target.data;
  }
  if (target.user && typeof target.user === 'object' && !Array.isArray(target.user)) {
    target = target.user._doc ? { ...target.user, ...target.user._doc } : target.user;
  }
  if (target._doc && typeof target._doc === 'object') {
    target = { ...target, ...target._doc };
  }
  return target;
}

// Normalize user object from various server response formats
export function normalizeUser(raw) {
  if (!raw) return null;
  const u = unwrapDoc(raw);
  if (!u || typeof u !== 'object') return null;

  const phone = String(u.phone || u.phoneNumber || u.mobile || '').trim();
  const id = u._id || u.id || (phone ? `usr-${phone}` : `usr-${Date.now()}`);
  const roleStr = String(u.role || u.userRole || u.type || '').trim().toLowerCase();
  const isAdmin = Boolean(
    u.isAdmin === true ||
    u.is_admin === true ||
    roleStr === 'admin' ||
    roleStr === 'superadmin' ||
    roleStr === 'manager' ||
    roleStr === 'administrator'
  );

  return {
    ...u,
    id: String(id),
    _id: String(id),
    name: u.name || u.fullName || u.username || (phone ? `کاربر ${phone.slice(-4)}` : 'کاربر گرامی'),
    phone,
    mobile: phone,
    email: u.email || '',
    address: u.address || '',
    postalCode: u.postalCode || '',
    role: isAdmin ? 'admin' : (roleStr || 'user'),
    isAdmin
  };
}

// Normalize Persian/Arabic and formatted phone numbers to standard 11-digit Iranian mobile (09xxxxxxxxx)
export function normalizePhone(rawPhone) {
  if (!rawPhone) return '';
  let p = String(rawPhone).trim();
  p = p.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  p = p.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  p = p.replace(/\D/g, '');
  if (p.startsWith('0098') && p.length === 14) {
    p = '0' + p.slice(4);
  } else if (p.startsWith('98') && p.length === 12) {
    p = '0' + p.slice(2);
  } else if (p.startsWith('9') && p.length === 10) {
    p = '0' + p;
  }
  return p;
}

// Extract and save token from response
function extractAndSaveToken(resData) {
  if (!resData || typeof resData !== 'object') return null;
  const token =
    resData.token ||
    resData.data?.token ||
    resData.accessToken ||
    resData.data?.accessToken ||
    resData.data?.user?.token ||
    resData.user?.token;

  if (token && typeof token === 'string') {
    setStoredToken(token);
    return token;
  }
  return null;
}

export const authApi = {
  /**
   * Register with name, phone, password using axios.post
   */
  async register({ name, phone, password }) {
    const cleanPhone = normalizePhone(phone);
    const cleanPassword = (password || '').trim();
    const cleanName = (name || '').trim();

    const res = await axiosInstance.post('/auth/register', {
      name: cleanName,
      phone: cleanPhone,
      password: cleanPassword
    });

    const token = extractAndSaveToken(res);
    const user = normalizeUser(res);
    if (user) {
      try {
        localStorage.setItem('tala_rice_user', JSON.stringify(user));
      } catch {
        // ignore
      }
    }
    return {
      ...res,
      token,
      user
    };
  },

  /**
   * Login with phone and password using axios.post
   */
  async login({ phone, password }) {
    const cleanPhone = normalizePhone(phone);
    const cleanPassword = (password || '').trim();

    const res = await axiosInstance.post('/auth/login', {
      phone: cleanPhone,
      password: cleanPassword
    });

    const token = extractAndSaveToken(res);
    const user = normalizeUser(res);
    if (user) {
      try {
        localStorage.setItem('tala_rice_user', JSON.stringify(user));
      } catch {
        // ignore
      }
    }
    return {
      ...res,
      token,
      user
    };
  },

  /**
   * Get current authenticated user details (/auth/me) using axios.get with Token header
   */
  async getMe() {
    const token = getStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await axiosInstance.get('/auth/me', { headers });
    const user = normalizeUser(res);
    if (user) {
      try {
        localStorage.setItem('tala_rice_user', JSON.stringify(user));
      } catch {
        // ignore
      }
    }
    return {
      ...res,
      user
    };
  },

  /**
   * Update profile info using axios.put with Token header
   */
  async updateProfile({ name, phone, address, postalCode }) {
    const token = getStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await axiosInstance.put('/auth/profile', {
      name: name?.trim(),
      phone: phone?.trim(),
      address: address?.trim(),
      postalCode: postalCode?.trim()
    }, { headers });

    const user = normalizeUser(res);
    if (user) {
      try {
        localStorage.setItem('tala_rice_user', JSON.stringify(user));
      } catch {
        // ignore
      }
    }

    return {
      ...res,
      user
    };
  },

  /**
   * Change password using axios.put with Token header
   */
  async changePassword({ oldPassword, newPassword }) {
    const token = getStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axiosInstance.put('/auth/change-password', {
      oldPassword: (oldPassword || '').trim(),
      newPassword: (newPassword || '').trim()
    }, { headers });
    return res;
  },

  /**
   * Clear auth session
   */
  logout() {
    setStoredToken(null);
    try {
      localStorage.removeItem('aala_rice_user');
    } catch {
      // ignore
    }
  }
};

export default authApi;
