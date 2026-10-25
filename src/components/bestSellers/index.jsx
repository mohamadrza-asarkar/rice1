import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context';
import { ProductCard } from '../productCard';
import styles from './style.module.css';

export function BestSellers() {
  const { products } = useApp();

  return !products?.length ? null : (
    <section className={styles.section}>
      <header className={styles.headerRow}>
        <h3 className={styles.title}>
          <i className="fa-solid fa-wheat-awn" />
          <span>محبوب‌ترین ارقام برنج اصیل ایرانی</span>
        </h3>
      </header>

      <div className={styles.scrollContainer}>
        {(products || []).slice(0, 6).map(function (product) {
          return (
            <div key={product.id || product._id} className={styles.scrollItem}>
              <ProductCard product={product} />
            </div>
          );
        })}

        <div className={styles.scrollItemMore}>
          <Link to="/products" className={styles.moreProductsCard} aria-label="مشاهده تمام محصولات">
            <div className={styles.moreIconCircle}>
              <i className="fa-solid fa-arrow-left" />
            </div>
            <span className={styles.moreTitle}>مشاهده همه</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
