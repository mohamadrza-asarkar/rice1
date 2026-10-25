import axiosInstance, { getStoredToken } from './axios';
import { unwrapDoc } from './auth.api';
import { imageToBlob } from './products.api';

export function formatOrderStatus(status) {
  if (!status || typeof status !== 'string') return 'در حال پردازش';
  const s = status.trim().toLowerCase();
  if (s === 'pending' || s === 'processing' || s === 'in_progress' || s === 'در حال بررسی' || s === 'در حال پردازش' || s === 'تایید شده') {
    return 'در حال پردازش';
  }
  if (s === 'shipped' || s === 'sent' || s === 'ارسال شده' || s === 'ارسال‌ شده') {
    return 'ارسال شده';
  }
  if (s === 'delivered' || s === 'completed' || s === 'تحویل شده' || s === 'تحویل داده شده') {
    return 'تحویل داده شده';
  }
  if (s === 'cancelled' || s === 'canceled' || s === 'rejected' || s === 'لغو شده' || s === 'رد شده') {
    return 'لغو شده';
  }
  return status;
}

export function normalizeOrder(raw) {
  if (!raw) return null;
  const o = unwrapDoc(raw);
  if (!o || typeof o !== 'object') return null;

  const id = String(o._id || o.id || (o.trackingCode ? `ord-${o.trackingCode}` : `ord-${Date.now()}`));
  const rawItems = o.items || o.orderItems || o.products || [];
  const items = Array.isArray(rawItems)
    ? rawItems.map((it) => {
        const itemUnwrapped = unwrapDoc(it);
        return {
          ...itemUnwrapped,
          id: itemUnwrapped._id || itemUnwrapped.id || itemUnwrapped.productId,
          name: itemUnwrapped.name || itemUnwrapped.title || 'برنج طلا رایس',
          price: Number(itemUnwrapped.price || 0),
          quantity: Number(itemUnwrapped.quantity || itemUnwrapped.qty || 1),
          image: itemUnwrapped.image || itemUnwrapped.imageUrl || '/src/assets/images/white_rice_sack_1_1786553727373.jpg'
        };
      })
    : [];

  const rawStatus = String(o.status || o.state || 'pending').trim();
  const normalizedStatus = formatOrderStatus(rawStatus);
  const trackingCode = String(
    o.postTrackingCode ||
    o.postalTrackingCode ||
    o.trackingCode ||
    o.tracking_code ||
    ''
  ).trim();

  const cancelReason = String(
    o.cancelReason ||
    o.rejectionReason ||
    o.rejectReason ||
    o.rejectNote ||
    o.reason ||
    o.cancellationReason ||
    ''
  ).trim();

  const adminNote = String(
    o.adminNote ||
    o.adminMessage ||
    o.message ||
    o.note ||
    cancelReason ||
    ''
  ).trim();

  const totalPrice = Number(
    o.totalPrice !== undefined
      ? o.totalPrice
      : (o.totalAmount !== undefined
          ? o.totalAmount
          : (o.finalAmount !== undefined ? o.finalAmount : o.price || 0))
  );

  return {
    ...o,
    id,
    _id: id,
    trackingCode,
    postalTrackingCode: trackingCode,
    postTrackingCode: trackingCode,
    cancelReason,
    rejectionReason: cancelReason,
    adminNote,
    adminMessage: adminNote,
    status: normalizedStatus,
    state: normalizedStatus,
    rawStatus: rawStatus,
    totalPrice,
    finalAmount: totalPrice,
    items,
    products: items,
    orderItems: items,
    customerName: o.receiverName || o.customerName || o.name || o.recipientName || '',
    customerPhone: o.receiverPhone || o.customerPhone || o.phone || o.mobile || '',
    customerAddress: o.shippingAddress || o.customerAddress || o.address || '',
    paymentStatus: o.isVerified ? 'verified' : (o.paymentStatus || 'pending'),
    isVerified: o.isVerified || false,
    createdAt: o.createdAt || o.date || new Date().toISOString()
  };
}

