// src/pages/ProductPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { Input, Button } from '../components/atoms.jsx';
import { ShoppingCart } from 'lucide-react'; // Removed Heart
import { toast } from 'react-hot-toast';

const currency = (value) => `$${Number(value).toFixed(2)}`;

export default function ProductPage({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) {
        console.error("Error fetching product:", error);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="container text-center py-10">Loading...</div>;
  if (!product) return <div className="container text-center py-10">Product not found.</div>;

  const hasSizes = product.available_sizes && product.available_sizes.length > 0;

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) {
      toast.error('Please select a size first.');
      return;
    }
    addToCart(product, selectedSize, qty);
  };

  return (
    <div className='container py-10'>
      {/*original design اللي كان موجود اصلا */}
      <div className='grid gap-8 md:grid-cols-2'>
        <div className="flex flex-col items-center">
          <img src={product.image_url || 'https://placehold.co/800x600'} alt={product.name} className='w-full rounded-3xl object-cover aspect-[3/2] max-h-[600px]' />
        </div>
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
                    className={`rounded-xl border px-3 py-2 text-sm ${selectedSize===s? 'border-black bg-black text-white':'border-black/10 hover:bg-black/5'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className='mt-4 flex items-center gap-2'>
            <label className='text-sm'>Qty</label>
            <Input type='number' min={1} value={qty} onChange={(e)=> setQty(Math.max(1, Number(e.target.value)))} className='w-20'/>
          </div>

          <div className='mt-6 flex gap-3'>
            <Button size='lg' onClick={handleAddToCart} className='gap-2 flex-1'> {/* Added flex-1 to make it fill space */}
              <ShoppingCart size={18}/> Add to Cart
            </Button>
            {/*مفيش wishlist */}
          </div>

          <div className='mt-8 space-y-3 text-sm text-black/70'>
            <div>{product.description}</div>
          </div>
        </div>
      </div>
    </div>
  );
}