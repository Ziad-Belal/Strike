// src/pages/ProductPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { Input, Button } from '../components/atoms.jsx';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const currency = (value) => `$${Number(value).toFixed(2)}`;

export default function ProductPage({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    supabase.from('products').select('*').eq('id', id).single()
      .then(({ data }) => {
        setProduct(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="container text-center py-10">Loading...</div>;
  if (!product) return <div className="container text-center py-10">Product not found.</div>;

  // Get all product images (support both old single image and new multiple images)
  const productImages = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls 
    : [product.image_url].filter(Boolean);

  const hasSizes = product.available_sizes && product.available_sizes.length > 0;
  
  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) {
      toast.error('Please select a size first.');
      return;
    }
    addToCart(product, selectedSize, qty);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  return (
    <div className='container py-10'>
      <div className='grid gap-8 md:grid-cols-2'>
        {/* Image Gallery */}
        <div className="flex flex-col">
          {/* Main Image */}
          <div className="relative mb-4">
            <img 
              src={productImages[selectedImageIndex] || 'https://placehold.co/800x600'} 
              alt={`${product.name} ${selectedImageIndex + 1}`} 
              className='w-full rounded-3xl object-cover aspect-[3/2] max-h-[600px]' 
            />
            
            {/* Navigation arrows (only show if more than 1 image) */}
            {productImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                {/* Image counter */}
                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {productImages.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail Gallery (only show if more than 1 image) */}
          {productImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2 md:grid-cols-5">
              {productImages.map((imageUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative rounded-lg overflow-hidden aspect-square ${
                    selectedImageIndex === index 
                      ? 'ring-2 ring-black ring-offset-2' 
                      : 'opacity-70 hover:opacity-100'
                  } transition-all`}
                >
                  <img 
                    src={imageUrl} 
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <div className='text-sm text-black/60'>{product.category.toUpperCase()}</div>
          <h1 className='mt-1 text-2xl font-bold'>{product.name}</h1>
          <div className='mt-4 text-2xl font-semibold'>{currency(product.price)}</div>

          {hasSizes && (
            <div className='mt-6'>
              <div className='mb-2 text-sm font-semibold'>Select Size</div>
              <div className='flex flex-wrap gap-2'>
                {product.available_sizes.map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSelectedSize(s)} 
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      selectedSize===s
                        ? 'border-black bg-black text-white'
                        : 'border-black/10 hover:bg-black/5'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className='mt-4 flex items-center gap-2'>
            <label className='text-sm'>Qty</label>
            <Input 
              type='number' 
              min={1} 
              value={qty} 
              onChange={(e)=> setQty(Math.max(1, Number(e.target.value)))} 
              className='w-20'
            />
          </div>

          <div className='mt-6 flex gap-3'>
            <Button size='lg' onClick={handleAddToCart} className='gap-2 flex-1'>
              <ShoppingCart size={18}/> Add to Cart
            </Button>
          </div>

          <div className='mt-8 space-y-3 text-sm text-black/70'>
            <div>{product.description}</div>
          </div>
        </div>
      </div>
    </div>
  );
}