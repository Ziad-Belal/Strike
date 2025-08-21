// src/pages/ProductPage.jsx

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient' // Make sure this path is correct
import { Input, Button } from '../components/atoms.jsx'
import { Star, Truck, Heart, ShoppingCart } from 'lucide-react'

// Assuming you have a currency helper, otherwise we can use a simple formatter.
// import { currency } from '../utils/helpers.js' 
const currency = (value) => `$${Number(value).toFixed(2)}`;


export default function ProductPage({ addToCart }) {
  const { id } = useParams() // Changed from slug to id for clarity
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  
  // State for things not in the DB yet, we can manage them locally for now
  const [selectedSize, setSelectedSize] = useState(null) 

  useEffect(() => {
    async function getProduct() {
      setLoading(true)
      // Fetch a single product where the 'id' column matches the id from the URL
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single() // .single() returns one object instead of an array

      if (error) {
        console.error('Error fetching product:', error)
        setProduct(null) // Product not found or error occurred
      } else {
        setProduct(data)
      }
      setLoading(false)
    }

    if (id) {
      getProduct()
    }
  }, [id]) // Re-run the effect if the id in the URL changes

  if (loading) {
    return <div className='container py-10 text-center'>Loading Product...</div>
  }

  if (!product) {
    return <div className='container py-10 text-center'>Product not found.</div>
  }

  // Use a placeholder for the main image
  const placeholderImg = `https://placehold.co/800x600/EEE/31343C?text=${product.name.replace(/\s/g, "+")}`;

  return (
    <div className='container py-10'>
      <div className='grid gap-8 md:grid-cols-2'>
        <div className="flex flex-col items-center">
          <img src={placeholderImg} alt={product.name} className='w-full rounded-3xl object-cover aspect-[3/2] max-h-[600px]' />
          {/* Image gallery is commented out as 'images' array is not in the DB */}
          {/* <div className='mt-4 flex gap-4 overflow-x-auto justify-center'> ... </div> */}
        </div>
        <div>
          {/* Use product.category from the database */}
          <div className='text-sm text-black/60'>{product.category.toUpperCase()}</div>
          <h1 className='mt-1 text-2xl font-bold'>{product.name}</h1>
          
          {/* Rating and colors are commented out */}
          {/* <div className='mt-1 flex items-center gap-2 text-sm text-black/70'><Star size={16} className='fill-black'/> {product.rating} • {product.colors.join(', ')}</div> */}
          
          <div className='mt-4 text-2xl font-semibold'>{currency(product.price)}</div>

          {/* Sizes are not in the DB. We can show a dummy selector for UI purposes */}
          {/* This part will not function without data, but we can keep it visually */}
          <div className='mt-6'>
            <div className='mb-2 text-sm font-semibold'>Select Size (EU)</div>
            <div className='flex flex-wrap gap-2'>
              {['39', '40', '41', '42', '43'].map(s => (
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
            {/* Use the description from the database */}
            <div>{product.description}</div>
          </div>
        </div>
      </div>
    </div>
  )
}