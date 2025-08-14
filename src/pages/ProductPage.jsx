import React from 'react'
import { useParams } from 'react-router-dom'
import { PRODUCTS } from '../utils/products.js'
import { Input, Button } from '../components/atoms.jsx'
import { Star, Truck, Heart, ShoppingCart } from 'lucide-react'
import { currency } from '../utils/helpers.js'

export default function ProductPage({ addToCart }) {
  const { slug } = useParams()
  const product = PRODUCTS.find(p => p.id === slug)
  const [selectedSize, setSelectedSize] = React.useState(null)
  const [qty, setQty] = React.useState(1)

  if (!product) return <div className='container py-10'>Product not found.</div>

  return (
    <div className='container py-10'>
      <div className='grid gap-8 md:grid-cols-2'>
        <div className='space-y-4'>
          <img src={product.img} alt={product.name} className='w-full rounded-3xl object-cover' />
          <img src={product.hoverImg} alt={product.name} className='w-full rounded-3xl object-cover' />
        </div>
        <div>
          <div className='text-sm text-black/60'>{product.category.toUpperCase()}</div>
          <h1 className='mt-1 text-2xl font-bold'>{product.name}</h1>
          <div className='mt-1 flex items-center gap-2 text-sm text-black/70'><Star size={16} className='fill-black'/> {product.rating} • {product.colors.join(', ')}</div>
          <div className='mt-4 text-2xl font-semibold'>{currency(product.price)}</div>

          <div className='mt-6'>
            <div className='mb-2 text-sm font-semibold'>Select Size (EU)</div>
            <div className='flex flex-wrap gap-2'>
              {product.sizes.map(s => (
                <button key={s} onClick={() => setSelectedSize(s)} className={`rounded-xl border px-3 py-2 ${selectedSize===s? 'border-black bg-black text-white':'border-black/10 hover:bg-black/5'}`}>{s}</button>
              ))}
            </div>
          </div>

          <div className='mt-4 flex items-center gap-2'>
            <label className='text-sm'>Qty</label>
            <Input type='number' min={1} value={qty} onChange={(e)=> setQty(Math.max(1, Number(e.target.value)))} className='w-20'/>
          </div>

          <div className='mt-6 flex gap-3'>
            <Button size='lg' onClick={() => addToCart(product, selectedSize, qty)} className='gap-2'><ShoppingCart size={18}/> Add to Cart</Button>
            <Button size='lg' variant='outline' className='gap-2'><Heart size={18}/> Wishlist</Button>
          </div>

          <div className='mt-8 space-y-3 text-sm text-black/70'>
            <div className='flex items-center gap-2'><Truck size={18}/> Free delivery over $100</div>
            <div>{product.description}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
