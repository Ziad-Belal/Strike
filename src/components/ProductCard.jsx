// src/components/ProductCard.jsx

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Star } from 'lucide-react'
import { Badge } from './atoms.jsx'

export default function ProductCard({ product }) {
  // We use a static placeholder image because the database doesn't have image URLs yet.
  const placeholderImg = 'https://placehold.co/600x400/EEE/31343C?text=Product'
  
  const navigate = useNavigate()

  // This check is important! If for some reason a product is null, we don't render anything.
  if (!product) {
    return null;
  }

  return (
    // The link now uses react-router's navigate function, which is great.
    <div className='group cursor-pointer' onClick={() => navigate(`/product/${product.id}`)}>
      <div className='relative overflow-hidden rounded-3xl bg-gray-200'> {/* Changed bg color for placeholder */}
        <img 
          src={placeholderImg} 
          alt={product.name} 
          className='aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105'
        />
        <div className='absolute left-3 top-3 flex gap-2'>
          {/* Badges are commented out as they are not in the DB */}
          {/* {product.badges?.map(b => <Badge key={b} className='bg-white/90 backdrop-blur'>{b}</Badge>)} */}
        </div>
        {/* We can keep the Heart button for UI, but it won't do anything yet */}
        <button className='absolute right-3 top-3 rounded-full bg-white/90 p-2 backdrop-blur hover:bg-white'><Heart size={18}/></button>
      </div>
      <div className='mt-3 flex items-start justify-between gap-4'>
        <div>
          <div className='font-medium leading-tight'>{product.name}</div>
          <div className='flex items-center gap-1 text-sm text-black/70'>
            {/* Rating is commented out as it's not in the DB */}
            {/* <Star size={16} className='fill-black'/> {product.rating} */}
          </div>
        </div>
        {/* The price is correctly formatted. We'll ensure product.price is a number. */}
        <div className='text-right font-semibold'>${Number(product.price).toFixed(2)}</div>
      </div>
    </div>
  )
}