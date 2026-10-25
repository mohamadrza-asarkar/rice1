import React, { useState } from 'react';
import { useApp } from '../../context';
import styles from './style.module.css';

export function TrustBar() {
  const { trustItems } = useApp();
  const [selectedTrust, setSelectedTrust] = useState(null);

  function handleOverlayClick(e) {
    if (e.target.getAttribute('data-role') === 'overlay-close') {
      setSelectedTrust(null);
    }
  }

  return !trustItems?.length ? null : (
    <section className={styles.trustContainer}>
      <div className={styles.trustGrid}>
        {trustItems.map(function (item) {
          return (
            <button
              key={item.id}
              type="button"
              onClick={function () { setSelectedTrust(item); }}
              className={styles.trustItem}
            >
              <div className={styles.iconBox}>
                <i className={item.iconClass} />
              </div>
              <div className={styles.textBox}>
                <strong className={styles.itemTitle}>{item.title}</strong>
                <span className={styles.itemSubtitle}>مشاهده جزئیات</span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedTrust && (
        <div
          className={styles.modalOverlay}
          data-role="overlay-close"
          onClick={handleOverlayClick}
        >
          <div className={styles.modalContent}>
            <header className={styles.modalHeader}>
              <div className={styles.modalIconBox}>
                <i className={selectedTrust.iconClass} />
              </div>
              <h3>{selectedTrust.title}</h3>
            </header>
            <p className={styles.modalDescription}>{selectedTrust.description}</p>
            <button
              type="button"
              onClick={function () { setSelectedTrust(null); }}
              className={styles.closeButton}
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

