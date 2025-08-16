import React from 'react'
import { Sheet, Button } from './atoms.jsx'
import { currency } from '../utils/helpers.js'

export default function CartDrawer({ open, onClose, items, removeItem }) {
  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0)
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
      <div className='mt-4 space-y-4'>
        {items.length === 0 && <div className='text-sm text-black/60'>Your cart is empty.</div>}
        {items.map((it, idx) => (
          <div key={idx} className='flex gap-3 rounded-2xl border border-black/10 p-3'>
            <img src={it.img} alt={it.name} className='h-20 w-20 rounded-xl object-cover'/>
            <div className='flex-1'>
              <div className='font-medium'>{it.name}</div>
              <div className='text-sm'>EU {it.size} • Qty {it.qty}</div>
            </div>
            <div className='text-right'>
              <div className='font-semibold'>{currency(it.price * it.qty)}</div>
              <button className='mt-2 text-xs text-black/60 hover:text-black' onClick={() => removeItem(idx)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
      <div className='mt-6 rounded-2xl bg-black/5 p-4'>
        <div className='flex items-center justify-between text-sm'><span>Subtotal</span><span>{currency(total)}</span></div>
        <div className='mt-2 text-xs text-black/60'>Taxes and shipping calculated at checkout.</div>
        <Button className='mt-4 w-full'>Checkout</Button>
      </div>
    </Sheet>
  )
}
