import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './header';
import { BottomNav } from './bottomNav';
import { CheckoutModal } from './checkoutModal';
import styles from './layout.module.css';

export function Layout() {
  return (
    <div className={styles.appWrapper}>
      <Header />
      <Outlet />
      <BottomNav />
      <CheckoutModal />
    </div>
  );
}

export function SimpleLayout() {
  return (
    <div className={styles.appWrapper}>
      <Outlet />
      <CheckoutModal />
    </div>
  );
}

export default Layout;
