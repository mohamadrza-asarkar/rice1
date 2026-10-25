import React, { useState, useEffect, useRef } from 'react';
import styles from './style.module.css';

function ToastItem({ toast, onDismiss }) {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const duration = toast.duration || 4000;
  const startTimeRef = useRef(Date.now());
  const remainingRef = useRef(duration);
  const timerRef = useRef(null);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 220);
  };

  useEffect(() => {
    if (duration <= 0) return;

    if (!isPaused) {
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, remainingRef.current);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPaused, duration]);

  const handleMouseEnter = () => {
    if (duration > 0) {
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startTimeRef.current));
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (duration > 0) {
      setIsPaused(false);
    }
  };

  const type = toast.type || 'info';

  let typeClass = styles.toastInfo;
  let iconClass = 'fa-solid fa-circle-info';

  if (type === 'success') {
    typeClass = styles.toastSuccess;
    iconClass = 'fa-solid fa-check';
  } else if (type === 'error') {
    typeClass = styles.toastError;
    iconClass = 'fa-solid fa-circle-exclamation';
  } else if (type === 'warning') {
    typeClass = styles.toastWarning;
    iconClass = 'fa-solid fa-triangle-exclamation';
  }

  return (
    <div
      className={`${styles.toastItem} ${typeClass} ${isExiting ? styles.toastItemExiting : ''}`}
      role="alert"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.iconCircle}>
        <i className={iconClass} />
      </div>

      <div className={styles.toastContent}>
        {toast.title && <span className={styles.toastTitle}>{toast.title}</span>}
        <p className={styles.toastMessage}>{toast.message}</p>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={handleDismiss}
          className={styles.closeBtn}
          aria-label="بستن اعلان"
          title="بستن"
        >
          <i className="fa-solid fa-xmark" />
        </button>
      )}

      {duration > 0 && (
        <div className={styles.progressBarContainer}>
          <div
            className={`${styles.progressBar} ${isPaused ? styles.progressBarPaused : ''}`}
            style={{
              animationDuration: `${duration}ms`
            }}
          />
        </div>
      )}
    </div>
  );
}

export function ToastContainer({ toasts = [], onDismiss }) {
  return !toasts || toasts.length === 0 ? null : (
    <div className={styles.toastContainer} role="region" aria-label="اعلانات سیستم">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

export default ToastContainer;

