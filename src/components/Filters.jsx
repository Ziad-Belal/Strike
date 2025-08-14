import React from 'react'

export default function Filters({ size, setSize, color, setColor }) {
  return (
    <div className='space-y-6'>
      <div>
        <div className='mb-2 text-sm font-semibold'>Size (EU)</div>
        <div className='flex flex-wrap gap-2'>
          {[28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46].map(s => (
            <button key={s} onClick={() => setSize(s === size ? null : s)} className={`rounded-xl border px-3 py-2 text-sm ${size===s? 'border-black bg-black text-white':'border-black/10 hover:bg-black/5'}`}>{s}</button>
          ))}
        </div>
      </div>
      <div>
        <div className='mb-2 text-sm font-semibold'>Color</div>
        <div className='flex flex-wrap gap-2'>
          {["Black","White","Grey","Blue","Green","Pink","Beige","Navy"].map(c => (
            <button key={c} onClick={() => setColor(c === color ? null : c)} className={`rounded-xl border px-3 py-2 text-sm ${color===c? 'border-black bg-black text-white':'border-black/10 hover:bg-black/5'}`}>{c}</button>
          ))}
        </div>
      </div>
      <button className='text-sm underline' onClick={() => { setSize(null); setColor(null); }}>Clear filters</button>
    </div>
  )
}
