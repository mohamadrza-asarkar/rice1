import React, { useState } from 'react';
import styles from '../admin.module.css';

export function AdminReviews({
  reviews = [],
  onDeleteReview
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const queryText = searchQuery.toLowerCase().trim();

  const filteredReviews = reviews.filter((review) => {
    if (!queryText) return true;
    const author = review.author || review.userName || '';
    const comment = review.comment || review.text || '';
    return (
      author.toLowerCase().includes(queryText) ||
      comment.toLowerCase().includes(queryText)
    );
  });

  return (
    <section className={styles.card}>
      <div className={styles.toolbar}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>نظرات و بازخوردهای خریداران</h2>
          <p className={styles.subtitle}>بررسی رضایت‌مندی و نظرات ثبت شده کاربران برای محصولات</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="جستجو در متن نظر یا نام نویسنده..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      <div className={styles.itemsList}>
        {filteredReviews.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fa-solid fa-comment-dots" style={{ fontSize: '2rem' }} />
            <p>هیچ نظری یافت نشد.</p>
          </div>
        ) : (
          filteredReviews.map((review) => {
            const reviewId = review.id || review._id;
            return (
              <div key={reviewId} className={styles.itemRow}>
                <div className={styles.itemDetails}>
                  <div className={styles.rowCenter}>
                    <h3 className={styles.itemName}>{review.author || review.userName || 'خریدار ناشناس'}</h3>
                    <span className={`${styles.badge} ${styles.badgeWarning}`}>
                      <i className="fa-solid fa-star" />
                      <span>{review.rating || 5} از ۵</span>
                    </span>
                  </div>
                  <p className={styles.commentBody}>
                    {review.comment || review.text}
                  </p>
                  <p className={styles.itemMeta}>
                    <span>تاریخ: {review.date || 'اخیر'}</span>
                    {review.productName && <span>| محصول: {review.productName}</span>}
                  </p>
                </div>

                <div className={styles.itemActions}>
                  <button
                    type="button"
                    className={styles.dangerBtn}
                    onClick={() => onDeleteReview && onDeleteReview(reviewId)}
                  >
                    <i className="fa-solid fa-trash-can" />
                    <span>حذف نظر</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default AdminReviews;
