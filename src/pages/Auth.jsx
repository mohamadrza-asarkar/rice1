import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context';
import { normalizePhone } from '../api/auth.api';
import styles from '../assets/styles/auth.module.css';
import logoImg from '../assets/logo.png';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, registerUser, isAuthenticated, currentUser } = useApp();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const redirectPath = location.state?.from?.pathname || '/profile';

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Normalize phone number on submit
    const cleanPhone = normalizePhone(phone);

    if (!cleanPhone) {
      setErrorMessage('لطفاً شماره موبایل خود را وارد نمایید.');
      return;
    }

    if (!/^09\d{9}$/.test(cleanPhone)) {
      setErrorMessage('شماره موبایل نامعتبر است. لطفاً شماره موبایل ۱۱ رقمی معتبر (مانند ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setErrorMessage('وارد کردن نام و نام خانوادگی الزامی است.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('وارد کردن رمز عبور الزامی است.');
      return;
    }

    if (password.trim().length < 6) {
      setErrorMessage('کلمه عبور باید حداقل ۶ رقم یا کاراکتر باشد.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'register') {
        const res = await registerUser(name.trim(), cleanPhone, password.trim());
        if (res.success) {
          navigate(redirectPath, { replace: true });
        } else {
          setErrorMessage(res.message || 'خطا در ثبت‌نام.');
        }
      } else {
        const res = await loginUser(cleanPhone, password.trim());
        if (res.success) {
          navigate(redirectPath, { replace: true });
        } else {
          setErrorMessage(res.message || 'شماره موبایل یا رمز عبور اشتباه است.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <main className={styles.authContainer}>
      {/* برندینگ سامانه فروشگاهی برنج اعلا */}
      <header className={styles.brandHeader}>
        <img src={logoImg} alt="لوگوی فروشگاه برنج اعلا" className={styles.brandLogo} />
        <h1 className={styles.brandTitle}>سامانه فروش برنج اعلا</h1>
        <p className={styles.brandSubtitle}>ورود به حساب کاربری و پیگیری سفارش‌ها</p>
      </header>

      {/* کارت فرم */}
      <section className={styles.authCard}>
        {/* تب سوئیچر بین ورود و ثبت نام */}
        <div className={styles.tabSwitch}>
          <button
            type="button"
            className={mode === 'login' ? styles.tabBtnActive : styles.tabBtn}
            onClick={() => {
              setMode('login');
              setErrorMessage('');
            }}
          >
            <i className="fa-solid fa-right-to-bracket" />
            <span>ورود به حساب</span>
          </button>
          <button
            type="button"
            className={mode === 'register' ? styles.tabBtnActive : styles.tabBtn}
            onClick={() => {
              setMode('register');
              setErrorMessage('');
            }}
          >
            <i className="fa-solid fa-user-plus" />
            <span>ثبت‌نام جدید</span>
          </button>
        </div>

        {/* جعبه نمایش خطا */}
        {errorMessage && (
          <div className={styles.errorBox} role="alert">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', width: '100%' }}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginTop: '3px' }} />
              <div style={{ flex: 1 }}>
                <div>{errorMessage}</div>
                {mode === 'login' && (errorMessage.includes('یافت نشد') || errorMessage.includes('اشتباه است')) && (
                  <div style={{ marginTop: '8px', fontSize: '0.85rem' }}>
                    <span>هنوز ثبت‌نام نکرده‌اید؟ </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setErrorMessage('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: 'inherit',
                        textDecoration: 'underline',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontFamily: 'inherit'
                      }}
                    >
                      اینجا حساب جدید بسازید
                    </button>
                  </div>
                )}
                {mode === 'register' && errorMessage.includes('قبلاً ثبت‌نام شده') && (
                  <div style={{ marginTop: '8px', fontSize: '0.85rem' }}>
                    <span>قبلاً عضو شده‌اید؟ </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setErrorMessage('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: 'inherit',
                        textDecoration: 'underline',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontFamily: 'inherit'
                      }}
                    >
                      ورود به حساب کاربری
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'register' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span>نام و نام خانوادگی</span>
              </label>
              <div className={styles.inputWrapper}>
                <i className={`fa-solid fa-user ${styles.inputIcon}`} />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="مثال: علی محمدی"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span>شماره موبایل</span>
            </label>
            <div className={styles.inputWrapper}>
              <i className={`fa-solid fa-phone ${styles.inputIcon}`} />
              <input
                type="tel"
                className={styles.input}
                placeholder="مثال: 09123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                dir="ltr"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <span>کلمه عبور</span>
            </label>
            <div className={styles.inputWrapper}>
              <i className={`fa-solid fa-lock ${styles.inputIcon}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                className={styles.passwordInput}
                placeholder={mode === 'register' ? 'حداقل ۶ کاراکتر وارد کنید' : 'رمز عبور خود را وارد کنید'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
              />
              <button
                type="button"
                className={styles.togglePasswordBtn}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'مخفی کردن رمز' : 'نمایش رمز'}
                aria-label="تغییر نمایش رمز"
              >
                <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} />
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            <i className={isSubmitting ? 'fa-solid fa-spinner fa-spin' : (mode === 'login' ? 'fa-solid fa-arrow-left-to-bracket' : 'fa-solid fa-check')} />
            <span>{isSubmitting ? 'در حال برقراری ارتباط...' : (mode === 'login' ? 'ورود به حساب کاربری' : 'تکمیل و ایجاد حساب کاربری')}</span>
          </button>
        </form>

      </section>

      <Link to="/" className={styles.backHomeLink}>
        <i className="fa-solid fa-arrow-right" />
        <span>بازگشت به صفحه اصلی فروشگاه</span>
      </Link>
    </main>
  );
}

export { Auth };
