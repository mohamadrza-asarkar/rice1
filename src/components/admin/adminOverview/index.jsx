import React from 'react';
import styles from '../admin.module.css';

export function AdminOverview({ stats, adminOrders, products, sliders, adminUsers, isLoadingOrders, onRefreshOrders, onTabChange }) {
  const totalRevenue = stats?.totalRevenue ?? adminOrders.reduce(
    (sum, order) => sum + (Number(order.finalAmount || order.totalPrice) || 0),
    0
  );
  const totalOrdersCount = stats?.totalOrders ?? adminOrders.length;
  const totalProductsCount = stats?.totalProducts ?? products.length;
  const totalUsersCount = stats?.totalUsers ?? adminUsers.length;

  return (
    <>
      <section className={styles.statsGrid}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>مجموع فروش کل</span>
          <span className={styles.statValue}>{Number(totalRevenue || 0).toLocaleString('fa-IR')} تومان</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>کل سفارش‌ها در سرور</span>
          <span className={styles.statValue}>
            {Number(totalOrdersCount || 0).toLocaleString('fa-IR')} سفارش
          </span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>محصولات فعال</span>
          <span className={styles.statValue}>
            {Number(totalProductsCount || 0).toLocaleString('fa-IR')} رقم
          </span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>اسلایدرهای فعال</span>
          <span className={styles.statValue}>
            {Number(sliders?.length || 0).toLocaleString('fa-IR')} بنر
          </span>
        </div>
      </section>
    </>
  );
}
