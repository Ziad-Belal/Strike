// src/components/ProductCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-hot-toast';
import { supabase } from '../supabase';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const user = supabase.auth.user();

  if (!product) return null;
  const isWishlisted = wishlist.includes(product.id);

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (!user) { toast.error("Please log in to use the wishlist."); return; }
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast.success("Removed from wishlist!");
    } else {
      addToWishlist(product.id);
      toast.success("Added to wishlist!");
    }
  };

  return (
    <div className='group cursor-pointer' onClick={() => navigate(`/product/${product.id}`)}>
      <div className='relative overflow-hidden rounded-3xl bg-gray-200'>
        {/* --- THIS IS THE CORRECTED LINE --- */}
        <img src={product.image_url || 'https://placehold.co/600x400'} alt={product.name} className='aspect-[4/3] w-full object-cover'/>
        <button onClick={handleWishlistToggle} className='absolute right-3 top-3 rounded-full bg-white/90 p-2'>
          <Heart size={18} className={`transition-colors ${isWishlisted ? 'fill-red-500 stroke-red-500' : 'fill-transparent stroke-current'}`} />
        </button>
      </div>
      <div className='mt-3'>
        <div className='font-medium'>{product.name}</div>
        <div className='font-semibold'>${Number(product.price).toFixed(2)}</div>
      </div>
    </div>
  );
}