import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context';
import styles from './style.module.css';

export function BottomNav() {
  const { cartCount, isAuthenticated, isAdmin, showToast } = useApp();
  const navigate = useNavigate();

  function getLinkClass({ isActive }) {
    return `${styles.navButton} ${isActive ? styles.navButtonSelected : styles.navButtonUnselected}`;
  }

  function getAdminLinkClass({ isActive }) {
    return `${styles.navButton} ${styles.adminNavButton} ${isActive ? styles.navButtonSelected : styles.navButtonUnselected}`;
  }

  const handleCartClick = (event) => {
    if (!isAuthenticated) {
      event.preventDefault();
      showToast('جهت مشاهده سبد خرید و ثبت سفارش، لطفاً ابتدا وارد حساب کاربری خود شوید.', 'info');
      navigate('/login', { state: { from: { pathname: '/cart' } } });
    }
  };

  return (
    <nav className={styles.bottomNav} aria-label="ناوبری اصلی">
      <NavLink to="/" end className={getLinkClass}>
        <i className="fa-solid fa-house" style={{ fontSize: '1.1rem' }} />
        <span>خانه</span>
      </NavLink>

      <NavLink to="/products" className={getLinkClass}>
        <i className="fa-solid fa-shapes" style={{ fontSize: '1.1rem' }} />
        <span>محصولات</span>
      </NavLink>

      <NavLink to="/cart" onClick={handleCartClick} className={getLinkClass}>
        <i className="fa-solid fa-bag-shopping" style={{ fontSize: '1.1rem' }} />
        {isAuthenticated && cartCount > 0 && <span className={styles.badge}>{cartCount.toLocaleString('fa-IR')}</span>}
        <span>سبد خرید</span>
      </NavLink>

      {isAdmin && (
        <NavLink to="/admin" className={getAdminLinkClass}>
          <i className="fa-solid fa-crown" style={{ fontSize: '1.1rem', color: '#d97706' }} />
          <span>مدیریت</span>
        </NavLink>
      )}

      <NavLink to={isAuthenticated ? '/profile' : '/login'} className={getLinkClass}>
        <i className="fa-solid fa-user" style={{ fontSize: '1.1rem' }} />
        <span>{isAuthenticated ? 'پنل کاربری' : 'ورود'}</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;
