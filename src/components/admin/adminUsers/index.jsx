import React, { useState } from 'react';
import styles from '../admin.module.css';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  password: '',
  role: 'user'
};

export function AdminUsers({
  adminUsers = [],
  onAddUser,
  onDeleteUser,
  onUpdateRole
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryText = searchQuery.trim().toLowerCase();

  const filteredUsers = adminUsers.filter((user) => {
    if (!queryText) return true;
    const name = user.name || '';
    const phone = user.phone || '';
    const email = user.email || '';
    return (
      name.toLowerCase().includes(queryText) ||
      phone.includes(queryText) ||
      email.toLowerCase().includes(queryText)
    );
  });

  const handleFieldChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.phone.trim()) return;
    setIsSubmitting(true);
    try {
      if (onAddUser) {
        await onAddUser(form);
      }
      setForm(initialForm);
      setShowModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.card}>
      <div className={styles.toolbar}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>مدیریت کاربران سامانه</h2>
          <p className={styles.subtitle}>مشاهده، ارتقا نقش یا حذف حساب‌های کاربری</p>
        </div>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => setShowModal(true)}
        >
          <i className="fa-solid fa-user-plus" />
          <span>افزودن کاربر جدید</span>
        </button>
      </div>

      <div className={styles.toolbar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="جستجو با نام، شماره تماس یا ایمیل..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      <div className={styles.itemsList}>
        {filteredUsers.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fa-solid fa-users" style={{ fontSize: '2rem' }} />
            <p>کاربری با این مشخصات یافت نشد.</p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const userId = user.id || user._id;
            const isAdmin = user.role === 'admin' || user.isAdmin;
            return (
              <div key={userId} className={styles.itemRow}>
                <div className={styles.itemDetails}>
                  <div className={styles.rowCenter}>
                    <h3 className={styles.itemName}>{user.name || 'کاربر بدون نام'}</h3>
                    {isAdmin && (
                      <span className={`${styles.badge} ${styles.badgeWarning}`}>
                        <i className="fa-solid fa-shield-halved" />
                        <span>مدیر سیستم</span>
                      </span>
                    )}
                  </div>
                  <p className={styles.itemMeta}>
                    <span>تلفن: {user.phone || 'ثبت نشده'}</span>
                    <span>|</span>
                    <span>ایمیل: {user.email || 'ثبت نشده'}</span>
                  </p>
                </div>

                <div className={styles.itemActions}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => onUpdateRole && onUpdateRole(userId, isAdmin ? 'user' : 'admin')}
                  >
                    {isAdmin ? 'تنظیم به کاربر عادی' : 'ارتقا به مدیر'}
                  </button>
                  <button
                    type="button"
                    className={styles.dangerBtn}
                    onClick={() => setUserToDelete(user)}
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

      {userToDelete && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>تأیید حذف کاربر</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setUserToDelete(null)}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <p className={styles.confirmText}>
              آیا از حذف حساب کاربری «{userToDelete.name || userToDelete.phone}» اطمینان دارید؟
            </p>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setUserToDelete(null)}
              >
                انصراف
              </button>
              <button
                type="button"
                className={styles.dangerBtn}
                onClick={() => {
                  const userId = userToDelete.id || userToDelete._id;
                  setUserToDelete(null);
                  if (onDeleteUser) onDeleteUser(userId);
                }}
              >
                حذف قطعی
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>افزودن کاربر جدید</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>نام و نام خانوادگی</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="مثال: علی احمدی"
                  value={form.name}
                  onChange={(event) => handleFieldChange('name', event.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>شماره تماس (الزامی)</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  value={form.phone}
                  onChange={(event) => handleFieldChange('phone', event.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>رمز عبور (الزامی)</label>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="حداقل ۶ کاراکتر"
                  value={form.password}
                  onChange={(event) => handleFieldChange('password', event.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>ایمیل (اختیاری)</label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="user@example.com"
                  value={form.email}
                  onChange={(event) => handleFieldChange('email', event.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>سطح دسترسی</label>
                <select
                  className={styles.select}
                  value={form.role}
                  onChange={(event) => handleFieldChange('role', event.target.value)}
                >
                  <option value="user">کاربر عادی / خریدار</option>
                  <option value="admin">مدیر سیستم (دسترسی کامل)</option>
                </select>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setShowModal(false)}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'در حال ثبت...' : 'ثبت کاربر'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminUsers;