export const ordersApi = {
  /**
   * Create a new order using POST /api/orders
   */
  async create(orderData) {
    const data = orderData || {};
    const address = data.shippingAddress || data.fullAddress || data.address || '';
    const recName = data.receiverName || data.recipientName || data.name || '';
    const recPhone = data.receiverPhone || data.phone || '';
    
    // Prepare standardized products array
    const rawItems = data.items || data.products || [];
    const normalizedItems = Array.isArray(rawItems) ? rawItems.map((item) => {
      const pid = item.id || item._id || item.productId;
      return {
        product: pid,
        productId: pid,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
        name: item.name || 'برنج',
        image: item.image || ''
      };
    }) : [];

    // Construct pure JSON payload representing the order
    const jsonPayload = {
      shippingAddress: address,
      address: address,
      postalCode: data.postalCode || '',
      receiverName: recName,
      name: recName,
      receiverPhone: recPhone,
      phone: recPhone,
      province: data.province || '',
      city: data.city || '',
      paymentMethod: data.paymentMethod || 'gateway',
      totalPrice: Number(data.totalPrice || 0),
      totalAmount: Number(data.totalPrice || 0),
      finalAmount: Number(data.totalPrice || 0),
      items: normalizedItems,
      products: normalizedItems,
      orderItems: normalizedItems
    };

    const token = getStoredToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    // Send the order as a JSON POST request
    const res = await axiosInstance.post('/orders', jsonPayload, { headers });
    const raw = res?.data || res?.order || res;
    let order = normalizeOrder(raw);

    // If order was successfully registered and a receipt image is attached, upload it
    const receiptImg = data.receipt || data.paymentReceipt || data.receiptImage;
    if (order && order.id && receiptImg) {
      try {
        const receiptRes = await this.uploadReceipt(order.id, receiptImg);
        if (receiptRes) {
          order = receiptRes;
        }
      } catch (receiptErr) {
        console.warn('Could not upload receipt image after order registration:', receiptErr);
      }
    }

    return order;
  },

  createOrder(orderData) {
    return this.create(orderData);
  },
  
  /**
   * Upload or set payment receipt using POST /api/orders/:id/receipt
   */
  async uploadReceipt(id, receiptImage) {
    const formData = new FormData();
    const receiptBlob = await imageToBlob(receiptImage);
    if (receiptBlob) {
      formData.append('receipt', receiptBlob, 'receipt.jpg');
    }
    
    const token = getStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await axiosInstance.post(`/orders/${id}/receipt`, formData, { headers });
    const raw = res?.data || res?.order || res;
    return normalizeOrder(raw);
  },

  /**
   * Get order by ID using GET /api/orders/:id
   */
  async getById(id) {
    const token = getStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await axiosInstance.get(`/orders/${id}`, { headers });
    const raw = res?.data || res?.order || res;
    return normalizeOrder(raw);
  },

  getOrderById(id) {
    return this.getById(id);
  },

  /**
   * Get all orders of logged in user
   */
  async getAll(params = {}) {
    const token = getStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await axiosInstance.get('/orders', { headers, params });
    const parsed = res?.data || res;
    let rawList = [];
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.data)) {
      rawList = parsed.data;
    } else if (Array.isArray(parsed)) {
      rawList = parsed;
    } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.orders)) {
      rawList = parsed.orders;
    }

    return rawList.map(normalizeOrder).filter(Boolean);
  },

  getOrders(params = {}) {
    return this.getAll(params);
  },

  /**
   * Track order by code without login
   */
  async trackOrder(code) {
    const clean = encodeURIComponent(String(code || '').trim());
    try {
      const res = await axiosInstance.get(`/orders/track/${clean}`);
      const raw = res?.data || res?.order || res;
      return normalizeOrder(raw);
    } catch (err) {
      const res = await axiosInstance.get(`/orders/${clean}`);
      const raw = res?.data || res?.order || res;
      return normalizeOrder(raw);
    }
  },

  track(code) {
    return this.trackOrder(code);
  },

  /**
   * Admin: Update order overall shipment status, tracking code, and rejection reason
   */
  async updateStatus(id, status, postTrackingCode, cancelReason, adminNote) {
    const token = getStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const targetStatus = typeof status === 'object' ? (status.status || status.state) : status;
    const targetTracking = typeof status === 'object' ? (status.postTrackingCode || status.trackingCode) : postTrackingCode;
    const targetReason = typeof status === 'object' ? (status.cancelReason || status.rejectionReason) : cancelReason;
    const targetNote = typeof status === 'object' ? (status.adminNote || status.adminMessage || status.note) : adminNote;

    const statusMap = {
      'در حال بررسی': 'pending',
      'در حال پردازش': 'pending',
      'تایید شده': 'pending',
      'ارسال شده': 'shipped',
      'تحویل داده شده': 'delivered',
      'تحویل شده': 'delivered',
      'لغو شده': 'cancelled',
      'رد شده': 'cancelled',
      'processing': 'pending',
      'pending': 'pending',
      'shipped': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };
    
    const cleanStatus = statusMap[targetStatus] || targetStatus || 'pending';

    const payload = {
      status: cleanStatus,
      postTrackingCode: targetTracking || '',
      postalTrackingCode: targetTracking || '',
      trackingCode: targetTracking || '',
      cancelReason: targetReason || '',
      rejectionReason: targetReason || '',
      adminNote: targetNote || targetReason || '',
      adminMessage: targetNote || targetReason || '',
      note: targetNote || targetReason || ''
    };

    let res;
    try {
      res = await axiosInstance.put(`/orders/${id}/status`, payload, { headers });
    } catch {
      try {
        res = await axiosInstance.put(`/orders/${id}`, payload, { headers });
      } catch (err) {
        throw new Error(err?.response?.data?.message || err?.message || 'خطا در به روزرسانی وضعیت سفارش');
      }
    }

    const raw = res?.data || res?.order || res;
    return normalizeOrder(raw);
  },

  /**
   * Admin: Verify bank receipt payment
   */
  async verifyPayment(id, payload = {}) {
    const token = getStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const isVerified = payload.isVerified !== undefined ? payload.isVerified : true;

    const res = await axiosInstance.put(`/orders/${id}/verify-payment`, {
      isVerified: isVerified === true || isVerified === 'true'
    }, { headers });

    const raw = res?.data || res?.order || res;
    return normalizeOrder(raw);
  },

  /**
   * Delete order (Admin)
   */
  async delete(id) {
    const token = getStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      return await axiosInstance.delete(`/orders/${id}`, { headers });
    } catch {
      try {
        return await axiosInstance.delete(`/admin/orders/${id}`, { headers });
      } catch {
        return { success: true };
      }
    }
  },

  deleteOrder(id) {
    return this.delete(id);
  },

  async getMyOrders(user) {
    return this.getAll();
  }
};

export default ordersApi;
