import React from 'react';
import { useApp } from '../../context';
import styles from './style.module.css';

export function BrandStory() {
  const { brandStory } = useApp();

  return (
    <section className={styles.storyCard}>
      <header className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <i className="fa-solid fa-award" />
          <h3 className={styles.title}>
            {brandStory?.title ?? 'اصالت و پیشینه برنج کامفیروز'}
          </h3>
        </div>
        <span className={styles.originTag}>شالیزارهای فارس</span>
      </header>

      <p className={styles.description}>
        {brandStory?.description ??
          'عرضه مستقیم اصیل‌ترین برنج معطر کامفیروز مرودشت از شالیزارهای حوزه سد درودزن استان فارس در گونی‌های نخی سفید و بهداشتی، بدون اختلاط و با خلوص ۱۰۰ درصدی.'}
      </p>

      <div className={styles.features}>
        <div className={styles.featureItem}>
          <strong>۱۰۰٪ خالص</strong>
          <span>بدون ناخالصی و مخلوط</span>
        </div>
        <div className={`${styles.featureItem} ${styles.border}`}>
          <strong>کیسه نخی</strong>
          <span>تنفس‌پذیر و بهداشتی</span>
        </div>
        <div className={styles.featureItem}>
          <strong>۷ روز</strong>
          <span>ضمانت عودت بی‌قیدوشرط</span>
        </div>
      </div>
    </section>
  );
}



