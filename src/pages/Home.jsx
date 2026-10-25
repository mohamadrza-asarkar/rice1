import React from 'react';
import { HeroSlider } from '../components/heroSlider';
import { AmazingDeals } from '../components/amazingDeals';
import { BestSellers } from '../components/bestSellers';
import { BrandStory } from '../components/brandStory';
import { TrustBar } from '../components/trustBar';
import { CustomerReviews } from '../components/customerReviews';
import { Footer } from '../components/footer';
import styles from '../assets/styles/pages.module.css';

export default function Home() {
  return (
    <main className={styles.homeContainer}>
      <HeroSlider />
      <AmazingDeals />
      <BestSellers />
      <BrandStory />
      <TrustBar />
      <CustomerReviews />
      <Footer />
    </main>
  );
}

export { Home };
