import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context';
import { getImageUrl } from '../api/client';
import styles from '../assets/styles/cartPage.module.css';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isLoadingAuth,
    showToast,
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartSubtotal,
    shippingFee,
    finalTotal,
    setIsCheckoutOpen
  } = useApp();

  React.useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      showToast('برای مشاهده و استفاده از سبد خرید، لطفاً ابتدا وارد حساب کاربری شوید.', 'info');
      navigate('/login', { state: { from: { pathname: '/cart' } }, replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, navigate, showToast]);

  if (isLoadingAuth) {
    return (
      <main className={styles.cartPage}>
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem', color: '#d97706' }} />
          <p>در حال بررسی وضعیت حساب کاربری...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleOpenCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const totalItemsCount = (cart || []).reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);

  // 1. Loading/Empty State
  if (!cart || cart.length === 0) {
    return (
      <main className={styles.cartPage}>
        <header className={styles.titleRow}>
          <div className={styles.titleMain}>
            <i className={`fa-solid fa-basket-shopping ${styles.titleIcon}`} />
            <h1>سبد خرید شما</h1>
          </div>
        </header>

        <section className={styles.emptyState}>
          <i className={`fa-solid fa-cart-shopping ${styles.emptyIcon}`} />
          <p className={styles.emptyText}>سبد خرید شما در حال حاضر خالی است.</p>
          <Link to="/products" className={styles.btnReturn}>
            <i className="fa-solid fa-bag-shopping" />
            <span>مشاهده محصولات و خرید برنج</span>
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.cartPage}>
      {/* هدر صفحه */}
      <header className={styles.titleRow}>
        <div className={styles.titleMain}>
          <i className={`fa-solid fa-basket-shopping ${styles.titleIcon}`} />
          <h1>سبد خرید شما</h1>
        </div>
        <span className={styles.itemCountBadge}>
          {totalItemsCount.toLocaleString('fa-IR')} عدد گونی
        </span>
      </header>

      {/* دکمه پاکسازی سبد */}
      <div className={styles.clearCartRow}>
        <button type="button" onClick={clearCart} className={styles.btnClearAll}>
          <i className="fa-solid fa-trash-can" />
          <span>خالی کردن سبد</span>
        </button>
      </div>

      <div className={styles.cartLayout}>
        {/* لیست محصولات درون سبد */}
        <section className={styles.itemsContainer}>
          {cart.map((item) => {
            const unitPrice = Number(item.price ?? 0);
            const itemTotal = unitPrice * (item.quantity ?? 1);

            return (
              <article key={item.id} className={styles.itemCard}>
                <div className={styles.itemTopRow}>
                  <img src={getImageUrl(item.image)} alt={item.name} className={styles.itemImg} />
                  <div className={styles.itemDetails}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <span className={styles.itemMeta}>بسته‌بندی پارچه‌ای دوخت صنعتی ممتاز</span>
                    <span className={styles.itemMeta}>وزن: {item.weight || '۱۰ کیلوگرم'}</span>
                  </div>
                </div>

                <div className={styles.itemBottomRow}>
                  <strong className={styles.itemPrice}>
                    {itemTotal.toLocaleString('fa-IR')} <small>تومان</small>
                  </strong>

                  <div className={styles.actionsGroup}>
                    <div className={styles.qtyControl}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                        className={styles.qtyBtn}
                        aria-label="کاهش تعداد"
                      >
                        <i className="fa-solid fa-minus" />
                      </button>
                      <span className={styles.qtyValue}>
                        {(item.quantity ?? 1).toLocaleString('fa-IR')}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                        className={styles.qtyBtn}
                        aria-label="افزایش تعداد"
                      >
                        <i className="fa-solid fa-plus" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className={styles.deleteBtn}
                      aria-label="حذف از سبد"
                      title="حذف از سبد"
                    >
                      <i className="fa-solid fa-trash-can" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* خلاصه فاکتور پرداخت */}
        <aside className={styles.sidebar}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>
              <i className="fa-solid fa-receipt" style={{ color: '#C59B27' }} />
              <span>خلاصه فاکتور سفارش</span>
            </h2>

            {/* جزییات مبالغ فاکتور */}
            <div className={styles.summaryRow}>
              <span>مجموع قیمت اقلام:</span>
              <span>{(cartSubtotal ?? 0).toLocaleString('fa-IR')} تومان</span>
            </div>

            <div className={styles.summaryRow}>
              <span>هزینه ارسال:</span>
              <span>{shippingFee === 0 ? 'رایگان' : `${(shippingFee ?? 0).toLocaleString('fa-IR')} تومان`}</span>
            </div>

            <div className={styles.totalRow}>
              <span>مبلغ نهایی قابل پرداخت:</span>
              <strong className={styles.totalPrice}>
                {(finalTotal ?? 0).toLocaleString('fa-IR')} تومان
              </strong>
            </div>

            {/* دکمه‌های اقدام واضح */}
            <button type="button" onClick={handleOpenCheckout} className={styles.btnCheckout}>
              <i className="fa-solid fa-credit-card" />
              <span>تکمیل سفارش و پرداخت نهایی</span>
            </button>

            <Link to="/products" className={styles.btnContinue}>
              <i className="fa-solid fa-arrow-right" />
              <span>افزودن محصولات دیگر به سبد</span>
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}

export { CartPage };
