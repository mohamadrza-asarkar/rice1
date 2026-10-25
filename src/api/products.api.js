// -------------------------------------------------------------
// Products API (/api/products)
// Native fetch implementation
// -------------------------------------------------------------
import axiosInstance, { getStoredToken } from './axios';
import { getImageUrl } from './client';
import { unwrapDoc } from './auth.api';

export function normalizeProduct(raw) {
  if (!raw) return null;
  const p = unwrapDoc(raw);
  if (!p || typeof p !== 'object') return null;

  const id = String(p._id || p.id || `prod-${Date.now()}`);
  const rawImage = p.image || p.imageUrl || p.fullImageUrl || '';
  const image = rawImage ? getImageUrl(rawImage) : '/src/assets/images/white_rice_sack_1_1786553727373.jpg';

  const price = Number(p.dealPrice > 0 ? p.dealPrice : (p.price || 0));
  const originalPrice = Number(p.originalPrice || p.oldPrice || price);
  const discountPercent = Number(p.discountPercent || p.discount || 0);
  const computedDiscount = originalPrice > price && price > 0
    ? (discountPercent > 0 ? discountPercent : Math.round((1 - price / originalPrice) * 100))
    : 0;

  const stock = Number(p.countInStock ?? p.stock ?? 20);

  return {
    ...p,
    id,
    _id: id,
    name: p.name || p.title || 'برنج اصیل ایرانی',
    description: p.description || '',
    price,
    originalPrice,
    oldPrice: originalPrice,
    discountPercent: computedDiscount,
    dealPrice: p.dealPrice || price,
    isAmazing: Boolean(p.isAmazing),
    amazingExpiresAt: p.amazingExpiresAt || null,
    isAvailable: p.isAvailable !== false,
    stock,
    countInStock: stock,
    weight: p.weight || '۱۰ کیلوگرم',
    category: p.category || 'kamfirouz',
    rating: Number(p.rating || 4.9),
    reviewsCount: Number(p.reviewsCount || p.reviews?.length || 12),
    image,
    imageUrl: image,
    fullImageUrl: image
  };
}

