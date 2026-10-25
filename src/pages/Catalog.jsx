import React, { useState, useMemo } from 'react';
import { useApp } from '../context';
import { ProductCard } from '../components/productCard';
import styles from '../assets/styles/pages.module.css';

export default function Catalog() {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    apiError,
    isLoadingApi,
    refreshProductsFromApi
  } = useApp();
  const [sortBy, setSortBy] = useState('popular'); // popular, price-asc, price-desc, rating
  const [activeWeightFilter, setActiveWeightFilter] = useState('all'); // all, 10, 5

  const filteredAndSortedProducts = useMemo(() => {
    let list = [...(products || [])];

    // Filter by Category
    if (selectedCategory && selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory || p.categoryId === selectedCategory);
    }

    // Filter by Weight
    if (activeWeightFilter !== 'all') {
      list = list.filter((p) => p.weight?.includes(activeWeightFilter) || p.name.includes(`${activeWeightFilter} کیلو`));
    }

    // Sort
    if (sortBy === 'price-asc') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    }

    return list;
  }, [products, selectedCategory, activeWeightFilter, sortBy]);

  return (
    <main className={styles.pageContainer}>
      {/* هدر کاتالوگ */}
      <header className={styles.catalogHeader}>
        <div className={styles.catalogHeaderInfo}>
          <div className={styles.catalogBadge}>
            <i className="fa-solid fa-wand-magic-sparkles text-yellow-400 text-xs" />
            <span>محصولات اصیل شالیزار کامفیروز</span>
          </div>
          <h1 className={styles.catalogMainTitle}>ویترین محصولات برنج اعلا</h1>
          <p className={styles.catalogMainSubtitle}>
            ارقام برنج درجه یک، کاملاً بوجار و پاک شده در کیسه‌های نخی سنتی با ضمانت پخت
          </p>
        </div>
      </header>

      {/* بنر تضمین کیفیت */}
      <section className={styles.guaranteeBanner}>
        <i className={`fa-solid fa-shield-halved ${styles.guaranteeIcon}`} style={{ fontSize: '1.5rem' }} />
        <div>
          <strong className={styles.guaranteeTitle}>ضمانت بی‌قید و شرط پخت و عطر</strong>
          <p className={styles.guaranteeText}>
            در صورت عدم رضایت از عطر یا ری‌دهی، مرجوعی بدون کسر هزینه تا ۷ روز پذیرفته می‌شود.
          </p>
        </div>
      </section>

      {apiError && (
        <div style={{
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          color: '#be123c',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          margin: '1rem 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-circle-exclamation" style={{ flexShrink: 0, fontSize: '1.1rem' }} />
            <span>{apiError}</span>
          </div>
          <button
            type="button"
            onClick={refreshProductsFromApi}
            disabled={isLoadingApi}
            style={{
              background: '#be123c',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.4rem 0.85rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className={`fa-solid fa-arrows-rotate ${isLoadingApi ? 'fa-spin' : ''}`} />
            <span>{isLoadingApi ? 'در حال تلاش...' : 'تلاش مجدد'}</span>
          </button>
        </div>
      )}

      {/* دسته‌بندی‌های کاتالوگ */}
      <div className={styles.filterSection}>
        <div className={styles.categoryPillsScroll}>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`${styles.filterPill} ${(!selectedCategory || selectedCategory === 'all') ? styles.filterPillActive : ''}`}
          >
            همه ارقام
          </button>
          {categories
            ?.filter((c) => c.id !== 'all')
            .map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`${styles.filterPill} ${selectedCategory === cat.id ? styles.filterPillActive : ''}`}
              >
                {cat.name}
              </button>
            ))}
        </div>

        {/* فیلتر سریع وزن و مرتب‌سازی */}
        <div className={styles.sortBar}>
          <div className={styles.sortOptions}>
            <i className="fa-solid fa-sliders text-yellow-500" />
            <span className={styles.sortLabel}>مرتب‌سازی:</span>
            <button
              type="button"
              className={`${styles.sortBtn} ${sortBy === 'popular' ? styles.sortBtnActive : ''}`}
              onClick={() => setSortBy('popular')}
            >
              محبوب‌ترین
            </button>
            <button
              type="button"
              className={`${styles.sortBtn} ${sortBy === 'price-asc' ? styles.sortBtnActive : ''}`}
              onClick={() => setSortBy('price-asc')}
            >
              ارزان‌ترین
            </button>
            <button
              type="button"
              className={`${styles.sortBtn} ${sortBy === 'price-desc' ? styles.sortBtnActive : ''}`}
              onClick={() => setSortBy('price-desc')}
            >
              گران‌ترین
            </button>
          </div>

          <span className={styles.productCountBadge}>
            {filteredAndSortedProducts.length.toLocaleString('fa-IR')} محصول
          </span>
        </div>
      </div>

      {/* لیست محصولات */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className={styles.emptyCatalog}>
          <p>
            {products && products.length === 0
              ? 'در حال حاضر هیچ محصولی ثبت نشده است.'
              : 'محصولی با این مشخصات یافت نشد.'}
          </p>
          {products && products.length > 0 && (
            <button
              type="button"
              className={styles.resetFilterBtn}
              onClick={() => {
                setSelectedCategory('all');
                setActiveWeightFilter('all');
              }}
            >
              مشاهده همه محصولات
            </button>
          )}
        </div>
      ) : (
        <section className={styles.productGrid}>
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      )}
    </main>
  );
}

export { Catalog };
