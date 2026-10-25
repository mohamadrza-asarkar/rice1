import React, { useState } from 'react';
import { getImageUrl } from '../../../api/client';
import styles from '../admin.module.css';

const defaultDealForm = {
  productId: '',
  discountPercent: 15,
  dealPrice: '',
  dealDurationHours: 24
};

export function AdminDeals({
  amazingProducts = [],
  allProducts = [],
  onAddDeal,
  onUpdateDeal,
  onRemoveDeal
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(defaultDealForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProductSelect = (productId) => {
    const selected = allProducts.find((product) => (product.id || product._id) === productId);
    const regularPrice = Number(selected?.price || 0);
    const discount = Number(form.discountPercent || 15);
    const computedDeal = regularPrice > 0 ? Math.round(regularPrice * (1 - discount / 100)) : '';

    setForm((previous) => ({
      ...previous,
      productId,
      dealPrice: computedDeal
    }));
  };

  const handleDiscountChange = (discountValue) => {
    const discount = Number(discountValue);
    const targetPid = editingProduct ? (editingProduct.id || editingProduct._id) : form.productId;
    const selected = allProducts.find((product) => (product.id || product._id) === targetPid) || editingProduct;
    const regularPrice = Number(selected?.originalPrice || selected?.price || 0);
    const computedDeal = regularPrice > 0 && discount >= 0 ? Math.round(regularPrice * (1 - discount / 100)) : '';

    setForm((previous) => ({
      ...previous,
      discountPercent: discountValue,
      dealPrice: computedDeal
    }));
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(defaultDealForm);
    setShowModal(true);
  };

  const openEditModal = (prod) => {
    const pid = prod.id || prod._id;
    const regularPrice = Number(prod.originalPrice || prod.price || 0);
    const discount = Number(prod.discountPercent || 15);
    const currentDealPrice = Number(prod.dealPrice || (regularPrice > 0 ? Math.round(regularPrice * (1 - discount / 100)) : prod.price));

    setEditingProduct(prod);
    setForm({
      productId: pid,
      discountPercent: discount,
      dealPrice: currentDealPrice,
      dealDurationHours: prod.amazingDurationHours || 24
    });
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.productId) return;
    setIsSubmitting(true);
    try {
      const hours = Number(form.dealDurationHours || 24);
      const computedExpiresAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();
      const payload = {
        ...form,
        amazingDurationHours: hours,
        dealDurationHours: hours,
        durationHours: hours,
        amazingExpiresAt: computedExpiresAt,
        expiresAt: computedExpiresAt
      };

      if (editingProduct && onUpdateDeal) {
        await onUpdateDeal(form.productId, payload);
      } else if (onAddDeal) {
        await onAddDeal(payload);
      }
      setForm(defaultDealForm);
      setEditingProduct(null);
      setShowModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.card}>
      <div className={styles.toolbar}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>مدیریت پیشنهادهای شگفت‌انگیز</h2>
          <p className={styles.subtitle}>محصولات منتخب با تخفیف ویژه در بخش شگفت‌انگیز صفحه نخست</p>
        </div>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={openAddModal}
        >
          <i className="fa-solid fa-plus" />
          <span>افزودن محصول شگفت‌انگیز</span>
        </button>
      </div>

      <div className={styles.itemsList}>
        {amazingProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: '2rem' }} />
            <p>در حال حاضر هیچ محصولی در پیشنهاد شگفت‌انگیز قرار ندارد.</p>
          </div>
        ) : (
          amazingProducts.map((product) => {
            const productId = product.id || product._id;
            const regularPrice = Number(product.originalPrice || product.price || 0);
            const dealPrice = Number(product.dealPrice || Math.round(regularPrice * (1 - (product.discountPercent || 15) / 100)));
            return (
              <div key={productId} className={styles.itemRow}>
                <div className={styles.itemInfo}>
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className={styles.thumbnail}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = '/src/assets/images/white_rice_sack_1_1786553727373.jpg';
                    }}
                  />
                  <div className={styles.itemDetails}>
                    <div className={styles.rowCenter}>
                      <h3 className={styles.itemName}>{product.name}</h3>
                      <span className={`${styles.badge} ${styles.badgeWarning}`}>
                        <i className="fa-solid fa-star" />
                        <span>{product.discountPercent || 15}٪ تخفیف</span>
                      </span>
                    </div>
                    <p className={styles.itemMeta}>
                      <span>قیمت شگفت‌انگیز: {dealPrice.toLocaleString('fa-IR')} تومان</span>
                      <span>(قیمت قبل: {regularPrice.toLocaleString('fa-IR')})</span>
                    </p>
                  </div>
                </div>

                <div className={styles.itemActions}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => openEditModal(product)}
                    title="ویرایش قیمت و درصد تخفیف شگفت‌انگیز"
                  >
                    <i className="fa-solid fa-pen-to-square" />
                    <span>ویرایش</span>
                  </button>

                  <button
                    type="button"
                    className={styles.dangerBtn}
                    onClick={() => onRemoveDeal && onRemoveDeal(productId)}
                  >
                    <i className="fa-solid fa-trash-can" />
                    <span>حذف از شگفت‌انگیز</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingProduct ? `ویرایش پیشنهاد شگفت‌انگیز (${editingProduct.name})` : 'افزودن به پیشنهادهای شگفت‌انگیز'}
              </h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.formGrid}>
              {!editingProduct && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>انتخاب محصول</label>
                  <select
                    className={styles.select}
                    value={form.productId}
                    onChange={(event) => handleProductSelect(event.target.value)}
                    required
                  >
                    <option value="">-- یک محصول انتخاب کنید --</option>
                    {allProducts.map((product) => {
                      const productId = product.id || product._id;
                      return (
                        <option key={productId} value={productId}>
                          {product.name} ({Number(product.price || 0).toLocaleString('fa-IR')} تومان)
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <div className={`${styles.formGrid} ${styles.formGrid2}`}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>درصد تخفیف (٪)</label>
                  <input
                    type="number"
                    className={styles.input}
                    min="1"
                    max="90"
                    value={form.discountPercent}
                    onChange={(event) => handleDiscountChange(event.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>قیمت نهایی شگفت‌انگیز (تومان)</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={form.dealPrice}
                    onChange={(event) => setForm((previous) => ({ ...previous, dealPrice: event.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>مدت زمان اعتبار (ساعت)</label>
                <input
                  type="number"
                  className={styles.input}
                  value={form.dealDurationHours}
                  onChange={(event) => setForm((previous) => ({ ...previous, dealDurationHours: event.target.value }))}
                />
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                  }}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'در حال ثبت...' : (editingProduct ? 'ذخیره تغییرات' : 'ثبت در شگفت‌انگیز')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminDeals;
