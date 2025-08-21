// src/pages/Category.jsx

import React, { useState, useEffect } from 'react'
import Filters from '../components/Filters.jsx'
import ProductGrid from '../components/ProductGrid.jsx'
import { supabase } from '../supabase' // Make sure this path is correct

export default function Category({ category }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // These filter states can remain for the UI, but we won't use them for now
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [size, setSize] = useState(null)
  const [color, setColor] = useState(null)

  useEffect(() => {
    // This function will run whenever the 'category' prop changes
    async function getProductsByCategory() {
      setLoading(true)

      // Map the URL category to the database category name
      let dbCategory = category;
      if (category === 'new') {
        dbCategory = 'New Arrivals';
      } else if (category === 'sale') {
        dbCategory = 'Sale';
      } else {
        // Capitalize first letter for "men", "women", etc.
        dbCategory = category.charAt(0).toUpperCase() + category.slice(1);
      }

      // Fetch products where the 'category' column matches
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', dbCategory) // The filtering happens here!

      if (error) {
        console.error('Error fetching category products:', error)
      } else {
        setProducts(data)
      }
      setLoading(false)
    }

    getProductsByCategory()
  }, [category]) // The effect re-runs if you navigate from /men to /women

  // This logic correctly sets the page title
  const title =
    category === 'sale' ? 'Sales' :
    category === 'new' ? 'New Arrivals' :
    category.charAt(0).toUpperCase() + category.slice(1)

  if (loading) {
    return <div className='container py-8 text-center'>Loading Products...</div>
  }

  return (
    <div className='container py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>{title}</h1>
        <button className='sm:hidden rounded-2xl border border-black/10 px-3 py-2' onClick={() => setFiltersOpen(true)}>Filters</button>
      </div>

      <div className='grid grid-cols-1 gap-8 md:grid-cols-[240px,1fr]'>
        <aside className='hidden md:block'>
          {/* The Filters component is still here, but won't do anything yet */}
          <Filters size={size} setSize={setSize} color={color} setColor={setColor} />
        </aside>
        <main>
          {/* Use the new 'products' state from Supabase */}
          <div className='mb-4 text-sm text-black/60'>{products.length} products</div>
          <ProductGrid products={products} />
        </main>
      </div>

      {/* The mobile filter UI remains the same */}
      {filtersOpen && (
        <div className='fixed inset-0 z-40 bg-black/50 p-4 md:hidden' onClick={() => setFiltersOpen(false)}>
          <div className='mx-auto max-w-sm rounded-3xl bg-white p-4' onClick={(e)=>e.stopPropagation()}>
            <div className='flex items-center justify-between'><h2 className='text-lg font-semibold'>Filters</h2><button onClick={() => setFiltersOpen(false)}>✕</button></div>
            <div className='mt-4'><Filters size={size} setSize={setSize} color={color} setColor={setColor} /></div>
          </div>
        </div>
      )}
    </div>
  )
}