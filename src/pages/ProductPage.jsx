import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { Input, Button } from '../components/atoms.jsx';
import { ShoppingCart } from 'lucide-react';

const currency = (value) => `$${Number(value).toFixed(2)}`;

export default function ProductPage({ addToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  // ... other states

  useEffect(() => {
    supabase.from('products').select('*').eq('id', id).single()
      .then(({ data }) => {
        setProduct(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="container text-center py-10">Loading...</div>;
  if (!product) return <div className="container text-center py-10">Product not found.</div>;
  
  return (
    <div className='container py-10'>
      <div className='grid gap-8 md:grid-cols-2'>
        <div className="flex flex-col items-center">
          <img src={product.image_data || 'https://placehold.co/800x600'} alt={product.name} className='w-full rounded-3xl object-cover aspect-[3/2] max-h-[600px]' />
        </div>
        <div>
          {/* ... The rest of your product page is correct ... */}
        </div>
      </div>
    </div>
  );
}