import React from 'react';
import { useApp } from '../../context';
import styles from './style.module.css';

export function CustomerReviews() {
  const { reviews } = useApp();

  return !reviews?.length ? null : (
    <section className={styles.reviewsContainer}>
      <header className={styles.header}>
        <h3 className={styles.title}>
          <i className="fa-solid fa-star" />
          <span>نظرات خریداران واقعی</span>
        </h3>
        <span className={styles.ratingBadge}>۴.۹ از ۵</span>
      </header>

      <div className={styles.reviewsList}>
        {reviews.map(function (rev, index) {
          return (
            <article key={rev.id ?? index} className={styles.reviewItem}>
              <header className={styles.reviewHeader}>
                <strong className={styles.userName}>{rev.userName || rev.author || rev.user || 'مشتری طلا رایس'}</strong>
                <div className={styles.stars}>
                  {Array.from({ length: rev.rating ?? 5 }).map(function (_, i) {
                    return <i key={i} className="fa-solid fa-star" />;
                  })}
                </div>
              </header>

              <span className={styles.productTag}>
                {rev.productName || rev.product || 'خریدار برنج کامفیروزی ممتاز'}
              </span>
              <p className={styles.commentText}>{rev.comment}</p>

              {index < reviews.length - 1 && <hr className={styles.divider} />}
            </article>
          );
        })}
      </div>
    </section>
  );
}

