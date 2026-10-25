import React, { useState } from 'react';
import { getImageUrl } from '../../../api/client';
import styles from '../admin.module.css';

const defaultSlideForm = {
  title: '',
  subtitle: '',
  description: '',
  ctaText: 'مشاهده و خرید',
  category: 'all',
  image: ''
};

export function AdminSlides({
  sliders = [],
  onAddSlide,
  onUpdateSlide,
  onDeleteSlide
}) {
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [activeSlide, setActiveSlide] = useState(null);
  const [form, setForm] = useState(defaultSlideForm);
  const [slideToDelete, setSlideToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setForm(defaultSlideForm);
    setModalMode('add');
  };

  const openEditModal = (slide) => {
    setActiveSlide(slide);
    setForm({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      description: slide.description || '',
      ctaText: slide.ctaText || 'مشاهده و خرید',
      category: slide.category || 'all',
      image: slide.image || ''
    });
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveSlide(null);
  };

  const handleFieldChange = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      handleFieldChange('image', loadEvent.target?.result || '');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    setIsSubmitting(true);
    try {
      if (modalMode === 'add' && onAddSlide) {
        await onAddSlide(form);
      } else if (modalMode === 'edit' && onUpdateSlide && activeSlide) {
        const slideId = activeSlide.id || activeSlide._id;
        await onUpdateSlide(slideId, form);
      }
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.card}>
      <div className={styles.toolbar}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>مدیریت اسلایدر و بنرهای تبلیغاتی</h2>
          <p className={styles.subtitle}>اسلایدهای صفحه اصلی سایت را ویرایش، حذف یا ایجاد کنید</p>
        </div>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={openAddModal}
        >
          <i className="fa-solid fa-plus" />
          <span>افزودن اسلاید جدید</span>
        </button>
      </div>

      <div className={styles.itemsList}>
        {sliders.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fa-solid fa-layer-group" style={{ fontSize: '2rem' }} />
            <p>هیچ اسلایدی یافت نشد.</p>
          </div>
        ) : (
          sliders.map((slide) => {
            const slideId = slide.id || slide._id;
            return (
              <div key={slideId} className={styles.itemRow}>
                <div className={styles.itemInfo}>
                  <img
                    src={getImageUrl(slide.image)}
                    alt={slide.title}
                    className={styles.thumbnail}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = '/src/assets/images/white_rice_sack_1_1786553727373.jpg';
                    }}
                  />
                  <div className={styles.itemDetails}>
                    <h3 className={styles.itemName}>{slide.title}</h3>
                    <p className={styles.itemMeta}>
                      <span>{slide.subtitle || 'بدون زیرعنوان'}</span>
                      <span>|</span>
                      <span>دکمه: {slide.ctaText || 'مشاهده'}</span>
                    </p>
                  </div>
                </div>

                <div className={styles.itemActions}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => openEditModal(slide)}
                  >
                    <i className="fa-solid fa-pen-to-square" />
                    <span>ویرایش</span>
                  </button>
                  <button
                    type="button"
                    className={styles.dangerBtn}
                    onClick={() => setSlideToDelete(slide)}
                  >
                    <i className="fa-solid fa-trash-can" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {slideToDelete && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>تأیید حذف اسلاید</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setSlideToDelete(null)}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <p className={styles.confirmText}>
              آیا از حذف اسلاید «{slideToDelete.title}» اطمینان دارید؟
            </p>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setSlideToDelete(null)}
              >
                انصراف
              </button>
              <button
                type="button"
                className={styles.dangerBtn}
                onClick={() => {
                  const slideId = slideToDelete.id || slideToDelete._id;
                  setSlideToDelete(null);
                  if (onDeleteSlide) onDeleteSlide(slideId);
                }}
              >
                حذف قطعی
              </button>
            </div>
          </div>
        </div>
      )}

      {modalMode && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {modalMode === 'add' ? 'افزودن اسلاید جدید' : 'ویرایش اسلاید'}
              </h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={closeModal}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>عنوان اصلی اسلاید</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="مثال: برنج معطر کامفیروز اصل"
                  value={form.title}
                  onChange={(event) => handleFieldChange('title', event.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>زیرعنوان / شعار</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="مثال: برداشت تازه سال از بهترین شالیزارها"
                  value={form.subtitle}
                  onChange={(event) => handleFieldChange('subtitle', event.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>توضیحات کوتاه</label>
                <textarea
                  className={styles.textarea}
                  placeholder="متن کوتاه معرفی اسلاید..."
                  value={form.description}
                  onChange={(event) => handleFieldChange('description', event.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>متن دکمه (CTA)</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="مشاهده و خرید"
                  value={form.ctaText}
                  onChange={(event) => handleFieldChange('ctaText', event.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>تصویر اسلاید</label>
                <div className={styles.rowUpload}>
                  {form.image && (
                    <img
                      src={getImageUrl(form.image)}
                      alt="پیش‌نمایش"
                      className={styles.previewThumb}
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={closeModal}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'در حال ثبت...' : 'ذخیره اسلاید'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminSlides;
