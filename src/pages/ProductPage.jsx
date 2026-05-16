// src/pages/ProductPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { Input, Button } from '../components/atoms.jsx';
import { ShoppingCart, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const currency = (value) => `EGP ${Number(value).toFixed(2)}`;

// Simple Image Modal Component
function ImageModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Full screen product view" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white/80 hover:bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg transition-all"
        >
          <X className="w-6 h-6 text-black" />
        </button>
      </div>
    </div>
  );
}


export default function ProductPage({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState(null);

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
    if (product.stock <= 0) {
      toast.error('This product is out of stock!');
      return;
    }
    if (qty > product.stock) {
      toast.error(`Only ${product.stock} items available in stock!`);
      return;
    }
    addToCart(product, selectedSize, qty);
  };

  const nextImage = (e) => {
    e.stopPropagation(); // prevent modal from opening
    setSelectedImageIndex((prev) =>
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e.stopPropagation(); // prevent modal from opening
    setSelectedImageIndex((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const openModal = (imageUrl) => {
    setModalImageUrl(imageUrl);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setModalImageUrl(null);
  };

  return (
    <div className='container py-16'>
      <div className='grid gap-12 md:grid-cols-2 items-start'>
        {/* Image Gallery */}
        <div className="flex flex-col">
          {/* Main Image */}
          <div className="relative mb-6 rounded-3xl overflow-hidden shadow-xl">
            <img 
              src={productImages[selectedImageIndex] || 'https://placehold.co/800x600'} 
              alt={`${product.name} ${selectedImageIndex + 1}`} 
              className='w-full rounded-3xl object-cover aspect-[4/3] max-h-[700px] cursor-pointer hover:opacity-95 transition-opacity' 
              onClick={() => openModal(productImages[selectedImageIndex])}
            />
            
            {/* Navigation arrows (only show if more than 1 image) */}
            {productImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-3 shadow-xl transition-all hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-3 shadow-xl transition-all hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                {/* Image counter */}
                <div className="absolute bottom-6 right-6 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  {selectedImageIndex + 1} / {productImages.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-4 gap-3 md:grid-cols-6">
            {productImages.map((imageUrl, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative rounded-xl overflow-hidden aspect-square ${
                  selectedImageIndex === index 
                    ? 'ring-2 ring-black ring-offset-4 shadow-lg' 
                    : 'opacity-70 hover:opacity-100 hover:shadow-md'
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
          
          {/* Size Chart Display */}
          {product.size_chart_url && (
            <div className="mt-8">
              <button
                onClick={() => openModal(product.size_chart_url)}
                className="relative w-full max-w-48 mx-auto rounded-xl overflow-hidden border-2 border-blue-500/30 hover:border-blue-500/60 transition-all shadow-md hover:shadow-lg"
              >
                <img
                  src={product.size_chart_url}
                  alt="Size chart"
                  className="w-full h-auto object-contain"
                />
                <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                  <div className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-bold shadow">
                    View Size Chart
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-8">
          <div>
            <div className='text-sm text-gray-500 uppercase tracking-widest mb-2'>{product.category.toUpperCase()}</div>
            <h1 className='mt-1 text-4xl font-extrabold text-gray-900 leading-tight'>{product.name}</h1>
            <div className='mt-4 text-3xl font-bold text-gray-900'>{currency(product.price)}</div>
          </div>

          {hasSizes && (
            <div className='space-y-4'>
              <div className='text-sm font-bold text-gray-900'>Select Size</div>
              <div className='flex flex-wrap gap-3'>
                {product.available_sizes.map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSelectedSize(s)} 
                    className={`rounded-xl border-2 px-5 py-3 text-base font-semibold transition-all ${
                      selectedSize===s
                        ? 'border-black bg-black text-white shadow-lg'
                        : 'border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className='flex items-center gap-4'>
            <div className="flex items-center gap-3">
              <label className='text-sm font-semibold text-gray-700'>Quantity</label>
              <Input 
                type='number' 
                min={1} 
                max={product.stock}
                value={qty} 
                onChange={(e)=> setQty(Math.max(1, Math.min(product.stock, Number(e.target.value))))} 
                className='w-24 text-center'
              />
            </div>
            <span className={`text-sm font-semibold ${product.stock <= 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {product.stock <= 0 ? 'Out of stock' : `In stock: ${product.stock}`}
            </span>
          </div>

          <div className='flex gap-4'>
            <Button 
              size='lg' 
              onClick={handleAddToCart} 
              className='gap-3 flex-1 text-base py-4 shadow-xl hover:shadow-2xl transition-shadow'
              disabled={product.stock <= 0}
            >
              <ShoppingCart size={20}/> {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>

          <div className='space-y-4 pt-6 border-t border-gray-100'>
            <div className='text-base text-gray-700 leading-relaxed'>{product.description}</div>
          </div>
        </div>
      </div>
      
      {isModalOpen && <ImageModal 
        imageUrl={modalImageUrl}
        onClose={closeModal} 
      />}
    </div>
  );
}
