import React from 'react'
import HeroCarousel from '../components/HeroCarousel.jsx'
import ProductGrid from '../components/ProductGrid.jsx'

export default function Home({ products }) {
  return (
    <div>
      <HeroCarousel />

      <section className='container py-10'>
        <SectionHeader title='New Arrivals' linkText='Shop New Arrivals' linkTo='/new-arrivals' />
        <ProductGrid products={products} />
      </section>

      <section className='container py-10'>
        <SectionHeader title='Trending Now' linkText='Explore New Arrivals' linkTo='/new-arrivals' />
        <ProductGrid products={products} />
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
