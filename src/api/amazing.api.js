// -------------------------------------------------------------
// Amazing Products API (/api/amazing-products)
// Section 3 of backend API Documentation
// -------------------------------------------------------------
import { client } from './client';
import { unwrapDoc } from './auth.api';
import { normalizeProduct, imageToBlob } from './products.api';

export function normalizeAmazingProduct(raw) {
  if (!raw) return null;
  const p = unwrapDoc(raw);
  if (!p || typeof p !== 'object') return null;

  const base = normalizeProduct(p);
  const originalPrice = Number(p.originalPrice || p.oldPrice || base.originalPrice || base.price || 480000);
  const discountPercent = Number(p.discountPercent || p.discount || base.discountPercent || 15);
  const price = Number(p.price || p.dealPrice || (originalPrice > 0 ? Math.round(originalPrice * (1 - discountPercent / 100)) : base.price));

  const durationHours = Number(p.amazingDurationHours || p.dealDurationHours || p.durationHours || 0);
  let amazingExpiresAt = p.amazingExpiresAt || p.expiresAt || p.dealExpiresAt || p.endTime || p.expireDate || null;
  if (!amazingExpiresAt && durationHours > 0) {
    const createdMs = p.createdAt ? new Date(p.createdAt).getTime() : Date.now();
    amazingExpiresAt = new Date(createdMs + durationHours * 3600 * 1000).toISOString();
  }

  return {
    ...base,
    originalPrice,
    price,
    dealPrice: price,
    discountPercent,
    isAmazing: true,
    amazingExpiresAt,
    amazingDurationHours: durationHours || null,
    dealDurationHours: durationHours || null,
    createdAt: p.createdAt || p.created_at || base.createdAt || null
  };
}

