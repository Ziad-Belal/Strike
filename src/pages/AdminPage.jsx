import React, { useState } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';

const ADMIN_PASSWORD = "StrikeSports";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  // Product form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sizes, setSizes] = useState('');
  const [category, setCategory] = useState('Men');
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Password form
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      toast.error('Incorrect password.');
    }
  };

  // Product form
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!imageFile) { toast.error("Please select an image."); return; }
    setIsUploading(true);

    // Upload image to Supabase Storage
    const fileName = `${Date.now()}_${imageFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage.from('product_images')
      .upload(fileName, imageFile);
    if (uploadError) { toast.error("Image upload failed: " + uploadError.message); setIsUploading(false); return; }

    // Get public URL
    const { data: urlData } = supabase
      .storage.from('product_images')
      .getPublicUrl(fileName);
    const image_url = urlData.publicUrl;

    // Prepare sizes array
    const available_sizes = sizes.split(',').map(s => s.trim()).filter(Boolean);

    // Insert product into DB
    const { error: insertError } = await supabase.from('products').insert([{
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      image_url, // <-- This should be the public URL
      available_sizes,
    }]);

    if (insertError) {
      toast.error('Error adding product: ' + insertError.message);
    } else {
      toast.success('Product added successfully!');
      setName(''); setDescription(''); setPrice(''); setStock(''); setCategory('Men'); setSizes(''); setImageFile(null);
      e.target.reset();
    }
    setIsUploading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="container max-w-sm mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold">Admin Access</h1>
        <form onSubmit={handleLogin} className="space-y-4 mt-6">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border" autoFocus />
          <button type="submit" className="w-full bg-black text-white p-3 font-bold">Enter</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <form onSubmit={handleAddProduct} className="p-6 border rounded-lg bg-gray-50 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded" rows="3"></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price ($)</label>
          <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sizes (comma separated)</label>
          <input type="text" value={sizes} onChange={e => setSizes(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. 40,41,42,43" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded bg-white" required>
            <option>Men</option>
            <option>Women</option>
            <option>New Arrivals</option>
            <option>Sale</option>
            <option>Kids</option>
            <option>Lifestyle</option>
            <option>Training</option>
            <option>Basketball</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Product Image</label>
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full p-2 border rounded" required />
        </div>
        <button type="submit" className="bg-black text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-black/90" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}