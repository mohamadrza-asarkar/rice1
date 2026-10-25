import React from 'react';
import { Logo } from '../logo';
import styles from './style.module.css';

export function Footer() {
  const serviceLinks = [
    { icon: 'fa-solid fa-box-check', title: 'رهگیری سفارشات پستی', desc: 'پیگیری آنلاین کد مرسوله پیشتاز' },
    { icon: 'fa-solid fa-book-open', title: 'راهنمای پخت و دم‌آوری', desc: 'روش قد کشیدن برنج اصیل کامفیروز' },
    { icon: 'fa-solid fa-scale-balanced', title: 'شرایط عودت وجه', desc: 'ضمانت بازگشت ۷ روزه کالا' },
    { icon: 'fa-solid fa-certificate', title: 'تضمین اصالت شالیزار', desc: 'خلوص ۱۰۰٪ بدون اختلاط ارقام' }
  ];

  const socials = [
    { icon: 'fa-brands fa-telegram', href: 'https://t.me', label: 'Telegram' },
    { icon: 'fa-brands fa-instagram', href: 'https://instagram.com', label: 'Instagram' },
    { icon: 'fa-brands fa-whatsapp', href: 'https://whatsapp.com', label: 'WhatsApp' }
  ];

  return (
    <div className={styles.footerWrapper}>
      {/* Soft Transition Strip from light canvas to dark footer */}
      <div className={styles.transitionBand}>
        <div className={styles.transitionCurve} />
      </div>

      <footer className={styles.footer}>
        <header className={styles.branding}>
          <Logo variant="dark" />
          <h3 className={styles.brandTitle}>فروشگاه برنج کامفیروز</h3>
          <p className={styles.brandDesc}>
            عرضه مستقیم و بی‌واسطه برنج معطر و خوش‌پخت کامفیروز از مزارع حاصلخیز حاشیه سد درودزن فارس در گونی‌های نخی تنفس‌پذیر.
          </p>
        </header>

        {/* Informative service links instead of duplicate guarantee badges */}
        <section className={styles.servicesGrid} aria-label="خدمات پس از فروش">
          {serviceLinks.map(function (item, i) {
            return (
              <div key={i} className={styles.serviceItem}>
                <i className={item.icon} />
                <div className={styles.serviceText}>
                  <strong>{item.title}</strong>
                  <small>{item.desc}</small>
                </div>
              </div>
            );
          })}
        </section>

        {/* Real phone and contact details with typography hierarchy */}
        <address className={styles.contactCard}>
          <h4 className={styles.contactTitle}>
            <i className="fa-solid fa-headset" />
            <span>واحد پشتیبانی و سفارشات</span>
          </h4>

          <div className={styles.phoneList}>
            <div className={styles.phoneItem}>
              <span className={styles.phoneLabel}>تلفن دفتر مرکزی:</span>
              <a href="tel:07138301560" className={styles.phoneNumber} dir="ltr">
                ۰۷۱-۳۸۳۰۱۵۶۰
              </a>
            </div>
            <div className={styles.phoneItem}>
              <span className={styles.phoneLabel}>مشاوره و همراه:</span>
              <a href="tel:09173147852" className={styles.phoneNumber} dir="ltr">
                ۰۹۱۷-۳۱۴-۷۸۵۲
              </a>
            </div>
          </div>

          <div className={styles.hoursItem}>
            <i className="fa-regular fa-clock" />
            <span>ساعات پاسخگویی: همه‌روزه از ۸:۰۰ الی ۲۱:۰۰</span>
          </div>

          <p className={styles.addressLine}>
            <i className="fa-solid fa-location-dot" />
            <span>فارس، مرودشت، بخش کامفیروز، دفتر مرکزی بازرگانی برنج اعلا</span>
          </p>
        </address>

        <nav className={styles.socials} aria-label="شبکه‌های اجتماعی">
          {socials.map(function (s, i) {
            return (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className={styles.socialLink}
                aria-label={s.label}
              >
                <i className={s.icon} />
              </a>
            );
          })}
        </nav>

        <small className={styles.copyright}>
          سامانه فروشگاهی برنج اعلا — طراحی اختصاصی و آماده فروش و واگذاری کامل امتیاز وب‌سایت.
        </small>
      </footer>
    </div>
  );
}

