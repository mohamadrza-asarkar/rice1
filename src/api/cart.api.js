// -------------------------------------------------------------
// Shopping Cart API (/api/cart) using Axios
// -------------------------------------------------------------
import axiosInstance, { getStoredToken } from './axios';
import { unwrapDoc } from './auth.api';

export function normalizeCart(raw) {
  const data = unwrapDoc(raw?.data || raw);
  const products = Array.isArray(data?.products)
    ? data.products
    : (Array.isArray(data?.items) ? data.items : []);

  const items = products.map((p) => {
    const prod = p.product || {};
    const pid = p.productId || prod._id || prod.id || p._id || p.id;
    return {
      ...prod,
      ...p,
      id: pid,
      _id: pid,
      productId: pid,
      name: p.name || prod.name || p.title || 'برنج طلا رایس',
      price: Number(p.price || prod.price || 0),
      image: p.image || prod.image || '',
      quantity: Number(p.quantity || p.qty || 1)
    };
  });

  const totalPrice = Number(
    data?.totalPrice !== undefined
      ? data.totalPrice
      : items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  return {
    items,
    totalPrice,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0)
  };
}

export const cartApi = {
  /**
   * Get entire cart from server using axios.get with Token header
   */
  async getCart() {
    try {
      const token = getStoredToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axiosInstance.get('/cart', { headers });
      return normalizeCart(res);
    } catch {
      return { items: [], totalPrice: 0, totalItems: 0 };
    }
  },

  /**
   * Add item to cart using POST /cart/items
   */
  async addItem(productId, quantity = 1) {
    const token = getStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axiosInstance.post('/cart/items', {
      productId,
      quantity: Number(quantity)
    }, { headers });
    return normalizeCart(res);
  },

  /**
   * Update item quantity in cart using PUT /cart/items/:productId
   */
  async updateQuantity(productId, quantity) {
    const token = getStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axiosInstance.put(`/cart/items/${productId}`, {
      quantity: Number(quantity)
    }, { headers });
    return normalizeCart(res);
  },

  /**
   * Remove item from cart using DELETE /cart/items/:productId
   */
  async removeItem(productId) {
    const token = getStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axiosInstance.delete(`/cart/items/${productId}`, { headers });
    return normalizeCart(res);
  },

  /**
   * Clear entire cart using DELETE /cart
   */
  async clearCart() {
    const token = getStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axiosInstance.delete('/cart', { headers });
    return normalizeCart(res);
  }
};

export default cartApi;

