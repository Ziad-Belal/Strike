import React from 'react'

// --- MODIFICATION: Define the new lists of sizes and colors at the top for easy editing ---
const SIZES = ['Medium', 'Large', 'XL', 'XXL'];
const COLORS = ['Black', 'Grey', 'White'];

export default function Filters({ size, setSize, color, setColor }) {
  return (
    <div className='space-y-6'>
      <div>
        {/* --- MODIFICATION: Changed the section title from "Size (EU)" to just "Size" --- */}
        <div className='mb-2 text-sm font-semibold'>Size</div>
        <div className='flex flex-wrap gap-2'>
          {/* --- MODIFICATION: Now uses the new SIZES array --- */}
          {SIZES.map(s => (
            <button key={s} onClick={() => setSize(s === size ? null : s)} className={`rounded-xl border px-3 py-2 text-sm ${size===s? 'border-black bg-black text-white':'border-black/10 hover:bg-black/5'}`}>{s}</button>
          ))}
        </div>
      </div>
      <div>
        <div className='mb-2 text-sm font-semibold'>Color</div>
        <div className='flex flex-wrap gap-2'>
          {/* --- MODIFICATION: Now uses the new COLORS array --- */}
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c === color ? null : c)} className={`rounded-xl border px-3 py-2 text-sm ${color===c? 'border-black bg-black text-white':'border-black/10 hover:bg-black/5'}`}>{c}</button>
          ))}
        </div>
      </div>
      <button className='text-sm underline' onClick={() => { setSize(null); setColor(null); }}>Clear filters</button>
    </div>
  )
}