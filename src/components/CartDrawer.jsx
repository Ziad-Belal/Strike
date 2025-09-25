// src/components/CartDrawer.jsx

import React from 'react'
import { Sheet, Button } from './atoms.jsx'

// Assuming you have a currency helper, otherwise we can use a simple formatter.
// import { currency } from '../utils/helpers.js'
const currency = (value) => `£${Number(value).toFixed(2)}`;
const SHIPPING_COST = 60;


export default function CartDrawer({ open, onClose, items, removeItem, onCheckout }) { // 1. Added onCheckout prop
  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const total = subtotal + (items.length > 0 ? SHIPPING_COST : 0);

  // Use a static placeholder image for cart items
  const placeholderImg = 'https://placehold.co/200x200/EEE/31343C?text=Item';

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
        
        {items.map((it, idx) => (
          <div key={`${it.id}-${it.size}`} className='flex gap-3 rounded-2xl border border-black/10 p-3'> {/* Improved key */}
            <img 
              src={placeholderImg} // 2. Use placeholder image
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
        ))}
      </div>
      
      {/* This checkout block will only show if there are items in the cart */}
      {items.length > 0 && (
        <div className='mt-6 rounded-2xl bg-black/5 p-4'>
          <div className='flex items-center justify-between text-sm'>
            <span>Subtotal</span>
            <span>{currency(subtotal)}</span>
          </div>
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
          <Button onClick={onCheckout} className='mt-4 w-full'>
            Proceed to Checkout
          </Button>
        </div>
      )}
    </Sheet>
  )
}