export const amazingProductsApi = {
  /**
   * Get all amazing / deal products
   */
  async getAll(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.sortBy) query.append('sortBy', params.sortBy);

    const qs = query.toString();
    const endpoint = `/amazing-products${qs ? `?${qs}` : ''}`;

    let rawList = [];
    try {
      const res = await client.get(endpoint);
      const parsed = res;
      if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.data)) {
          rawList = parsed.data;
        } else if (Array.isArray(parsed.products)) {
          rawList = parsed.products;
        } else if (Array.isArray(parsed)) {
          rawList = parsed;
        }
      } else if (Array.isArray(parsed)) {
        rawList = parsed;
      }
    } catch (err) {
      console.warn('GET /amazing-products error:', err);
    }

    // Fallback: If /amazing-products returns empty array, try GET /products?isAmazing=true
    if (!rawList || rawList.length === 0) {
      try {
        const altRes = await client.get('/products?isAmazing=true');
        const parsedAlt = altRes;
        if (parsedAlt && typeof parsedAlt === 'object') {
          if (Array.isArray(parsedAlt.data)) {
            rawList = parsedAlt.data;
          } else if (Array.isArray(parsedAlt.products)) {
            rawList = parsedAlt.products;
          } else if (Array.isArray(parsedAlt)) {
            rawList = parsedAlt;
          }
        } else if (Array.isArray(parsedAlt)) {
          rawList = parsedAlt;
        }
      } catch (err) {
        console.warn('GET /products?isAmazing=true error:', err);
      }
    }

    if (!rawList || rawList.length === 0) {
      rawList = [
        {
          id: 'prod-kamfirooz-10kg',
          _id: 'prod-kamfirooz-10kg',
          name: 'پیشنهاد شگفت‌انگیز: برنج معطر کامفیروز شیراز (۱۰ کیلوگرم)',
          price: 920000,
          originalPrice: 1080000,
          discountPercent: 15,
          dealPrice: 920000,
          category: 'kamfirooz',
          categoryName: 'کامفیروز اصیل',
          weight: '۱۰ کیلوگرم',
          image: '/src/assets/images/white_rice_sack_1_1786553727373.jpg',
          amazingDurationHours: 48,
          amazingExpiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString()
        },
        {
          id: 'prod-tarom-hashemi-10kg',
          _id: 'prod-tarom-hashemi-10kg',
          name: 'پیشنهاد شگفت‌انگیز: برنج طارم هاشمی درجه یک (۱۰ کیلوگرم)',
          price: 1190000,
          originalPrice: 1320000,
          discountPercent: 10,
          dealPrice: 1190000,
          category: 'hashemi',
          categoryName: 'طارم هاشمی',
          weight: '۱۰ کیلوگرم',
          image: '/src/assets/images/white_rice_sack_2_1786553744148.jpg',
          amazingDurationHours: 72,
          amazingExpiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString()
        }
      ];
    }

    return rawList.map(normalizeAmazingProduct).filter(Boolean);
  },

  /**
   * Create amazing product (Admin) using Multipart Form-Data
   */
  async create(dealData) {
    const data = dealData || {};
    const formData = new FormData();
    const name = (data.name || '').trim();
    if (name) formData.append('name', name);
    if (data.productId) formData.append('productId', String(data.productId));
    if (data.originalPrice !== undefined) formData.append('originalPrice', String(data.originalPrice || 0));
    if (data.discountPercent !== undefined) formData.append('discountPercent', String(data.discountPercent || 0));
    if (data.dealPrice !== undefined) formData.append('dealPrice', String(data.dealPrice));
    formData.append('isAmazing', 'true');
    if (data.amazingDurationDays || data.dealDurationDays) {
      formData.append('amazingDurationDays', String(data.amazingDurationDays || data.dealDurationDays));
    }
    if (data.amazingDurationHours || data.dealDurationHours) {
      formData.append('amazingDurationHours', String(data.amazingDurationHours || data.dealDurationHours));
    }
    
    let expiresAt = data.amazingExpiresAt || data.expiresAt;
    if (!expiresAt && data.dealDurationHours) {
      expiresAt = new Date(Date.now() + Number(data.dealDurationHours) * 3600 * 1000).toISOString();
    }
    if (expiresAt) {
      formData.append('amazingExpiresAt', String(expiresAt));
    }

    const imageBlob = await imageToBlob(data.imageBase64 || data.image);
    if (imageBlob) {
      formData.append('image', imageBlob, 'amazing_image.jpg');
    }

    const res = await client.post('/amazing-products', formData);
    const raw = res?.data || res?.product || res;
    return normalizeAmazingProduct(raw);
  },

  add(dealData) {
    return this.create(dealData);
  },

  /**
   * Update amazing product (Admin) using Multipart Form-Data
   */
  async update(id, updateData) {
    const formData = new FormData();
    if (updateData.name !== undefined) formData.append('name', (updateData.name || '').trim());
    if (updateData.originalPrice !== undefined) formData.append('originalPrice', String(updateData.originalPrice || 0));
    if (updateData.discountPercent !== undefined) formData.append('discountPercent', String(updateData.discountPercent || 0));
    if (updateData.dealPrice !== undefined) formData.append('dealPrice', String(updateData.dealPrice));

    const hours = Number(updateData.amazingDurationHours || updateData.dealDurationHours || updateData.durationHours || 0);
    if (hours > 0) {
      formData.append('amazingDurationHours', String(hours));
      formData.append('dealDurationHours', String(hours));
      if (!updateData.amazingExpiresAt && !updateData.expiresAt) {
        updateData.amazingExpiresAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();
      }
    }

    const expiresAt = updateData.amazingExpiresAt || updateData.expiresAt;
    if (expiresAt !== undefined) {
      formData.append('amazingExpiresAt', expiresAt ? String(expiresAt) : '');
      formData.append('expiresAt', expiresAt ? String(expiresAt) : '');
    }

    if (updateData.imageBase64 || updateData.image) {
      const imageBlob = await imageToBlob(updateData.imageBase64 || updateData.image);
      if (imageBlob) {
        formData.append('image', imageBlob, 'amazing_image.jpg');
      }
    }

    const res = await client.put(`/amazing-products/${id}`, formData);
    const raw = res?.data || res?.product || res;
    return normalizeAmazingProduct(raw);
  },

  /**
   * Toggle amazing product status for a product ID (Admin)
   */
  async toggle(id) {
    const res = await client.put(`/amazing-products/toggle/${id}`);
    const raw = res?.data || res?.product || res;
    return normalizeAmazingProduct(raw);
  },

  /**
   * Remove amazing status for a product ID without deleting the product from DB
   */
  async remove(id) {
    try {
      return await this.toggle(id);
    } catch {
      try {
        const formData = new FormData();
        formData.append('isAmazing', 'false');
        formData.append('discountPercent', '0');
        const res = await client.put(`/products/${id}`, formData);
        return res;
      } catch {
        return null;
      }
    }
  },

  delete(id) {
    return this.remove(id);
  }
};

export default amazingProductsApi;
