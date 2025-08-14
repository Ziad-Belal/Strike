import React from 'react'
import Filters from '../components/Filters.jsx'
import ProductGrid from '../components/ProductGrid.jsx'
import { PRODUCTS } from '../utils/products.js'

export default function Category({ category }) {
  const [filtersOpen, setFiltersOpen] = React.useState(false)
  const [size, setSize] = React.useState(null)
  const [color, setColor] = React.useState(null)

  const filtered = React.useMemo(() => {
    return PRODUCTS.filter(p => {
      const inCategory =
        category === 'sale' ? p.badges?.includes('Sale') :
        category === 'new' ? p.badges?.includes('New') :
        p.category === category
      const sizeOk = !size || p.sizes.includes(size)
      const colorOk = !color || p.colors.includes(color)
      return inCategory && sizeOk && colorOk
    })
  }, [category, size, color])

  const title =
    category === 'sale' ? 'Sales' :
    category === 'new' ? 'New Arrivals' :
    category.charAt(0).toUpperCase() + category.slice(1)

  return (
    <div className='container py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>{title}</h1>
        <button className='sm:hidden rounded-2xl border border-black/10 px-3 py-2' onClick={() => setFiltersOpen(true)}>Filters</button>
      </div>

      <div className='grid grid-cols-1 gap-8 md:grid-cols-[240px,1fr]'>
        <aside className='hidden md:block'>
          <Filters size={size} setSize={setSize} color={color} setColor={setColor} />
        </aside>
        <main>
          <div className='mb-4 text-sm text-black/60'>{filtered.length} products</div>
          <ProductGrid products={filtered} />
        </main>
      </div>

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
