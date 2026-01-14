import React from 'react'

// --- MODIFICATION: Define the new lists of sizes and colors at the top for easy editing ---
// Note: These sizes should match the actual sizes used in products (like shoe sizes: 40, 41, 42, etc.)
const SIZES = ['40', '41', '42', '43', '44', '45', 'Medium', 'Large', 'XL', 'XXL'];
const COLORS = ['Black', 'Grey', 'White', 'Red', 'Blue', 'Green'];

export default function Filters({ filters, onFilterChange }) {
  const { size, color } = filters || {};

  const handleSizeChange = (selectedSize) => {
    onFilterChange({
      ...filters,
      size: selectedSize === size ? null : selectedSize
    });
  };

  const handleColorChange = (selectedColor) => {
    onFilterChange({
      ...filters,
      color: selectedColor === color ? null : selectedColor
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <div className='space-y-6'>
      <div>
        {/* --- MODIFICATION: Changed the section title from "Size (EU)" to just "Size" --- */}
        <div className='mb-2 text-sm font-semibold'>Size</div>
        <div className='flex flex-wrap gap-2'>
          {/* --- MODIFICATION: Now uses the updated SIZES array with actual shoe sizes --- */}
          {SIZES.map(s => (
            <button key={s} onClick={() => handleSizeChange(s)} className={`rounded-xl border px-3 py-2 text-sm ${size===s? 'border-black bg-black text-white':'border-black/10 hover:bg-black/5'}`}>{s}</button>
          ))}
        </div>
      </div>
      <div>
        <div className='mb-2 text-sm font-semibold'>Color</div>
        <div className='flex flex-wrap gap-2'>
          {/* --- MODIFICATION: Now uses the updated COLORS array --- */}
          {COLORS.map(c => (
            <button key={c} onClick={() => handleColorChange(c)} className={`rounded-xl border px-3 py-2 text-sm ${color===c? 'border-black bg-black text-white':'border-black/10 hover:bg-black/5'}`}>{c}</button>
          ))}
        </div>
      </div>
      <button className='text-sm underline' onClick={clearFilters}>Clear filters</button>
    </div>
  )
}