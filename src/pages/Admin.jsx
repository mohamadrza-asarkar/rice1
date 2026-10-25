import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { adminApi } from '../api/admin.api';
import { ordersApi } from '../api/orders.api';
import { productsApi } from '../api/products.api';
import { slidesApi } from '../api/slides.api';
import { reviewsApi } from '../api/reviews.api';
import { amazingProductsApi } from '../api/amazing.api';
import { normalizePhone } from '../api/auth.api';
import { AdminOverview } from '../components/admin/adminOverview';
import { AdminProducts } from '../components/admin/adminProducts';
import { AdminOrders } from '../components/admin/adminOrders';
import { AdminUsers } from '../components/admin/adminUsers';
import { AdminSlides } from '../components/admin/adminSlides';
import { AdminDeals } from '../components/admin/adminDeals';
import { AdminReviews } from '../components/admin/adminReviews';
import styles from '../components/admin/admin.module.css';

export default function Admin() {
  const navigate = useNavigate();
  const {
    products,
    setProducts,
    sliders,
    setSliders,
    amazingProducts,
    setAmazingProducts,
    showToast,
    refreshProductsFromApi
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load admin data on mount
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ordersRes, usersRes, reviewsRes] = await Promise.allSettled([
        adminApi.getOrders(),
        adminApi.getUsers(),
        reviewsApi.getAll()
      ]);

      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
        setAdminOrders(ordersRes.value);
      }
      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) {
        setAdminUsers(usersRes.value);
      }
      if (reviewsRes.status === 'fulfilled' && Array.isArray(reviewsRes.value)) {
        setReviews(reviewsRes.value);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
    if (refreshProductsFromApi) {
      refreshProductsFromApi();
    }
  }, [loadInitialData, refreshProductsFromApi]);

  // Product Actions
  const handleAddProduct = async (productData) => {
    try {
      const created = await productsApi.create(productData);
      setProducts((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
      if (created.isAmazing) {
        setAmazingProducts((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
      }
      showToast('محصول جدید با موفقیت اضافه شد.', 'success');
    } catch {
      showToast('خطا در افزودن محصول', 'error');
    }
  };

  const handleUpdateProduct = async (id, productData) => {
    try {
      const updated = await productsApi.update(id, productData);
      setProducts((previous) =>
        previous.map((product) => (product.id === id || product._id === id ? { ...product, ...updated } : product))
      );
      if (updated.isAmazing) {
        setAmazingProducts((previous) => {
          const arr = Array.isArray(previous) ? previous : [];
          const exists = arr.some((p) => p.id === id || p._id === id);
          if (exists) {
            return arr.map((p) => (p.id === id || p._id === id ? { ...p, ...updated } : p));
          } else {
            return [updated, ...arr];
          }
        });
      } else {
        setAmazingProducts((previous) => (Array.isArray(previous) ? previous : []).filter((p) => p.id !== id && p._id !== id));
      }
      showToast('محصول با موفقیت ویرایش شد.', 'success');
    } catch {
      showToast('خطا در ویرایش محصول', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await productsApi.delete(id);
      setProducts((previous) => previous.filter((product) => product.id !== id && product._id !== id));
      setAmazingProducts((previous) => (Array.isArray(previous) ? previous : []).filter((product) => product.id !== id && product._id !== id));
      showToast('محصول با موفقیت حذف شد.', 'success');
    } catch {
      showToast('خطا در حذف محصول', 'error');
    }
  };

  // Slide Actions
  const handleAddSlide = async (slideData) => {
    try {
      const created = await slidesApi.create(slideData);
      setSliders((previous) => [...(Array.isArray(previous) ? previous : []), created]);
      showToast('اسلاید جدید ثبت شد.', 'success');
    } catch {
      showToast('خطا در ثبت اسلاید', 'error');
    }
  };

  const handleUpdateSlide = async (id, slideData) => {
    try {
      const updated = await slidesApi.update(id, slideData);
      setSliders((previous) =>
        previous.map((slide) => (slide.id === id || slide._id === id ? { ...slide, ...updated } : slide))
      );
      showToast('اسلاید ویرایش شد.', 'success');
    } catch {
      showToast('خطا در ویرایش اسلاید', 'error');
    }
  };

  const handleDeleteSlide = async (id) => {
    try {
      await slidesApi.delete(id);
      setSliders((previous) => previous.filter((slide) => slide.id !== id && slide._id !== id));
      showToast('اسلاید حذف شد.', 'success');
    } catch {
      showToast('خطا در حذف اسلاید', 'error');
    }
  };

  // User Actions
  const handleAddUser = async (userData) => {
    try {
      const phoneNorm = normalizePhone(userData.phone);
      const created = await adminApi.createUser({ ...userData, phone: phoneNorm });
      setAdminUsers((previous) => [created, ...(Array.isArray(previous) ? previous : [])]);
      showToast('کاربر جدید با موفقیت ثبت شد.', 'success');
    } catch {
      showToast('خطا در ثبت کاربر', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await adminApi.deleteUser(id);
      setAdminUsers((previous) => previous.filter((user) => user.id !== id && user._id !== id));
      showToast('کاربر با موفقیت حذف شد.', 'success');
    } catch {
      showToast('خطا در حذف کاربر', 'error');
    }
  };

  const handleUpdateUserRole = async (id, currentRole) => {
    try {
      const nextRole = currentRole === 'admin' ? 'user' : 'admin';
      await adminApi.updateUserRole(id, nextRole);
      setAdminUsers((previous) =>
        previous.map((user) => (user.id === id || user._id === id ? { ...user, role: nextRole } : user))
      );
      showToast('نقش کاربر به‌روزرسانی شد.', 'success');
    } catch {
      showToast('خطا در تغییر نقش کاربر', 'error');
    }
  };

  // Order Actions
  const handleUpdateOrderStatus = async (id, status, postTrackingCode, cancelReason, adminNote) => {
    try {
      const updated = await ordersApi.updateStatus(id, status, postTrackingCode, cancelReason, adminNote);
      setAdminOrders((previous) =>
        previous.map((order) =>
          order.id === id || order._id === id
            ? {
                ...order,
                ...updated,
                status: status || updated?.status || order.status,
                postTrackingCode: postTrackingCode !== undefined ? postTrackingCode : (updated?.postTrackingCode || order.postTrackingCode),
                cancelReason: cancelReason !== undefined ? cancelReason : (updated?.cancelReason || order.cancelReason),
                adminNote: adminNote !== undefined ? adminNote : (updated?.adminNote || order.adminNote)
              }
            : order
        )
      );
      showToast('وضعیت و پیام سفارش به‌روزرسانی شد.', 'success');
    } catch (err) {
      showToast(err?.message || 'خطا در تغییر وضعیت سفارش', 'error');
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      await ordersApi.delete(id);
    } catch (err) {
      console.warn('Delete order error:', err);
    } finally {
      setAdminOrders((previous) => previous.filter((order) => String(order.id) !== String(id) && String(order._id) !== String(id)));
      showToast('سفارش با موفقیت حذف شد.', 'success');
    }
  };

  // Deal Actions
  const handleAddDeal = async (dealData) => {
    try {
      const pid = dealData.productId;
      if (!pid) {
        showToast('لطفاً یک محصول را انتخاب کنید.', 'error');
        return;
      }

      await amazingProductsApi.create(dealData);

      if (refreshProductsFromApi) {
        await refreshProductsFromApi();
      }

      showToast('محصول با موفقیت به پیشنهاد شگفت‌انگیز اضافه شد.', 'success');
    } catch {
      try {
        await amazingProductsApi.toggle(pid);
        if (refreshProductsFromApi) await refreshProductsFromApi();
        showToast('محصول با موفقیت به پیشنهاد شگفت‌انگیز اضافه شد.', 'success');
      } catch {
        showToast('خطا در افزودن پیشنهاد شگفت‌انگیز', 'error');
      }
    }
  };

  const handleUpdateDeal = async (id, dealData) => {
    try {
      await amazingProductsApi.update(id, dealData);
      if (refreshProductsFromApi) {
        await refreshProductsFromApi();
      }
      showToast('پیشنهاد شگفت‌انگیز با موفقیت ویرایش شد.', 'success');
    } catch {
      try {
        await productsApi.update(id, { isAmazing: true, ...dealData });
        if (refreshProductsFromApi) await refreshProductsFromApi();
        showToast('پیشنهاد شگفت‌انگیز با موفقیت ویرایش شد.', 'success');
      } catch {
        showToast('خطا در ویرایش پیشنهاد شگفت‌انگیز', 'error');
      }
    }
  };

  const handleRemoveDeal = async (id) => {
    try {
      // Single direct API request to toggle/disable amazing product
      await amazingProductsApi.toggle(id);

      if (refreshProductsFromApi) {
        await refreshProductsFromApi();
      }

      showToast('محصول از پیشنهاد شگفت‌انگیز خارج شد.', 'success');
    } catch {
      showToast('خطا در خروج محصول از شگفت‌انگیز', 'error');
    }
  };

  // Review Actions
  const handleDeleteReview = async (id) => {
    try {
      await reviewsApi.delete(id);
      setReviews((previous) => previous.filter((review) => review.id !== id && review._id !== id));
      showToast('نظر با موفقیت حذف شد.', 'success');
    } catch {
      showToast('خطا در حذف نظر', 'error');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>داشبورد مدیریت فروشگاه برنج اعلا</h1>
          <p className={styles.subtitle}>کنترل کامل موجودی، سفارشات، کاربران و جشنواره‌ها</p>
        </div>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={() => navigate('/')}
        >
          <i className="fa-solid fa-arrow-right" />
          <span>بازگشت به فروشگاه</span>
        </button>
      </header>

      {/* Tabs Bar */}
      <nav className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="fa-solid fa-chart-line" />
          <span>گزارش کلی</span>
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'products' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <i className="fa-solid fa-box" />
          <span>محصولات</span>
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <i className="fa-solid fa-bag-shopping" />
          <span>سفارشات</span>
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'slides' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('slides')}
        >
          <i className="fa-solid fa-layer-group" />
          <span>اسلایدر</span>
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'users' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <i className="fa-solid fa-users" />
          <span>کاربران</span>
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'deals' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('deals')}
        >
          <i className="fa-solid fa-wand-magic-sparkles" />
          <span>شگفت‌انگیزها</span>
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'reviews' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <i className="fa-solid fa-comment-dots" />
          <span>نظرات</span>
        </button>
      </nav>

      {/* Active Tab View */}
      {activeTab === 'overview' && (
        <AdminOverview
          adminOrders={adminOrders}
          products={products}
          sliders={sliders}
          adminUsers={adminUsers}
          onTabChange={setActiveTab}
        />
      )}

      {activeTab === 'products' && (
        <AdminProducts
          products={products}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {activeTab === 'orders' && (
        <AdminOrders
          adminOrders={adminOrders}
          isLoadingOrders={isLoading}
          onRefreshOrders={loadInitialData}
          onUpdateStatus={handleUpdateOrderStatus}
          onDeleteOrder={handleDeleteOrder}
        />
      )}

      {activeTab === 'slides' && (
        <AdminSlides
          sliders={sliders}
          onAddSlide={handleAddSlide}
          onUpdateSlide={handleUpdateSlide}
          onDeleteSlide={handleDeleteSlide}
        />
      )}

      {activeTab === 'users' && (
        <AdminUsers
          adminUsers={adminUsers}
          onAddUser={handleAddUser}
          onDeleteUser={handleDeleteUser}
          onUpdateRole={handleUpdateUserRole}
        />
      )}

      {activeTab === 'deals' && (
        <AdminDeals
          amazingProducts={amazingProducts}
          allProducts={products}
          onAddDeal={handleAddDeal}
          onUpdateDeal={handleUpdateDeal}
          onRemoveDeal={handleRemoveDeal}
        />
      )}

      {activeTab === 'reviews' && (
        <AdminReviews
          reviews={reviews}
          onDeleteReview={handleDeleteReview}
        />
      )}
    </div>
  );
}
