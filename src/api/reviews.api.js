// -------------------------------------------------------------
// Reviews API (/api/reviews) using Axios & native client
// -------------------------------------------------------------
import axiosInstance, { getStoredToken } from './axios';
import { unwrapDoc } from './auth.api';

export function normalizeReview(raw) {
  if (!raw) return null;
  const r = unwrapDoc(raw);
  if (!r || typeof r !== 'object') return null;

  const revId = String(r._id || r.id || '');
  const prodId = typeof r.productId === 'object' && r.productId !== null
    ? String(r.productId._id || r.productId.id || '')
    : String(r.productId || r.product || r.product_id || '');

  const reply = r.reply || r.adminReply || r.replyText || null;

  // Extract author / username accurately from all possible backend fields
  let userDisplay = '';
  const u = (r.user && typeof r.user === 'object') ? r.user : ((r.userId && typeof r.userId === 'object') ? r.userId : null);

  if (r.userName && typeof r.userName === 'string' && r.userName.trim() && r.userName !== 'کاربر خریدار' && r.userName !== 'خریدار محترم' && r.userName !== 'کاربر محترم') {
    userDisplay = r.userName.trim();
  } else if (r.name && typeof r.name === 'string' && r.name.trim()) {
    userDisplay = r.name.trim();
  } else if (r.fullName && typeof r.fullName === 'string' && r.fullName.trim()) {
    userDisplay = r.fullName.trim();
  } else if (r.author && typeof r.author === 'string' && r.author.trim() && r.author !== 'خریدار محترم' && r.author !== 'کاربر خریدار' && r.author !== 'کاربر محترم') {
    userDisplay = r.author.trim();
  } else if (r.authorName && typeof r.authorName === 'string' && r.authorName.trim()) {
    userDisplay = r.authorName.trim();
  } else if (r.username && typeof r.username === 'string' && r.username.trim()) {
    userDisplay = r.username.trim();
  } else if (u) {
    userDisplay = u.name || u.fullName || u.username || (u.phone ? `کاربر (${u.phone})` : (u.email ? u.email.split('@')[0] : ''));
  } else if (typeof r.user === 'string' && r.user.trim()) {
    const val = r.user.trim();
    if (val.startsWith('09') || /^\d{10,12}$/.test(val)) {
      userDisplay = `کاربر (${val})`;
    } else if (val.includes('@')) {
      userDisplay = val.split('@')[0];
    } else if (!/^[0-9a-fA-F]{24}$/.test(val)) {
      userDisplay = val;
    }
  }

  if (!userDisplay) {
    userDisplay = r.phone ? `کاربر (${r.phone})` : (r.email ? r.email.split('@')[0] : (r.userName || r.author || 'کاربر سایت'));
  }

  return {
    ...r,
    id: revId,
    _id: revId,
    productId: prodId,
    userName: userDisplay,
    author: userDisplay,
    comment: r.comment || r.text || r.body || '',
    rating: Number(r.rating || 5),
    createdAt: r.createdAt || new Date().toISOString(),
    reply: reply ? (typeof reply === 'object' ? (reply.replyText || reply.comment || reply.text) : reply) : null
  };
}

export const reviewsApi = {
  /**
   * Get all reviews across products (Admin / Global) using GET /api/reviews
   */
  async getAll() {
    const res = await axiosInstance.get('/reviews');
    const parsed = res?.data || res;
    let rawList = [];
    if (Array.isArray(parsed)) {
      rawList = parsed;
    } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.data)) {
      rawList = parsed.data;
    } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.reviews)) {
      rawList = parsed.reviews;
    }

    return rawList.map(normalizeReview).filter(Boolean);
  },

  /**
   * Get reviews for a product using GET /api/reviews?productId=...
   */
  async getByProductId(productId) {
    if (!productId) return [];
    const cleanId = typeof productId === 'object' ? (productId._id || productId.id) : productId;
    if (!cleanId) return [];

    const res = await axiosInstance.get(`/reviews?productId=${encodeURIComponent(cleanId)}`);
    const parsed = res?.data || res;
    let rawList = [];
    if (Array.isArray(parsed)) {
      rawList = parsed;
    } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.data)) {
      rawList = parsed.data;
    } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.reviews)) {
      rawList = parsed.reviews;
    }

    return rawList.map(normalizeReview).filter(Boolean);
  },

  /**
   * Post new review using POST /api/reviews
   * Request body: { productId: string, rating: number, comment: string, userName?: string }
   */
  async create({ productId, comment, rating = 5, userName = '' }) {
    const cleanId = typeof productId === 'object' ? (productId._id || productId.id) : productId;
    if (!cleanId) {
      throw new Error('شناسه محصول برای ثبت نظر نامعتبر است.');
    }

    const token = getStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const payload = {
      productId: String(cleanId),
      rating: Number(rating || 5),
      comment: String(comment || '').trim()
    };

    if (userName && typeof userName === 'string' && userName.trim()) {
      payload.userName = userName.trim();
      payload.name = userName.trim();
      payload.author = userName.trim();
    }

    const res = await axiosInstance.post('/reviews', payload, { headers });
    const raw = res?.data || res?.review || res;
    const normalized = normalizeReview(raw);
    if (normalized && (!normalized.userName || normalized.userName === 'کاربر سایت') && userName) {
      normalized.userName = userName;
      normalized.author = userName;
    }
    return normalized;
  },

  /**
   * Admin: Reply to user review using POST /api/reviews/:id/reply
   * Request body: { replyText: string }
   */
  async reply(reviewId, text) {
    const cleanId = typeof reviewId === 'object' ? (reviewId._id || reviewId.id) : reviewId;
    if (!cleanId) {
      throw new Error('شناسه نظر نامعتبر است.');
    }

    const token = getStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const cleanText = typeof text === 'object' ? (text.reply || text.replyText || text.comment || text.text) : text;
    const replyBody = { 
      replyText: String(cleanText || '').trim(),
      reply: String(cleanText || '').trim()
    };

    const res = await axiosInstance.post(`/reviews/${cleanId}/reply`, replyBody, { headers });
    return unwrapDoc(res?.data || res);
  },

  /**
   * Admin: Delete review using DELETE /api/reviews/:id
   */
  async delete(reviewId) {
    const cleanId = typeof reviewId === 'object' ? (reviewId._id || reviewId.id) : reviewId;
    if (!cleanId) {
      throw new Error('شناسه نظر نامعتبر است.');
    }

    const token = getStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return await axiosInstance.delete(`/reviews/${cleanId}`, { headers });
  }
};

export default reviewsApi;
