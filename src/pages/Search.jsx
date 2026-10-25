import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { ProductCard } from '../components/productCard';
import styles from '../assets/styles/pages.module.css';

export default function Search() {
  const navigate = useNavigate();
  const { products } = useApp();
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return (products || []).filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.weight && p.weight.toLowerCase().includes(q))
    );
  }, [products, query]);

  const handleClear = () => {
    setQuery('');
  };

  return (
    <main className={styles.pageContainer}>
      {/* هدر صفحه جستجو */}
      <header className={styles.pageHeader}>
        <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-right" />
          <span>بازگشت</span>
        </button>
        <h1 className={styles.pageTitle}>جستجوی ارقام برنج</h1>
      </header>

      {/* نوار جستجوی پیشرفته */}
      <div className={styles.searchBarWrapper}>
        <form onSubmit={(e) => e.preventDefault()} className={styles.searchBar}>
          <i className={`fa-solid fa-magnifying-glass ${styles.searchIconGold}`} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="نام رقم برنج، وزن یا شهر برداشت..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button type="button" className={styles.clearSearchBtn} onClick={handleClear} aria-label="پاک کردن">
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </form>
      </div>

      {/* نمایش نتایج جستجو */}
      {query.trim() && (
        <section className={styles.searchResultsSection}>
          <div className={styles.resultsHeader}>
            <span className={styles.resultsTitle}>
              نتایج جستجو برای <strong className="text-yellow-600">«{query}»</strong>
            </span>
            <span className={styles.badge}>
              {searchResults.length.toLocaleString('fa-IR')} کالا
            </span>
          </div>

          {searchResults.length === 0 ? (
            <div className={styles.emptySearchCard}>
              <p className={styles.emptySearchText}>
                موردی منطبق با عبارت «{query}» در انبار پیدا نشد.
              </p>
              <p className={styles.emptySearchSub}>
                می‌توانید کلمات ساده‌تر مانند «کامفیروز» یا «هاشمی» را جستجو نمایید.
              </p>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => navigate('/products')}
              >
                مشاهده همه محصولات فروشگاه
              </button>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export { Search };
