import React from 'react'

const SIZES = ['40', '41', '42', '43', '44', '45', 'Medium', 'Large', 'XL', 'XXL'];

export default function Filters({ filters, onFilterChange }) {
  const { size } = filters || {};

  const handleSizeChange = (selectedSize) => {
    onFilterChange({
      ...filters,
      size: selectedSize === size ? null : selectedSize
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <div className='space-y-6'>
      <div>
        <div className='mb-2 text-sm font-semibold'>Size</div>
        <div className='flex flex-wrap gap-2'>
          {SIZES.map(s => (
            <button key={s} onClick={() => handleSizeChange(s)} className={`rounded-xl border px-3 py-2 text-sm ${size === s ? 'border-black bg-black text-white' : 'border-black/10 hover:bg-black/5'}`}>{s}</button>
          ))}
        </div>
      </div>
      <button className='text-sm underline' onClick={clearFilters}>Clear filters</button>
    </div>
  )
}