// Helper to convert base64 to Blob
export function dataURLtoBlob(dataurl) {
  if (!dataurl || typeof dataurl !== 'string' || !dataurl.startsWith('data:')) {
    return null;
  }
  try {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (err) {
    console.warn('Error converting dataURL to Blob:', err);
    return null;
  }
}

// Helper to convert any image source (file, blob, base64, path) to Blob
export async function imageToBlob(imageSource) {
  if (!imageSource) return null;
  if (imageSource instanceof Blob) return imageSource;
  if (imageSource instanceof File) return imageSource;
  if (typeof imageSource === 'string') {
    if (imageSource.startsWith('data:')) {
      return dataURLtoBlob(imageSource);
    }
    try {
      const response = await fetch(imageSource);
      return await response.blob();
    } catch (err) {
      console.warn('Could not fetch image to blob, sending dummy GIF:', err);
      return new Blob([
        new Uint8Array([
          0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
          0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0x21, 0xf9, 0x04, 0x01, 0x00,
          0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
          0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b
        ])
      ], { type: 'image/gif' });
    }
  }
  return null;
}

export const DEFAULT_PRODUCTS = [
  {
    id: 'prod-kamfirooz-10kg',
    _id: 'prod-kamfirooz-10kg',
    name: 'برنج معطر کامفیروز شیراز (کیسه ۱۰ کیلویی)',
    description: 'برنج ناب و اصیل شالیزارهای حوزه سد درودزن و کامفیروز فارس؛ کاملاً بوجار و الک خورده با عطر سنتی ماندگار و پخت بسیار نرم.',
    price: 920000,
    originalPrice: 1080000,
    oldPrice: 1080000,
    discountPercent: 15,
    dealPrice: 920000,
    isAmazing: true,
    isAvailable: true,
    stock: 85,
    countInStock: 85,
    weight: '۱۰ کیلوگرم',
    category: 'kamfirooz',
    categoryName: 'کامفیروز اصیل',
    rating: 4.9,
    reviewsCount: 42,
    image: '/src/assets/images/white_rice_sack_1_1786553727373.jpg',
    imageUrl: '/src/assets/images/white_rice_sack_1_1786553727373.jpg',
    fullImageUrl: '/src/assets/images/white_rice_sack_1_1786553727373.jpg'
  },
  {
    id: 'prod-tarom-hashemi-10kg',
    _id: 'prod-tarom-hashemi-10kg',
    name: 'برنج طارم هاشمی درجه یک گیلان (کیسه ۱۰ کیلویی)',
    description: 'دانه‌های کشیده و استخوانی با عطر دلنشین و ری‌دهی فوق‌العاده؛ سورت لیزری شده بدون دانه‌های شکسته، مناسب مجالس و مهمانی‌ها.',
    price: 1190000,
    originalPrice: 1320000,
    oldPrice: 1320000,
    discountPercent: 10,
    dealPrice: 1190000,
    isAmazing: true,
    isAvailable: true,
    stock: 60,
    countInStock: 60,
    weight: '۱۰ کیلوگرم',
    category: 'hashemi',
    categoryName: 'طارم هاشمی',
    rating: 5.0,
    reviewsCount: 51,
    image: '/src/assets/images/white_rice_sack_2_1786553744148.jpg',
    imageUrl: '/src/assets/images/white_rice_sack_2_1786553744148.jpg',
    fullImageUrl: '/src/assets/images/white_rice_sack_2_1786553744148.jpg'
  },
  {
    id: 'prod-damsiah-10kg',
    _id: 'prod-damsiah-10kg',
    name: 'برنج دمسیاه اعلا و اصیل شمال (کیسه ۱۰ کیلویی)',
    description: 'از کهن‌ترین و گرانبهاترین ارقام برنج ایرانی؛ دارای ریشک سیاه در خوشه، قد کشیدن استثنایی و عطر بسیار اشرافی.',
    price: 1350000,
    originalPrice: 1480000,
    oldPrice: 1480000,
    discountPercent: 9,
    dealPrice: 1350000,
    isAmazing: false,
    isAvailable: true,
    stock: 40,
    countInStock: 40,
    weight: '۱۰ کیلوگرم',
    category: 'damsiah',
    categoryName: 'برنج دمسیاه',
    rating: 4.9,
    reviewsCount: 26,
    image: '/src/assets/images/white_rice_sack_3_1786553768867.jpg',
    imageUrl: '/src/assets/images/white_rice_sack_3_1786553768867.jpg',
    fullImageUrl: '/src/assets/images/white_rice_sack_3_1786553768867.jpg'
  },
  {
    id: 'prod-anbarboo-10kg',
    _id: 'prod-anbarboo-10kg',
    name: 'برنج عنبربو ممتاز شوشتر (کیسه ۱۰ کیلویی)',
    description: 'برنج طبع گرم جنوب با هضم فوق‌العاده سبک، عطر قوی و دانه متوسط؛ انتخابی اقتصادی، سالم و پرخاصیت برای سفره خانواده.',
    price: 740000,
    originalPrice: 820000,
    oldPrice: 820000,
    discountPercent: 10,
    dealPrice: 740000,
    isAmazing: false,
    isAvailable: true,
    stock: 90,
    countInStock: 90,
    weight: '۱۰ کیلوگرم',
    category: 'anbarboo',
    categoryName: 'عنبربو جنوب',
    rating: 4.7,
    reviewsCount: 35,
    image: '/src/assets/images/white_rice_sack_1_1786553727373.jpg',
    imageUrl: '/src/assets/images/white_rice_sack_1_1786553727373.jpg',
    fullImageUrl: '/src/assets/images/white_rice_sack_1_1786553727373.jpg'
  },
  {
    id: 'prod-fajr-10kg',
    _id: 'prod-fajr-10kg',
    name: 'برنج فجر سوزنی اعلا گرگان (کیسه ۱۰ کیلویی)',
    description: 'برنج پرمحصول با کیفیت طارم و ظاهر کریستالی دانه شیشه‌ای، ری‌کشی بالا و طعم بسیار لذیذ پس از دم کشیدن.',
    price: 890000,
    originalPrice: 980000,
    oldPrice: 980000,
    discountPercent: 9,
    dealPrice: 890000,
    isAmazing: false,
    isAvailable: true,
    stock: 55,
    countInStock: 55,
    weight: '۱۰ کیلوگرم',
    category: 'fajr',
    categoryName: 'برنج فجر',
    rating: 4.8,
    reviewsCount: 22,
    image: '/src/assets/images/white_rice_sack_2_1786553744148.jpg',
    imageUrl: '/src/assets/images/white_rice_sack_2_1786553744148.jpg',
    fullImageUrl: '/src/assets/images/white_rice_sack_2_1786553744148.jpg'
  },
  {
    id: 'prod-smoked-10kg',
    _id: 'prod-smoked-10kg',
    name: 'برنج دودی سنتی هیزمی مازندران (کیسه ۱۰ کیلویی)',
    description: 'دود داده شده در اتاقک‌های چوبی سنتی با خاک اره درختان جنگلی؛ عطر نوستالژیک دودی و مناسب پخت همراه با ماهی و غذاهای محلی.',
    price: 1280000,
    originalPrice: 1420000,
    oldPrice: 1420000,
    discountPercent: 10,
    dealPrice: 1280000,
    isAmazing: false,
    isAvailable: true,
    stock: 35,
    countInStock: 35,
    weight: '۱۰ کیلوگرم',
    category: 'smoked',
    categoryName: 'برنج دودی',
    rating: 4.8,
    reviewsCount: 19,
    image: '/src/assets/images/white_rice_sack_3_1786553768867.jpg',
    imageUrl: '/src/assets/images/white_rice_sack_3_1786553768867.jpg',
    fullImageUrl: '/src/assets/images/white_rice_sack_3_1786553768867.jpg'
  },
  {
    id: 'prod-broken-kamfirooz-5kg',
    _id: 'prod-broken-kamfirooz-5kg',
    name: 'نیم‌دانه معطر کامفیروزی درجه یک (کیسه ۵ کیلویی)',
    description: 'شکسته و نیم‌دانه خالص بوجار شده شالیزار کامفیروز بدون هرگونه خاکه؛ ایده‌آل برای شله‌زرد، سوپ، شیربرنج و حلیم.',
    price: 420000,
    originalPrice: 470000,
    oldPrice: 470000,
    discountPercent: 11,
    dealPrice: 420000,
    isAmazing: false,
    isAvailable: true,
    stock: 70,
    countInStock: 70,
    weight: '۵ کیلوگرم',
    category: 'broken',
    categoryName: 'نیم دانه',
    rating: 4.7,
    reviewsCount: 17,
    image: '/src/assets/images/white_rice_sack_1_1786553727373.jpg',
    imageUrl: '/src/assets/images/white_rice_sack_1_1786553727373.jpg',
    fullImageUrl: '/src/assets/images/white_rice_sack_1_1786553727373.jpg'
  },
  {
    id: 'prod-lasheh-hashemi-10kg',
    _id: 'prod-lasheh-hashemi-10kg',
    name: 'لاشه و سرلاشه طارم هاشمی ممتاز (کیسه ۱۰ کیلویی)',
    description: 'دانه‌های درشت شکسته برنج طارم هاشمی گیلان با عطر و طعم ۱۰۰ درصد مشابه دانه کامل؛ قیمت مقرون به صرفه جهت مصرف روزمره.',
    price: 810000,
    originalPrice: 900000,
    oldPrice: 900000,
    discountPercent: 10,
    dealPrice: 810000,
    isAmazing: false,
    isAvailable: true,
    stock: 45,
    countInStock: 45,
    weight: '۱۰ کیلوگرم',
    category: 'broken',
    categoryName: 'نیم دانه و لاشه',
    rating: 4.8,
    reviewsCount: 24,
    image: '/src/assets/images/white_rice_sack_2_1786553744148.jpg',
    imageUrl: '/src/assets/images/white_rice_sack_2_1786553744148.jpg',
    fullImageUrl: '/src/assets/images/white_rice_sack_2_1786553744148.jpg'
  },
  {
    id: 'prod-kamfirooz-5kg',
    _id: 'prod-kamfirooz-5kg',
    name: 'برنج کامفیروز شیراز دست‌چین (کیسه ۵ کیلویی)',
    description: 'بسته‌بندی ۵ کیلویی نخی کاملاً هواکش و استاندارد؛ مناسب خانواده‌های کم‌جمعیت جهت تجربه طعم اصیل برنج سنتی فارس.',
    price: 490000,
    originalPrice: 560000,
    oldPrice: 560000,
    discountPercent: 12,
    dealPrice: 490000,
    isAmazing: false,
    isAvailable: true,
    stock: 80,
    countInStock: 80,
    weight: '۵ کیلوگرم',
    category: 'kamfirooz',
    categoryName: 'کامفیروز اصیل',
    rating: 4.9,
    reviewsCount: 28,
    image: '/src/assets/images/white_rice_sack_3_1786553768867.jpg',
    imageUrl: '/src/assets/images/white_rice_sack_3_1786553768867.jpg',
    fullImageUrl: '/src/assets/images/white_rice_sack_3_1786553768867.jpg'
  },
  {
    id: 'prod-tarom-hashemi-5kg',
    _id: 'prod-tarom-hashemi-5kg',
    name: 'برنج طارم هاشمی معطر شمال (کیسه ۵ کیلویی)',
    description: 'کیسه ۵ کیلوگرمی طارم هاشمی دانه بلند بوجار شده، ضمانت پخت و نرمی بعد از سرد شدن.',
    price: 620000,
    originalPrice: 690000,
    oldPrice: 690000,
    discountPercent: 10,
    dealPrice: 620000,
    isAmazing: false,
    isAvailable: true,
    stock: 65,
    countInStock: 65,
    weight: '۵ کیلوگرم',
    category: 'hashemi',
    categoryName: 'طارم هاشمی',
    rating: 4.9,
    reviewsCount: 33,
    image: '/src/assets/images/white_rice_sack_1_1786553727373.jpg',
    imageUrl: '/src/assets/images/white_rice_sack_1_1786553727373.jpg',
    fullImageUrl: '/src/assets/images/white_rice_sack_1_1786553727373.jpg'
  }
];

export const productsApi = {
  /**
   * Get all products with optional filters using axios.get
   */
  async getAll(params = {}) {
    let rawList = [];
    let pagination = null;

    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', params.page);
      if (params.limit) query.append('limit', params.limit);
      if (params.search || params.q) query.append('search', params.search || params.q);
      if (params.isAvailable !== undefined) query.append('isAvailable', params.isAvailable);
      if (params.isAmazing !== undefined) query.append('isAmazing', params.isAmazing);
      if (params.minPrice) query.append('minPrice', params.minPrice);
      if (params.maxPrice) query.append('maxPrice', params.maxPrice);
      if (params.sortBy || params.sort) query.append('sortBy', params.sortBy || params.sort);
      if (params.category) query.append('category', params.category);

      const qs = query.toString();
      const endpoint = `/products${qs ? `?${qs}` : ''}`;
      const res = await axiosInstance.get(endpoint);
      const parsed = res;

      if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.products)) {
          rawList = parsed.products;
        } else if (Array.isArray(parsed.data)) {
          rawList = parsed.data;
        } else if (parsed.data && typeof parsed.data === 'object' && Array.isArray(parsed.data.products)) {
          rawList = parsed.data.products;
        } else if (parsed.data && typeof parsed.data === 'object' && Array.isArray(parsed.data.data)) {
          rawList = parsed.data.data;
        } else if (Array.isArray(parsed)) {
          rawList = parsed;
        } else if (parsed.products && typeof parsed.products === 'object' && Array.isArray(parsed.products.data)) {
          rawList = parsed.products.data;
        }
        pagination = parsed.pagination || parsed.data?.pagination || null;
      } else if (Array.isArray(parsed)) {
        rawList = parsed;
      }
    } catch {
      // Backend offline or unreachable: fall back to default catalog
    }

    if (!rawList || rawList.length === 0) {
      let filtered = [...DEFAULT_PRODUCTS];
      if (params.category && params.category !== 'all') {
        filtered = filtered.filter(p => p.category === params.category);
      }
      if (params.isAmazing !== undefined) {
        filtered = filtered.filter(p => Boolean(p.isAmazing) === (params.isAmazing === true || params.isAmazing === 'true'));
      }
      if (params.search || params.q) {
        const term = (params.search || params.q).toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
      }
      rawList = filtered;
    }

    const normalized = rawList.map(normalizeProduct).filter(Boolean);
    return {
      data: normalized,
      products: normalized,
      pagination,
      length: normalized.length,
      [Symbol.iterator]: function* () {
        for (const item of normalized) yield item;
      }
    };
  },

  getProducts(params = {}) {
    return this.getAll(params);
  },

  /**
   * Get single product by ID using axios.get
   */
  async getById(id) {
    try {
      const res = await axiosInstance.get(`/products/${id}`);
      const raw = res?.data || res?.product || res;
      const normalized = normalizeProduct(raw);
      if (normalized) return normalized;
    } catch {
      // Fallback
    }
    const found = DEFAULT_PRODUCTS.find(p => String(p.id) === String(id) || String(p._id) === String(id));
    return found ? normalizeProduct(found) : DEFAULT_PRODUCTS[0];
  },

  getProductById(id) {
    return this.getById(id);
  },

  /**
   * Get featured or amazing products using axios.get
   */
  async getFeatured() {
    try {
      const res = await axiosInstance.get('/products?featured=true');
      const list = Array.isArray(res) ? res : (res?.data || []);
      if (list.length > 0) {
        return list.map(normalizeProduct).filter(Boolean);
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PRODUCTS.filter(p => p.isAmazing).map(normalizeProduct);
  },

  /**
   * Create a new product (Admin) using Multipart Form-Data
   */
  async create(productData) {
    const formData = new FormData();
    formData.append('name', (productData.name || '').trim());
    formData.append('description', (productData.description || 'برنج اصیل معطر درجه یک شالیزار کامفیروز').trim());
    formData.append('price', String(productData.price || 0));
    
    // Support backend fields
    if (productData.originalPrice !== undefined) formData.append('originalPrice', String(productData.originalPrice));
    if (productData.discountPercent !== undefined) formData.append('discountPercent', String(productData.discountPercent));
    if (productData.isAmazing !== undefined) formData.append('isAmazing', productData.isAmazing ? 'true' : 'false');
    if (productData.amazingDurationDays !== undefined) formData.append('amazingDurationDays', String(productData.amazingDurationDays));
    if (productData.amazingDurationHours !== undefined) formData.append('amazingDurationHours', String(productData.amazingDurationHours));
    if (productData.amazingExpiresAt !== undefined && productData.amazingExpiresAt !== null) {
      formData.append('amazingExpiresAt', String(productData.amazingExpiresAt));
    }
    
    const countVal = String(productData.countInStock !== undefined ? productData.countInStock : (productData.stock !== undefined ? productData.stock : 20));
    formData.append('countInStock', countVal);
    formData.append('stock', countVal);

    formData.append('category', (productData.category || 'kamfirouz').trim());
    formData.append('isAvailable', productData.isAvailable !== false ? 'true' : 'false');
    
    if (productData.weight) {
      formData.append('weight', String(productData.weight));
    }

    const imageBlob = await imageToBlob(productData.image);
    if (imageBlob) {
      formData.append('image', imageBlob, 'product_image.jpg');
    }

    const token = getStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await axiosInstance.post('/products', formData, { headers });
    const raw = res?.data || res?.product || res;
    return normalizeProduct(raw);
  },

  createProduct(productData) {
    return this.create(productData);
  },

  /**
   * Update product (Admin) using Multipart Form-Data
   */
  async update(id, productData) {
    const formData = new FormData();
    if (productData.name !== undefined) formData.append('name', (productData.name || '').trim());
    if (productData.description !== undefined) formData.append('description', (productData.description || '').trim());
    if (productData.price !== undefined) formData.append('price', String(productData.price || 0));
    if (productData.originalPrice !== undefined) formData.append('originalPrice', String(productData.originalPrice));
    if (productData.discountPercent !== undefined) formData.append('discountPercent', String(productData.discountPercent));
    if (productData.isAmazing !== undefined) formData.append('isAmazing', productData.isAmazing ? 'true' : 'false');
    if (productData.amazingDurationDays !== undefined) formData.append('amazingDurationDays', String(productData.amazingDurationDays));
    if (productData.amazingDurationHours !== undefined) formData.append('amazingDurationHours', String(productData.amazingDurationHours));
    if (productData.amazingExpiresAt !== undefined) {
      formData.append('amazingExpiresAt', productData.amazingExpiresAt ? String(productData.amazingExpiresAt) : '');
    }
    
    if (productData.countInStock !== undefined || productData.stock !== undefined) {
      const countVal = String(productData.countInStock !== undefined ? productData.countInStock : productData.stock);
      formData.append('countInStock', countVal);
      formData.append('stock', countVal);
    }
    if (productData.category !== undefined) formData.append('category', (productData.category || '').trim());
    if (productData.isAvailable !== undefined) formData.append('isAvailable', productData.isAvailable ? 'true' : 'false');
    if (productData.weight !== undefined) formData.append('weight', String(productData.weight));

    if (productData.image) {
      const imageBlob = await imageToBlob(productData.image);
      if (imageBlob) {
        formData.append('image', imageBlob, 'product_image.jpg');
      }
    }

    const token = getStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await axiosInstance.put(`/products/${id}`, formData, { headers });
    const raw = res?.data || res?.product || res;
    return normalizeProduct(raw);
  },

  updateProduct(id, productData) {
    return this.update(id, productData);
  },

  /**
   * Delete product (Admin) using DELETE /products/:id
   */
  async delete(id) {
    const token = getStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return await axiosInstance.delete(`/products/${id}`, { headers });
  },

  deleteProduct(id) {
    return this.delete(id);
  },

  /**
   * Add a review to a product
   */
  async addReview(productId, reviewData) {
    const token = getStoredToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return await axiosInstance.post('/reviews', {
      productId,
      rating: Number(reviewData.rating || 5),
      comment: (reviewData.comment || '').trim()
    }, { headers });
  }
};

export default productsApi;
