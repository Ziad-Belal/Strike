import React from 'react'
import HeroCarousel from '../components/HeroCarousel.jsx'
import ProductGrid from '../components/ProductGrid.jsx'
import { PRODUCTS } from '../utils/products.js'

export default function Home() {
  const featured = PRODUCTS.slice(0, 4)
  return (
    <div>
      <HeroCarousel />
      <section className='container py-10'>
        <SectionHeader title='Featured' linkText='Shop Men' linkTo='/men' />
        <ProductGrid products={featured} />
      </section>
      <PromoStrip />
      <section className='container py-10'>
        <SectionHeader title='Trending Now' linkText='Explore New Arrivals' linkTo='/new-arrivals' />
        <ProductGrid products={PRODUCTS} />
      </section>
    </div>
  )
}

function SectionHeader({ title, linkText, linkTo }) {
  return (
    <div className='mb-6 flex items-center justify-between'>
      <h2 className='text-xl font-bold sm:text-2xl'>{title}</h2>
      <a href={linkTo} className='text-sm font-medium hover:opacity-80'>{linkText} →</a>
    </div>
  )
}

function PromoStrip() {
  return (
    <div className='bg-black py-3 text-white'>
      <div className='container flex items-center justify-center gap-6 text-sm'>
        <span>Free shipping over $100</span>
        <span className='hidden sm:inline'>30-day returns</span>
        <span className='hidden md:inline'>Students get 10% off</span>
      </div>
    </div>
  )
}
