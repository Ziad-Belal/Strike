// src/pages/Home.jsx

import React, { useState, useEffect } from 'react'
import HeroCarousel from '../components/HeroCarousel.jsx'
import ProductGrid from '../components/ProductGrid.jsx'
import { supabase } from '../utils/supabaseClient' // Make sure this path is correct!

export default function Home() {
  // 1. State to store the products
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // 2. useEffect to fetch data when the component loads
  useEffect(() => {
    async function getProducts() {
      setLoading(true) // Start loading
      // 3. The Supabase query
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(8) // Let's get the 8 most recent products for the homepage for now

      if (error) {
        console.error('Error fetching products:', error)
      } else {
        // 4. Update the state with the fetched data
        setProducts(data)
      }
      setLoading(false) // Stop loading
    }

    getProducts()
  }, []) // The empty array [] means this effect runs only once

  // Optional: Show a loading message
  if (loading) {
    return <div className="text-center py-20">Loading products...</div>
  }

  return (
    <div>
      <HeroCarousel />

      <section className='container py-10'>
        <SectionHeader title='New Arrivals' linkText='Shop New Arrivals' linkTo='/new-arrivals' />
        {/* The ProductGrid now receives the products from our component's state */}
        <ProductGrid products={products} />
      </section>

      {/* You might want to fetch different products for this section later */}
      <section className='container py-10'>
        <SectionHeader title='Trending Now' linkText='Explore Trending' linkTo='/trending' />
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