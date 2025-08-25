// src/pages/AdminDashboard.jsx

import React, { useState } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('Men'); // Default category
  const [imageUrl, setImageUrl] = useState('');

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !price || !stock || !category) {
      toast.error('Please fill out all required fields.');
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{ 
        name, 
        description, 
        price: parseFloat(price), 
        stock: parseInt(stock), 
        category,
        image_url: imageUrl
      }]);

    if (error) {
      toast.error('Error adding product: ' + error.message);
      console.error(error);
    } else {
      toast.success('Product added successfully!');
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setCategory('Men');
      setImageUrl('');
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="p-6 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Add a New Product</h2>
        <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded mt-1" required />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded mt-1" rows="3"></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Price ($)</label>
            <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 border rounded mt-1" required />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <input type="number" value={stock} onChange={e => setStock(e.targe.value)} className="w-full p-2 border rounded mt-1" required />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full p-2 border rounded mt-1" placeholder="https://placehold.co/..." />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded mt-1 bg-white" required>
              <option>Men</option>
              <option>Women</option>
              <option>New Arrivals</option>
              <option>Sale</option>
            </select>
          </div>
          
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="bg-black text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-black/90">
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}