import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context';
import { Logo } from '../logo';
import { SearchBar } from '../searchBar';
import styles from './style.module.css';

export function Header() {
  const { isAuthenticated, currentUser, isAdmin } = useApp();

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <Link to="/" className={styles.logoLink} aria-label="صفحه اصلی طلا رایس">
          <Logo showText={true} variant="dark" />
        </Link>

        <nav className={styles.userActionWrapper} aria-label="منوی کاربری">
          {isAdmin && (
            <Link to="/admin" className={styles.adminBadgeLink} title="ورود به پنل مدیریت فروشگاه">
              <i className={`fa-solid fa-crown ${styles.crownIcon}`} />
              <span>پنل مدیریت</span>
            </Link>
          )}

          <Link
            to={isAuthenticated ? '/profile' : '/login'}
            className={styles.userBtn}
            title={isAuthenticated ? `پنل کاربری ${currentUser?.name || ''}` : 'ورود به حساب کاربری'}
          >
            {isAuthenticated ? <i className="fa-solid fa-user" /> : <i className="fa-solid fa-right-to-bracket" />}
            <span>
              {isAuthenticated
                ? (currentUser?.name ? `پنل کاربری (${currentUser.name.split(' ')[0]})` : 'پنل کاربری')
                : 'ورود به حساب'}
            </span>
          </Link>
        </nav>
      </div>
      <SearchBar />
    </header>
  );
}

export default Header;
