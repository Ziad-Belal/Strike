import React from 'react'
import ProductCard from './ProductCard.jsx'

export default function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return <p className="text-center py-10">No products available</p>
  }

  return (
    <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
      {products.map(p => p && <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
