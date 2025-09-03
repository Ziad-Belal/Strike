// src/pages/AdminPage.jsx

import React, { useState } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';

const ADMIN_PASSWORD = "StrikeSports"; // The secret password

function AdminDashboard() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('Men');
  const [sizes, setSizes] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!imageFile) { toast.error("Please select an image."); return; }
    setIsUploading(true);

    const fileName = `${Date.now()}_${imageFile.name}`;
    const { error: uploadError } = await supabase.storage.from('product_images').upload(fileName, imageFile);
    if (uploadError) { toast.error("Image upload failed: " + uploadError.message); setIsUploading(false); return; }

    const { publicURL } = supabase.storage.from('product_images').getPublicUrl(fileName);

    const available_sizes = sizes.split(',').map(s => s.trim()).filter(Boolean);
    const { error: insertError } = await supabase.from('products').insert([{ name, description, price: parseFloat(price), stock: parseInt(stock), category, image_url: publicURL, available_sizes }]);

    if (insertError) {
      toast.error('Error adding product: ' + insertError.message);
    } else {
      toast.success('Product added successfully!');
      setName(''); setDescription(''); setPrice(''); setStock(''); setCategory('Men'); setSizes(''); setImageFile(null);
    }
    setIsUploading(false);
  };

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <form onSubmit={handleAddProduct} className="p-6 border rounded-lg bg-gray-50 space-y-4">
        <h2 className="text-xl font-semibold">Add New Product</h2>
        <div>
          <label className="block text-sm font-medium">Product Image</label>
          <input type="file" onChange={(e) => setImageFile(e.target.files[0])} accept="image/*" className="w-full p-2 border rounded mt-1" required />
        </div>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Product Name" className="w-full p-2 border rounded" required />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full p-2 border rounded" rows="3"></textarea>
        <div className="grid grid-cols-2 gap-4">
          <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" className="w-full p-2 border rounded" required />
          <input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="Stock" className="w-full p-2 border rounded" required />
        </div>
        <input type="text" value={sizes} onChange={e => setSizes(e.target.value)} placeholder="Sizes (e.g. Small, Medium, Large)" className="w-full p-2 border rounded" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded bg-white" required>
          <option>Men</option><option>Women</option><option>New Arrivals</option><option>Sale</option>
        </select>
        <button type="submit" disabled={isUploading} className="w-full bg-black text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-black/90 disabled:bg-gray-400">
          {isUploading ? 'Uploading...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password.');
    }
  };

  if (isAuthenticated) {
    return <AdminDashboard />;
  }

  return (
    <div className="container max-w-sm mx-auto py-20 text-center">
      <h1 className="text-2xl font-bold">Admin Access</h1>
      <form onSubmit={handleLogin} className="space-y-4 mt-6">
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-3 border rounded-lg" autoFocus />
        <button type="submit" className="w-full bg-black text-white p-3 rounded-lg font-bold">Enter</button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
}