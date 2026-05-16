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
      <div className='flex items-center justify-between relative mb-6'>
        <h2 className='text-2xl font-bold text-gray-900'>Your Cart</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close cart"
        >
          ✕
        </button>
      </div>
      <div className='mt-4 flex-1 overflow-y-auto space-y-4'>
        {items.length === 0 && (
          <div className='text-center py-16 space-y-4'>
            <div className='text-6xl'>🛒</div>
            <div className='text-lg text-gray-600'>Your cart is empty.</div>
            <button 
              onClick={onClose} 
              className='text-sm text-black font-semibold underline underline-offset-4 hover:no-underline'
            >
              Continue shopping
            </button>
          </div>
        )}
        
        {items.map((it, idx) => {
          const productImage = it.image_urls && it.image_urls.length > 0 
            ? it.image_urls[0] 
            : it.image_url || placeholderImg;
          
          return (
            <div 
              key={`${it.id}-${it.size}`} 
              className='flex gap-4 rounded-2xl border border-gray-100 p-4 bg-white shadow-sm hover:shadow-md transition-shadow'
            >
              <img 
                src={productImage}
                alt={it.name} 
                className='h-24 w-24 rounded-xl object-cover'
              />
              <div className='flex-1'>
                <div className='font-semibold text-gray-900'>{it.name || 'Product'}</div>
                <div className='text-sm text-gray-500 mt-1'>{it.size ? `Size: ${it.size} • ` : ''}Qty: {it.qty}</div>
                <div className='text-sm font-bold text-gray-900 mt-2'>{currency(it.price * it.qty)}</div>
              </div>
              <button 
                className='text-gray-400 hover:text-red-500 transition-colors'
                onClick={() => removeItem(it)}
                title="Remove item"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
      
      {items.length > 0 && (
        <div className='mt-8 rounded-2xl bg-gray-50 p-6 shadow-inner'>
          <div className='mb-6'>
            <label className='block text-sm font-bold text-gray-900 mb-3'>Promo Code</label>
            {!appliedPromo ? (
              <div className='flex gap-3'>
                <input
                  type='text'
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder='Enter promo code'
                  className='flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all'
                  onKeyPress={(e) => e.key === 'Enter' && applyPromoCode()}
                />
                <Button 
                  onClick={applyPromoCode} 
                  disabled={promoLoading}
                  className='px-6 py-3'
                >
                  {promoLoading ? 'Applying...' : 'Apply'}
                </Button>
              </div>
            ) : (
              <div className='flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-4'>
                <div className='flex items-center gap-3'>
                  <span className='text-green-700 font-bold'>{appliedPromo.code}</span>
                  <span className='text-sm text-green-700'>
                    {appliedPromo.discount_type === 'percentage' 
                      ? `${appliedPromo.discount_value}% off`
                      : `EGP ${appliedPromo.discount_value} off`
                    }
                  </span>
                </div>
                <button 
                  onClick={removePromoCode}
                  className='text-green-700 hover:text-green-900 text-sm font-semibold'
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className='space-y-3'>
            <div className='flex items-center justify-between text-gray-700'>
              <span>Subtotal</span>
              <span className='font-semibold'>{currency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className='flex items-center justify-between text-green-700 font-semibold'>
                <span>Discount ({appliedPromo.code})</span>
                <span>-{currency(discount)}</span>
              </div>
            )}
            <div className='flex items-center justify-between text-gray-700'>
              <span>Shipping</span>
              <span className='font-semibold'>{currency(SHIPPING_COST)}</span>
            </div>
            <div className='border-t border-gray-200 my-3'></div>
            <div className='flex items-center justify-between text-xl font-bold text-gray-900'>
              <span>Total</span>
              <span>{currency(total)}</span>
            </div>
          </div>
          <Button 
            onClick={() => onCheckout(appliedPromo)} 
            className='mt-8 w-full text-base py-4 shadow-xl hover:shadow-2xl transition-shadow'
          >
            Proceed to Checkout
          </Button>
        </div>
      )}
    </Sheet>
  )
}