// src/pages/ProductPage.jsx

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { Input, Button } from '../components/atoms.jsx'
import { ShoppingCart, Heart } from 'lucide-react'

const currency = (value) => `$${Number(value).toFixed(2)}`;

export default function ProductPage({ addToCart }) {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [selectedSize, setSelectedSize] = useState(null) 

  useEffect(() => {
    async function getProduct() {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*') // This will now also fetch the new 'available_sizes' column
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching product:', error)
        setProduct(null)
      } else {
        setProduct(data)
      }
      setLoading(false)
    }

    if (id) {
      getProduct()
    }
  }, [id])

  if (loading) {
    return <div className='container py-10 text-center'>Loading Product...</div>
  }

  if (!product) {
    return <div className='container py-10 text-center'>Product not found.</div>
  }

  // Use the image_url from the database if it exists, otherwise use a placeholder
  const imageUrl = product.image_url || `https://placehold.co/800x600/EEE/31343C?text=${product.name.replace(/\s/g, "+")}`;
  
  // --- NEW: Check if this product has sizes available from the database ---
  const hasSizes = product.available_sizes && product.available_sizes.length > 0;

  // --- NEW: A smarter function for adding to cart ---
  const handleAddToCart = () => {
    // Only require a size if the product actually has sizes
    if (hasSizes && !selectedSize) {
      // We can use the toast notification system here
      // import { toast } from 'react-hot-toast'; at the top of the file if you haven't already
      alert('Please select a size.'); // Or toast.error('Please select a size.')
      return;
    }
    addToCart(product, selectedSize, qty);
  }

  return (
    <div className='container py-10'>
      <div className='grid gap-8 md:grid-cols-2'>
        <div className="flex flex-col items-center">
          <img src={imageUrl} alt={product.name} className='w-full rounded-3xl object-cover aspect-[3/2] max-h-[600px]' />
        </div>
        <div>
          <div className='text-sm text-black/60'>{product.category.toUpperCase()}</div>
          <h1 className='mt-1 text-2xl font-bold'>{product.name}</h1>
          
          <div className='mt-4 text-2xl font-semibold'>{currency(product.price)}</div>

          {/* --- MODIFICATION: The entire size selection block is now dynamic --- */}
          {/* It only renders if the product has sizes in the database */}
          {hasSizes && (
            <div className='mt-6'>
              <div className='mb-2 text-sm font-semibold'>Select Size</div>
              <div className='flex flex-wrap gap-2'>
                {product.available_sizes.map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSelectedSize(s)} 
                    className={`rounded-xl border px-3 py-2 ${selectedSize===s? 'border-black bg-black text-white':'border-black/10 hover:bg-black/5'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* --- END MODIFICATION --- */}

          <div className='mt-4 flex items-center gap-2'>
            <label className='text-sm'>Qty</label>
            <Input type='number' min={1} value={qty} onChange={(e)=> setQty(Math.max(1, Number(e.target.value)))} className='w-20'/>
          </div>

          <div className='mt-6 flex gap-3'>
            <Button size='lg' onClick={handleAddToCart} className='gap-2'><ShoppingCart size={18}/> Add to Cart</Button>
            <Button size='lg' variant='outline' className='gap-2'><Heart size={18}/> Wishlist</Button>
          </div>

          <div className='mt-8 space-y-3 text-sm text-black/70'>
            <div>{product.description}</div>
          </div>
        </div>
      </div>
    </div>
  )
}