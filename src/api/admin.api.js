// -------------------------------------------------------------
// Admin API (/api/admin)
// Native fetch implementation with resilient multi-route fallback
// -------------------------------------------------------------
import { client } from './client';
import { normalizeUser, unwrapDoc, normalizePhone } from './auth.api';
import { normalizeOrder } from './orders.api';

export const adminApi = {
  /**
   * Create a new user (Admin)
   * POST /api/admin/users with fallbacks to /api/users or /api/auth/register
   */
  async createUser(userData) {
    const name = (userData.name || '').trim();
    const phone = normalizePhone(userData.phone);
    const password = (userData.password || '').trim() || '123456';
    const email = (userData.email || '').trim();
    const role = userData.role || 'user';

    if (!name) {
      throw new Error('نام و نام خانوادگی کاربر الزامی است.');
    }
    if (!phone || phone.length !== 11 || !phone.startsWith('09')) {
      throw new Error('شماره تلفن همراه باید ۱۱ رقم بوده و با ۰۹ شروع شود.');
    }
    if (password.length < 6) {
      throw new Error('کلمه عبور باید حداقل ۶ کاراکتر باشد.');
    }

    const payload = {
      name,
      phone,
      email,
      password,
      role
    };

    let res;
    try {
      res = await client.post('/admin/users', payload);
    } catch (err1) {
      try {
        res = await client.post('/users', payload);
      } catch (err2) {
        try {
          res = await client.post('/auth/register', payload);
        } catch (err3) {
          const errMsg = err1?.response?.data?.message || err1?.message || err2?.message || err3?.message || 'خطا در ثبت کاربر';
          throw new Error(errMsg);
        }
      }
    }

    const raw = unwrapDoc(res?.data || res?.user || res);
    const user = normalizeUser(raw);

    // If role is admin and backend endpoint was register without role field, update role
    if (user && role === 'admin' && user.role !== 'admin' && user.id) {
      try {
        await this.updateUserRole(user.id, 'admin');
        user.role = 'admin';
        user.isAdmin = true;
      } catch {
        // ignore
      }
    }

    return user;
  },

  /**
   * Delete or deactivate user (Admin)
   * DELETE /api/admin/users/:id
   */
  async deleteUser(id) {
    return await client.delete(`/admin/users/${id}`);
  },

  /**
   * Get store dashboard summary statistics (Section 8)
   * GET /api/admin/dashboard
   */
  async getDashboard() {
    const res = await client.get('/admin/dashboard');
    const data = unwrapDoc(res?.data || res);
    if (data && typeof data === 'object') {
      return {
        totalRevenue: Number(data.totalRevenue || data.revenue || data.totalSales || 0),
        totalOrders: Number(data.totalOrders || data.ordersCount || data.orders || 0),
        totalProducts: Number(data.totalProducts || data.productsCount || data.products || 0),
        totalUsers: Number(data.totalUsers || data.usersCount || data.users || 0),
        ...data
      };
    }
    return null;
  },

  /**
   * Get all registered users (Section 8)
   * GET /api/admin/users
   */
  async getUsers() {
    const res = await client.get('/admin/users');
    const parsed = res?.data || res;
    let rawList = [];
    if (Array.isArray(parsed)) {
      rawList = parsed;
    } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.data)) {
      rawList = parsed.data;
    } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.users)) {
      rawList = parsed.users;
    }
    return rawList.map(normalizeUser).filter(Boolean);
  },

  /**
   * Update user role (Section 8)
   * PUT /api/admin/users/:id/role
   */
  async updateUserRole(id, role) {
    const res = await client.put(`/admin/users/${id}/role`, { role });
    const raw = unwrapDoc(res?.data || res?.user || res);
    return normalizeUser(raw);
  },

  /**
   * Toggle user active status (Section 8)
   * PUT /api/admin/users/:id/toggle-status
   */
  async toggleUserStatus(id) {
    const res = await client.put(`/admin/users/${id}/toggle-status`, {});
    const raw = unwrapDoc(res?.data || res?.user || res);
    return normalizeUser(raw);
  },

  /**
   * Get all store orders for admin processing (Section 8)
   * GET /api/admin/orders
   */
  async getAdminOrders(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    const qs = query.toString();
    const endpoint = `/admin/orders${qs ? `?${qs}` : ''}`;

    const res = await client.get(endpoint);
    const parsed = res?.data || res;
    let rawList = [];
    if (Array.isArray(parsed)) {
      rawList = parsed;
    } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.data)) {
      rawList = parsed.data;
    } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.orders)) {
      rawList = parsed.orders;
    }

    return rawList.map(normalizeOrder).filter(Boolean);
  },

  getOrders(params = {}) {
    return this.getAdminOrders(params);
  }
};

export default adminApi;

