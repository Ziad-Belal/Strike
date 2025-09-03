// src/components/ProductCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  if (!product) return null;

  return (
    <div className='group cursor-pointer' onClick={() => navigate(`/product/${product.id}`)}>
      <div className='relative overflow-hidden rounded-3xl bg-gray-200'>
        {/* --- THIS IS THE CORRECTED LINE --- */}
        <img src={product.image_url || 'https://placehold.co/600x400'} alt={product.name} className='aspect-[4/3] w-full object-cover'/>
        <button className='absolute right-3 top-3 rounded-full bg-white/90 p-2'>
          <Heart size={18} />
        </button>
      </div>
      <div className='mt-3'>
        <div className='font-medium'>{product.name}</div>
        <div className='font-semibold'>${Number(product.price).toFixed(2)}</div>
      </div>
    </div>
  );
}