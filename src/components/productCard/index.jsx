import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context';
import { truncateAtWord } from '../../utils/textUtils';
import { getImageUrl, handleImageError } from '../../api/client';
import styles from './style.module.css';

export function ProductCard({ product }) {
  const { addToCart } = useApp();
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const currentPrice = Number(product.price || 0);
  const rawOriginal = Number(product.originalPrice || product.oldPrice || product.old_price || 0);
  const discountPercent = Number(product.discountPercent || product.discount || 0);

  let originalPrice = rawOriginal;
  if (!originalPrice || originalPrice <= currentPrice) {
    if (discountPercent > 0 && currentPrice > 0) {
      originalPrice = Math.round(currentPrice / (1 - discountPercent / 100));
    } else {
      originalPrice = currentPrice;
    }
  }

  const computedDiscount = discountPercent > 0
    ? discountPercent
    : (originalPrice > currentPrice ? Math.round((1 - currentPrice / originalPrice) * 100) : 0);

  const hasDiscount = computedDiscount > 0 && originalPrice > currentPrice;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1400);
  };

  return (
    <article className={styles.card}>
      <Link to={`/product/${product.id || product._id}`} className={styles.contentWrapper}>
        <div className={styles.imageContainer}>
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className={styles.image}
            loading="lazy"
            onError={handleImageError}
          />
          {hasDiscount && (
            <span className={styles.discountBadge}>
              {computedDiscount.toLocaleString('fa-IR')}٪ تخفیف
            </span>
          )}
        </div>

        <div className={styles.infoArea}>
          <div className={styles.topMeta}>
            <span className={styles.categoryBadge}>{product.categoryName || 'کامفیروز اصیل'}</span>
            <div className={styles.rating}>
              <i className="fa-solid fa-star" />
              <span>{(product.rating || 5).toLocaleString('fa-IR')}</span>
            </div>
          </div>

          <h4 className={styles.title}>{product.name}</h4>
          {product.description && (
            <p className={styles.description}>
              {truncateAtWord(product.description, 50)}
            </p>
          )}
        </div>
      </Link>

      <div className={styles.bottomSection}>
        <div className={styles.priceContainer}>
          {hasDiscount && (
            <del className={styles.oldPrice}>
              {originalPrice.toLocaleString('fa-IR')} <small>تومان</small>
            </del>
          )}
          <strong className={styles.currentPrice}>
            {currentPrice.toLocaleString('fa-IR')} <small>تومان</small>
          </strong>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className={`${styles.addButton} ${justAdded ? styles.addedButton : ''}`}
          aria-label="افزودن به سبد خرید"
        >
          {justAdded ? (
            <>
              <i className="fa-solid fa-check" />
              <span>ثبت شد</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-cart-plus" />
              <span>افزودن به سبد</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
