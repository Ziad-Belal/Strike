// src/components/ProductCard.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  if (!product) {
    return null;
  }

  return (
    <div 
      className='group cursor-pointer transition-all duration-300 hover:-translate-y-2' 
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className='relative overflow-hidden rounded-3xl bg-gray-100 shadow-sm group-hover:shadow-xl transition-shadow duration-300'>
        <img 
          src={product.image_url || 'https://placehold.co/600x400'} 
          alt={product.name} 
          className='aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-110'
        />
        {product.stock <= 0 && (
          <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
            <span className='bg-white text-black px-4 py-2 rounded-full font-bold text-sm shadow-lg'>
              Out of Stock
            </span>
          </div>
        )}
        <button className='absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-sm'>
          <Heart className='w-5 h-5 text-gray-700' />
        </button>
      </div>
      
      <div className='mt-4 flex items-start justify-between gap-4'>
        <div className='flex-1'>
          <div className='text-xs text-gray-500 uppercase tracking-wider mb-1'>{product.category}</div>
          <div className='font-semibold leading-tight text-gray-900 group-hover:text-black transition-colors'>{product.name}</div>
        </div>
        
        <div className='text-right font-bold text-gray-900'>
          {Number(product.price).toFixed(2)} EGP
        </div>
      </div>
      <div className={`mt-2 text-xs ${product.stock > 0 && product.stock < 10 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
        {product.stock > 0 ? `${product.stock} left in stock` : 'Currently unavailable'}
      </div>
    </div>
  );
}