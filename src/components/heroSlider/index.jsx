import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context';
import { getImageUrl, handleImageError } from '../../api/client';
import styles from './style.module.css';

export function HeroSlider() {
  const { heroSlides, setSelectedCategory } = useApp();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Touch and Swipe state
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const isInteractingRef = useRef(false);

  useEffect(function () {
    if (!heroSlides?.length) return;
    const timer = setInterval(function () {
      if (!isInteractingRef.current) {
        setCurrentSlide(function (prev) { return (prev + 1) % heroSlides.length; });
      }
    }, 6000);
    return function () { clearInterval(timer); };
  }, [heroSlides?.length]);

  const slide = heroSlides?.[currentSlide];

  function handleCta() {
    if (slide?.category) setSelectedCategory(slide.category);
    navigate('/products');
  }

  // Touch event handlers
  const handleTouchStart = (e) => {
    isInteractingRef.current = true;
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    isInteractingRef.current = false;
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 35;

    // In RTL layout:
    // Left drag (finger moves left, touchStartX > touchEndX, distance > 35) -> Next Slide
    // Right drag (finger moves right, touchStartX < touchEndX, distance < -35) -> Previous Slide
    if (distance > minSwipeDistance) {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    } else if (distance < -minSwipeDistance) {
      setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Mouse drag fallback handlers for desktop
  const handleMouseDown = (e) => {
    isInteractingRef.current = true;
    setIsMouseDown(true);
    setTouchStartX(e.clientX);
    setTouchEndX(null);
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown) return;
    setTouchEndX(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isMouseDown) return;
    setIsMouseDown(false);
    handleTouchEnd();
  };

  const handleMouseLeave = () => {
    if (isMouseDown) {
      setIsMouseDown(false);
      isInteractingRef.current = false;
    }
  };

  return !heroSlides?.length ? null : (
    <section
      className={`${styles.sliderCard} ${isMouseDown ? styles.dragging : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      aria-label="اسلایدر ویژه محصولات"
    >
      <img
        key={currentSlide}
        src={getImageUrl(slide?.image, currentSlide)}
        alt={slide?.title || 'اسلاید'}
        className={styles.bgImage}
        draggable={false}
        onError={(e) => handleImageError(e, currentSlide)}
      />

      <div className={styles.content}>
        {slide.subtitle ? <span className={styles.badge}>{slide.subtitle}</span> : null}
        {slide.title ? <h2 className={styles.title}>{slide.title}</h2> : null}
        {slide.description ? <p className={styles.description}>{slide.description}</p> : null}
      </div>

      <footer className={styles.controls}>
        <button
          type="button"
          onClick={handleCta}
          className={styles.ctaButton}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <span>{slide.ctaText || 'مشاهده و خرید'}</span>
          <i className="fa-solid fa-arrow-left" />
        </button>

        <div className={styles.navRow} onMouseDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={function () { setCurrentSlide(function (prev) { return (prev - 1 + heroSlides.length) % heroSlides.length; }); }}
            className={styles.navBtn}
            aria-label="اسلاید قبلی"
          >
            <i className="fa-solid fa-chevron-right" />
          </button>
          <div className={styles.dots}>
            {heroSlides.map(function (_, idx) {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={function () { setCurrentSlide(idx); }}
                  className={`${styles.dot} ${currentSlide === idx ? styles.dotActive : ''}`}
                  aria-label={`اسلاید ${idx + 1}`}
                />
              );
            })}
          </div>
          <button
            type="button"
            onClick={function () { setCurrentSlide(function (prev) { return (prev + 1) % heroSlides.length; }); }}
            className={styles.navBtn}
            aria-label="اسلاید بعدی"
          >
            <i className="fa-solid fa-chevron-left" />
          </button>
        </div>
      </footer>
    </section>
  );
}
