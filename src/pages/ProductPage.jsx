// src/pages/ProductPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { Input, Button } from '../components/atoms.jsx';
import { ShoppingCart } from 'lucide-react';
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

  return (
    <div className='container py-10'>
      <div className='grid gap-8 md:grid-cols-2'>
        <div>
          {/* --- THIS IS THE CORRECTED LINE --- */}
          <img src={product.image_url || 'https://placehold.co/800x600'} alt={product.name} className='w-full rounded-3xl object-cover aspect-square'/>
        </div>
        <div>
          <div className='text-sm text-gray-500'>{product.category}</div>
          <h1 className='text-3xl font-bold'>{product.name}</h1>
          <div className='text-2xl font-semibold mt-2'>{currency(product.price)}</div>
          
          {hasSizes && (
            <div className='mt-6'>
              <div className='text-sm font-medium mb-2'>Select Size</div>
              <div className='flex flex-wrap gap-2'>
                {product.available_sizes.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)} className={`px-4 py-2 border rounded-full text-sm ${selectedSize === s ? 'bg-black text-white' : 'bg-white'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className='mt-6 flex items-center gap-4'>
            <Input type="number" value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value)))} className="w-20" />
            <Button size="lg" onClick={() => addToCart(product, selectedSize, qty)} className="flex-1 gap-2">
              <ShoppingCart size={18}/> Add to Cart
            </Button>
          </div>
          <div className='mt-6 text-gray-700 text-sm'>
            {product.description}
          </div>
        </div>
      </div>
    </div>
  );
}