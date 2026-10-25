import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './style.module.css';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleInputClick = () => {
    if (window.location.pathname !== '/search') {
      navigate('/search');
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <form onSubmit={handleSearch} className={styles.searchForm}>
      <div className={styles.searchContainer} onClick={handleInputClick}>
        <i className={`fa-solid fa-magnifying-glass ${styles.searchIcon}`} />
        <input
          type="text"
          dir="rtl"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={handleInputClick}
          placeholder="جستجوی ارقام برنج کامفیروز، طارم، دودی..."
          className={styles.searchInput}
          aria-label="جستجوی محصولات طلا رایس"
        />
        {query ? (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => setQuery('')}
            aria-label="پاک کردن متن جستجو"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        ) : (
          <button type="submit" className={styles.searchSubmitBtn} aria-label="جستجو">
            <span>جستجو</span>
          </button>
        )}
      </div>
    </form>
  );
}

export default SearchBar;
