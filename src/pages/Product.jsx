import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { productsApi } from '../api/products.api';
import { reviewsApi } from '../api/reviews.api';
import { getImageUrl, handleImageError } from '../api/client';
import styles from '../assets/styles/pages.module.css';

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, currentUser, showSuccess, showError, showToast } = useApp();
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs', 'cooking', 'reviews'
  const [copied, setCopied] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [fetchedProduct, setFetchedProduct] = useState(null);

  // Match from store or fallback to fetched product
  const matchedProduct = products.find((p) => String(p.id) === String(id) || String(p._id) === String(id));
  const product = matchedProduct || fetchedProduct || products[0];

  // Fetch product if not available in current memory
  React.useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      if (!matchedProduct && id) {
        try {
          const single = await productsApi.getById(id);
          if (isMounted && single) {
            setFetchedProduct(single);
          }
        } catch (err) {
          console.debug('Failed to fetch product by id:', id, err);
        }
      }
    }
    loadProduct();
    return () => { isMounted = false; };
  }, [id, matchedProduct]);

  // Load reviews for this product
  React.useEffect(() => {
    let isMounted = true;
    async function fetchReviews() {
      const targetId = product?._id || product?.id || id;
      if (!targetId) return;
      setIsLoadingReviews(true);
      try {
        const list = await reviewsApi.getByProductId(targetId);
        if (isMounted) {
          setReviews(list || []);
        }
      } catch (err) {
        console.debug('Failed to load reviews for product:', targetId, err);
      } finally {
        if (isMounted) {
          setIsLoadingReviews(false);
        }
      }
    }
    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, [id, product?._id, product?.id]);

  if (!product) {
    return (
      <main className={styles.pageContainer}>
        <section className={styles.card}>
          <h1 className={styles.pageTitle}>محصول یافت نشد</h1>
          <button type="button" className={styles.btnPrimary} onClick={() => navigate('/products')}>
            بازگشت به فروشگاه
          </button>
        </section>
      </main>
    );
  }

  const handleDecrease = () => setQuantity((q) => Math.max(1, q - 1));
  const handleIncrease = () => setQuantity((q) => q + 1);
  const handleAddToCart = () => {
    addToCart(product, quantity);
    showSuccess(`${quantity.toLocaleString('fa-IR')} عدد ${product.name} به سبد خرید اضافه شد.`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `برنج اصیل طلا رایس: ${product.name}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      showSuccess('لینک محصول در کلیپ‌بورد کپی شد.');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentPrice = Number(product.price || 0);
  const rawOriginal = Number(product.originalPrice || product.oldPrice || product.old_price || 0);
  const discountPercent = Number(product.discountPercent || product.discount || 0);

  let currentOldPrice = rawOriginal > currentPrice ? rawOriginal : null;
  if (!currentOldPrice && discountPercent > 0 && currentPrice > 0) {
    currentOldPrice = Math.round(currentPrice / (1 - discountPercent / 100));
  }

  const computedDiscountPercent = discountPercent > 0
    ? discountPercent
    : (currentOldPrice && currentOldPrice > currentPrice ? Math.round((1 - currentPrice / currentOldPrice) * 100) : 0);

  const weightNum = parseInt(product.weight) || 10;
  const pricePerKg = Math.round(currentPrice / weightNum);

  return (
    <main className={styles.pageContainer}>
      {/* نوار بالای صفحه */}
      <header className={styles.productTopNav}>
        <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-right" />
          <span>بازگشت</span>
        </button>

        <div className={styles.productTopActions}>
          <button
            type="button"
            className={styles.iconActionBtn}
            onClick={handleShare}
            title="اشتراک‌گذاری"
          >
            <i className="fa-solid fa-share-nodes" />
          </button>
          <span className={styles.badge}>{product.categoryName || 'برنج اصیل کامفیروز'}</span>
        </div>
      </header>

      {/* تصویر اصلی محصول و جلوه بصری */}
      <div className={styles.productHeroCard}>
        <div className={styles.productMainImageWrapper}>
          <img src={getImageUrl(product.image)} alt={product.name} className={styles.productMainImage} onError={handleImageError} />
          {computedDiscountPercent > 0 && (
            <span className={styles.productDiscountBadge}>
              {computedDiscountPercent.toLocaleString('fa-IR')}٪ تخفیف ویژه
            </span>
          )}
          <div className={styles.productOriginTag}>
            <i className="fa-solid fa-wand-magic-sparkles text-xs" />
            <span>محصول اختصاصی کامفیروز فارس</span>
          </div>
        </div>

        <div className={styles.productTitleArea}>
          <h1 className={styles.productDetailTitle}>{product.name}</h1>
          <div className={styles.productRatingRow}>
            <div className={styles.starsWrapper}>
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className="fa-solid fa-star text-yellow-400 text-sm"
                />
              ))}
            </div>
            <span className={styles.ratingNumber}>{(product.rating || 5).toLocaleString('fa-IR')}</span>
            {reviews.length > 0 ? (
              <span className={styles.reviewsCount}>({reviews.length.toLocaleString('fa-IR')} نظر خریداران)</span>
            ) : (
              <span className={styles.reviewsCount}>(کیفیت تضمین‌شده)</span>
            )}
          </div>
        </div>

        {/* جعبه قیمت و وزن */}
        <div className={styles.productPriceBox}>
          <div className={styles.productPriceMain}>
            {currentOldPrice && (
              <del className={styles.productOldPriceText}>
                {currentOldPrice.toLocaleString('fa-IR')} تومان
              </del>
            )}
            <div className={styles.productCurrentPriceText}>
              <span className={styles.currentPriceNumber}>
                {(currentPrice * quantity).toLocaleString('fa-IR')}
              </span>
              <span className={styles.currency}>تومان</span>
            </div>
          </div>

          <div className={styles.pricePerKgBadge}>
            <span>قیمت هر کیلو:</span>
            <strong>{pricePerKg.toLocaleString('fa-IR')} تومان</strong>
          </div>
        </div>

        {/* شمارنده و دکمه خرید */}
        <div className={styles.productPurchaseSection}>
          <div className={styles.quantityCounter}>
            <button
              type="button"
              className={styles.counterBtn}
              onClick={handleDecrease}
              aria-label="کاهش تعداد"
            >
              <i className="fa-solid fa-minus" />
            </button>
            <span className={styles.counterValue}>{quantity.toLocaleString('fa-IR')}</span>
            <button
              type="button"
              className={styles.counterBtn}
              onClick={handleIncrease}
              aria-label="افزایش تعداد"
            >
              <i className="fa-solid fa-plus" />
            </button>
          </div>

          <button
            type="button"
            className={styles.btnPrimaryAddToCart}
            onClick={handleAddToCart}
          >
            <i className="fa-solid fa-bag-shopping" />
            <span>افزودن به سبد خرید</span>
          </button>
        </div>
      </div>

      {/* تب‌های جزییات محصول */}
      <div className={styles.productTabsContainer}>
        <div className={styles.productTabHeaders}>
          <button
            type="button"
            className={`${styles.productTabHeader} ${activeTab === 'specs' ? styles.productTabHeaderActive : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            ویژگی‌ها و درجه‌بندی
          </button>
          <button
            type="button"
            className={`${styles.productTabHeader} ${activeTab === 'cooking' ? styles.productTabHeaderActive : ''}`}
            onClick={() => setActiveTab('cooking')}
          >
            راهنمای پخت شالیزاری
          </button>
          <button
            type="button"
            className={`${styles.productTabHeader} ${activeTab === 'reviews' ? styles.productTabHeaderActive : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            نظرات خریداران
          </button>
        </div>

        {/* محتوای تب ۱: مشخصات */}
        {activeTab === 'specs' && (
          <div className={styles.productTabContent}>
            <p className={styles.productDescriptionLead}>{product.description}</p>

            <div className={styles.specsGrid}>
              <div className={styles.specItem}>
                <span className={styles.specKey}>منطقه کشت:</span>
                <span className={styles.specVal}>شالیزارهای کامفیروز، مرودشت فارس</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specKey}>سال زراعی:</span>
                <span className={styles.specVal}>{product.harvestYear || '۱۴۰۳ (کشت امسال)'}</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specKey}>بسته‌بندی:</span>
                <span className={styles.specVal}>کیسه نخی سفید درجه یک با تنفس‌پذیری طبیعی</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specKey}>وضعیت بوجار:</span>
                <span className={styles.specVal}>۲ مرحله سورت لیزری و بدون دانه‌شکسته</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specKey}>عطر اولیه:</span>
                <span className={styles.specVal}>بسیار غلیظ و ماندگار</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specKey}>میزان ری‌دهی:</span>
                <span className={styles.specVal}>قدکشیدگی عالی و دانه‌دانه شدن مجلسی</span>
              </div>
            </div>
          </div>
        )}

        {/* محتوای تب ۲: دستور پخت */}
        {activeTab === 'cooking' && (
          <div className={styles.productTabContent}>
            <div className={styles.cookingHeader}>
              <i className="fa-solid fa-kitchen-set text-yellow-400 text-xl" />
              <h3 className={styles.cookingTitle}>نکات طلایی پخت برنج معطر کامفیروزی</h3>
            </div>
            <p className={styles.cookingIntro}>
              برنج اصیل کامفیروز به دلیل بافت لطیف و عطر طبیعی، نیازمند زمان خیساندن کمتری نسبت به ارقام دیگر است:
            </p>

            <ul className={styles.cookingSteps}>
              <li>
                 <strong>روش آبکش مجلسی:</strong> برنج را با آب ولرم ۲ بار به آرامی بشویید و حداکثر ۱ ساعت در آب و نمک کم بخیسانید. هنگام جوشیدن در آب، به محض بلند شدن قد برنج (حدود ۸ تا ۱۰ دقیقه) آبکش کنید و با شعله ملایم به مدت ۴۰ دقیقه دم بگذارید.
              </li>
              <li>
                <strong>روش کته اصیل سنتی:</strong> به ازای هر پیمانه برنج، ۱٫۲۵ پیمانه آب و کمی روغن یا کره محلی بیفزایید. این روش بیشترین عطر و طعم طبیعی برنج شالیزار را حفظ می‌کند.
              </li>
            </ul>
          </div>
        )}

        {/* محتوای تب ۳: نظرات خریداران */}
        {activeTab === 'reviews' && (
          <div className={styles.productTabContent}>
            <div className={styles.reviewsHeaderRow}>
              <h3 className={styles.reviewsTitle}>تجربه خریداران این رقم برنج</h3>
              <span className={styles.verifiedBuyersBadge}>
                <i className="fa-solid fa-circle-check" /> خریداران تأییدشده
              </span>
            </div>

            <div className={styles.reviewsItemsList}>
              {/* فرم ارسال دیدگاه جدید */}
              {!currentUser ? (
                <div style={{
                  padding: '1rem',
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#475569' }}>
                    برای ثبت نظر و امتیازدهی به این محصول، لطفاً ابتدا وارد حساب کاربری خود شوید.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/auth')}
                    className={styles.btnPrimary}
                    style={{ padding: '0.35rem 1rem', fontSize: '0.85rem' }}
                  >
                    ورود / ثبت‌نام در سایت
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newComment.trim()) return;
                    setIsSubmittingReview(true);
                    const prodId = product._id || product.id || id;
                    const userDisplayName = currentUser?.name || currentUser?.fullName || currentUser?.username || (currentUser?.phone ? `کاربر (${currentUser.phone})` : '');
                    try {
                      const createdReview = await reviewsApi.create({
                        productId: prodId,
                        comment: newComment.trim(),
                        rating: Number(newRating),
                        userName: userDisplayName
                      });
                      showSuccess('دیدگاه شما با موفقیت در سامانه ثبت شد.');
                      setNewComment('');
                      // Refresh reviews list from server
                      try {
                        const updatedList = await reviewsApi.getByProductId(prodId);
                        if (updatedList && updatedList.length > 0) {
                          setReviews(updatedList);
                        } else if (createdReview) {
                          setReviews((prev) => [createdReview, ...prev]);
                        }
                      } catch {
                        if (createdReview) {
                          setReviews((prev) => [createdReview, ...prev]);
                        }
                      }
                    } catch (err) {
                      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'خطا در ثبت نظر در سرور';
                      showError(msg);
                    } finally {
                      setIsSubmittingReview(false);
                    }
                  }}
                  className={styles.cardHighlight}
                  style={{ marginBottom: '1rem', padding: '1rem' }}
                >
                  <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>
                    ثبت نظر و تجربه پخت
                  </strong>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem' }}>امتیاز شما:</label>
                    <select
                      value={newRating}
                      onChange={(e) => setNewRating(Number(e.target.value))}
                      className={styles.select}
                      style={{ width: 'auto', padding: '0.25rem 0.5rem' }}
                    >
                      <option value={5}>۵ ستاره (عالی)</option>
                      <option value={4}>۴ ستاره (بسیار خوب)</option>
                      <option value={3}>۳ ستاره (متوسط)</option>
                      <option value={2}>۲ ستاره (ضعیف)</option>
                      <option value={1}>۱ ستاره (خیلی ضعیف)</option>
                    </select>
                  </div>
                  <textarea
                    className={styles.textarea}
                    rows={2}
                    placeholder="تجربه شما از عطر، قدکشیدگی و کیفیت پخت..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className={styles.btnPrimary}
                    style={{ marginTop: '0.5rem', padding: '0.4rem 1rem' }}
                  >
                    {isSubmittingReview ? 'در حال ثبت...' : 'ارسال نظر'}
                  </button>
                </form>
              )}

              {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: '#78716c', fontSize: '0.9rem' }}>
                  <i className="fa-regular fa-comment-dots" style={{ fontSize: '1.8rem', display: 'block', marginBottom: '0.5rem', opacity: 0.6 }} />
                  هنوز دیدگاهی برای این محصول ثبت نشده است. اولین نظر و تجربه پخت را شما ثبت کنید!
                </div>
              ) : (
                reviews.map((rev) => {
                  const authorTitle = rev.userName || rev.author || rev.name || (rev.user?.name || rev.user?.username || (rev.user?.phone ? `کاربر (${rev.user.phone})` : (currentUser && (currentUser._id === rev.user || currentUser.id === rev.user) ? (currentUser.name || `کاربر (${currentUser.phone})`) : 'کاربر')));
                  return (
                    <div key={rev.id || rev._id} className={styles.reviewCardItem}>
                      <div className={styles.reviewCardHeader}>
                        <div>
                          <strong className={styles.reviewerName}>{authorTitle}</strong>
                          <span className={styles.reviewerCity}>{rev.city ? `خریدار از ${rev.city}` : 'خریدار محصول'}</span>
                        </div>
                        <div className={styles.starsSmall}>
                          {[...Array(rev.rating || 5)].map((_, idx) => (
                            <i key={idx} className="fa-solid fa-star text-yellow-400 text-xs" />
                          ))}
                        </div>
                      </div>
                      <p className={styles.reviewComment}>{rev.comment}</p>
                      {rev.reply && (
                        <div style={{
                          marginTop: '0.5rem',
                          padding: '0.6rem 0.8rem',
                          background: '#f0fdf4',
                          borderRight: '3px solid #16a34a',
                          borderRadius: '6px',
                          fontSize: '0.85rem'
                        }}>
                          <strong style={{ color: '#166534', display: 'block', marginBottom: '0.2rem' }}>
                            پاسخ مدیر فروشگاه:
                          </strong>
                          <span style={{ color: '#14532d' }}>{rev.reply}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ضمانت و اطمینان خرید */}
      <section className={styles.productTrustBox}>
        <div className={styles.trustItemRow}>
          <i className="fa-solid fa-shield-halved text-yellow-400 text-lg" />
          <span>ضمانت بی‌قید و شرط پخت و عطر (امکان برگشت تا ۷ روز)</span>
        </div>
        <div className={styles.trustItemRow}>
          <i className="fa-solid fa-truck-fast text-yellow-400 text-lg" />
          <span>ارسال مستقیم از انبار شالیزارهای کامفیروز به سراسر کشور</span>
        </div>
      </section>
    </main>
  );
}

export { Product };
