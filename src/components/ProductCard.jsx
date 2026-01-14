// src/components/ProductCard.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  // This is a safety check. If for some reason the product data is missing, we render nothing.
  if (!product) {
    return null;
  }

  // --- THIS IS THE NEW, CLEANER DESIGN ---
  // The entire card is now a single, clickable link to the product page.
  return (
    <div 
      className='group cursor-pointer' 
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Image Container */}
      <div className='relative overflow-hidden rounded-3xl bg-gray-200'>
        <img 
          src={product.image_url || 'https://placehold.co/600x400'} 
          alt={product.name} 
          className='aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105'
        />
    
      </div>
      
      {/* Text Container */}
      <div className='mt-3 flex items-start justify-between gap-4'>
        {/* Product Name and Category */}
        <div>
          <div className='text-sm text-gray-500'>{product.category}</div>
          <div className='font-semibold leading-tight'>{product.name}</div>
        </div>
        
        {/* Price */}
        <div className='text-right font-bold'>
          {Number(product.price).toFixed(2)} EGP
        </div>
      </div>
      {/* Stock Info */}
      <div className={`mt-2 text-sm ${product.stock > 0 && product.stock < 10 ? 'text-red-600' : 'text-gray-600'}`}>
        {product.stock > 0 ? `${product.stock} left in stock` : 'Out of stock'}
      </div>
    </div>
  );
}