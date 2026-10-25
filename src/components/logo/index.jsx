import React from 'react';
import styles from './style.module.css';
import logoImg from '../../assets/logo.png';

export function Logo({ size, showText = true, variant = 'light' }) {
  return (
    <div className={`${styles.logoContainer} ${variant === 'dark' ? styles.darkVariant : styles.lightVariant}`}>
      <img
        src={logoImg}
        alt="لوگوی سامانه فروش برنج اعلا"
        className={styles.logoImage}
        style={size ? { width: size.width, height: size.height } : null}
      />
      {showText && (
        <div className={styles.logoTextGroup}>
          <span className={styles.brandTitle}>برنج اعلا</span>
          <span className={styles.brandTagline}>سامانه تخصصی فروش برنج</span>
        </div>
      )}
    </div>
  );
}

export default Logo;

