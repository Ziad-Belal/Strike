// src/components/CartDrawer.jsx

import React, { useState } from 'react'
import { Sheet, Button } from './atoms.jsx'
import { supabase } from '../supabase'
import { toast } from 'react-hot-toast'

// Assuming you have a currency helper, otherwise we can use a simple formatter.
// import { currency } from '../utils/helpers.js'
const currency = (value) => `EGP ${Number(value).toFixed(2)}`;
const SHIPPING_COST = 60;


export default function CartDrawer({ open, onClose, items, removeItem, onCheckout }) { // 1. Added onCheckout prop
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const discount = appliedPromo ? (
    appliedPromo.discount_type === 'percentage' 
      ? subtotal * (appliedPromo.discount_value / 100)
      : Math.min(appliedPromo.discount_value, subtotal)
  ) : 0;
  const discountedSubtotal = subtotal - discount;
  const total = discountedSubtotal + (items.length > 0 ? SHIPPING_COST : 0);

  // Use a static placeholder image for cart items
  const placeholderImg = 'https://placehold.co/200x200/EEE/31343C?text=Item';

  // Apply promo code
  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setPromoLoading(true);
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast.error('Invalid promo code');
        return;
      }

      // Check expiration
      if (data.expiration_date && new Date(data.expiration_date) < new Date()) {
        toast.error('This promo code has expired');
        return;
      }

      // Check usage limit
      if (data.max_usages && data.current_usages >= data.max_usages) {
        toast.error('This promo code has reached its usage limit');
        return;
      }

      setAppliedPromo(data);
      toast.success('Promo code applied successfully!');
      setPromoCode('');
    } catch (error) {
      console.error('Error applying promo code:', error);
      toast.error('Error applying promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  // Remove promo code
  const removePromoCode = () => {
    setAppliedPromo(null);
    toast.success('Promo code removed');
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className='flex items-center justify-between relative'>
        <h2 className='text-lg font-semibold'>Your Cart</h2>
        <button
          onClick={onClose}
          className="absolute top-0 right-0 text-gray-500 hover:text-black text-xl"
          aria-label="Close cart"
        >
          ✕
        </button>
      </div>
      <div className='mt-4 flex-1 overflow-y-auto space-y-4'> {/* Added flex-1 and overflow for long carts */}
        {items.length === 0 && <div className='text-center py-10 text-sm text-black/60'>Your cart is empty.</div>}
        
        {items.map((it, idx) => {
          // Get the product image - use first image from image_urls array or fallback to image_url
          const productImage = it.image_urls && it.image_urls.length > 0 
            ? it.image_urls[0] 
            : it.image_url || placeholderImg;
          
          return (
            <div key={`${it.id}-${it.size}`} className='flex gap-3 rounded-2xl border border-black/10 p-3'> {/* Improved key */}
              <img 
                src={productImage}
                alt={it.name} 
                className='h-20 w-20 rounded-xl object-cover'
              />
              <div className='flex-1'>
                <div className='font-medium'>{it.name}</div>
                <div className='text-sm'>EU {it.size} • Qty {it.qty}</div>
              </div>
              <div className='text-right'>
                <div className='font-semibold'>{currency(it.price * it.qty)}</div>
                {/* 3. Updated removeItem to pass the whole item object */}
                <button className='mt-2 text-xs text-black/60 hover:text-black' onClick={() => removeItem(it)}>Remove</button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* This checkout block will only show if there are items in the cart */}
      {items.length > 0 && (
        <div className='mt-6 rounded-2xl bg-black/5 p-4'>
          {/* Promo Code Section */}
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-2'>Promo Code</label>
            {!appliedPromo ? (
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder='Enter promo code'
                  className='flex-1 p-2 border rounded text-sm'
                  onKeyPress={(e) => e.key === 'Enter' && applyPromoCode()}
                />
                <Button 
                  onClick={applyPromoCode} 
                  disabled={promoLoading}
                  className='px-4 py-2 text-sm'
                >
                  {promoLoading ? 'Applying...' : 'Apply'}
                </Button>
              </div>
            ) : (
              <div className='flex items-center justify-between bg-green-50 border border-green-200 rounded p-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-green-600 font-medium'>{appliedPromo.code}</span>
                  <span className='text-sm text-green-600'>
                    {appliedPromo.discount_type === 'percentage' 
                      ? `${appliedPromo.discount_value}% off`
                      : `EGP ${appliedPromo.discount_value} off`
                    }
                  </span>
                </div>
                <button 
                  onClick={removePromoCode}
                  className='text-green-600 hover:text-green-800 text-sm'
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className='flex items-center justify-between text-sm'>
            <span>Subtotal</span>
            <span>{currency(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className='flex items-center justify-between text-sm mt-1 text-green-600'>
              <span>Discount ({appliedPromo.code})</span>
              <span>-{currency(discount)}</span>
            </div>
          )}
          <div className='flex items-center justify-between text-sm mt-1'>
            <span>Shipping</span>
            <span>{currency(SHIPPING_COST)}</span>
          </div>
          <hr className='my-2 border-black/10' />
          <div className='flex items-center justify-between font-semibold'>
            <span>Total</span>
            <span>{currency(total)}</span>
          </div>
          {/* 4. Connected the onCheckout function to the button */}
          <Button onClick={() => onCheckout(appliedPromo)} className='mt-4 w-full'>
            Proceed to Checkout
          </Button>
        </div>
      )}
    </Sheet>
  )
}