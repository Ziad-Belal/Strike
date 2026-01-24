import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';
import { Trash2, Plus, Package, Upload, X, Image as ImageIcon, Edit, RotateCcw } from 'lucide-react';

const ADMIN_PASSWORD = "StrikeSports";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('add');

  // Product form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sizes, setSizes] = useState('');
  const [color, setColor] = useState(''); // NEW: Color state
  const [category, setCategory] = useState('men');
  const [imageFiles, setImageFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Product management states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingDetails, setEditingDetails] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);

  // Promo code states
  const [promoCode, setPromoCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [maxUsages, setMaxUsages] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  // Password form
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      fetchProducts();
    } else {
      toast.error('Incorrect password.');
    }
  };

  // Fetch all products
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      // Removed: .eq('is_deleted', false)
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  // Upload multiple images
  const uploadImages = async (files) => {
    const uploadPromises = files.map(async (file) => {
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('product_images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('product_images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  // Handle multiple file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
  };

  // Add product with multiple images
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      toast.error("Please select at least one image.");
      return;
    }

    setIsUploading(true);

    try {
      // Upload all images
      const imageUrls = await uploadImages(imageFiles);

      // Prepare sizes array
      const available_sizes = sizes.split(',').map(s => s.trim()).filter(Boolean);

      // Insert product into DB with multiple images and color
      const { error: insertError } = await supabase.from('products').insert([{
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        color,
        image_url: imageUrls[0],
        image_urls: imageUrls,
        available_sizes,
        // Removed: is_deleted: false
      }]);

      if (insertError) {
        toast.error('Error adding product: ' + insertError.message);
      } else {
        toast.success('Product added successfully!');
        // Reset form
        setName('');
        setDescription('');
        setPrice('');
        setStock('');
        setCategory('men');
        setColor('');
        setSizes('');
        setImageFiles([]);
        e.target.reset();
        fetchProducts();
      }
    } catch (error) {
      toast.error('Error uploading images: ' + error.message);
    }

    setIsUploading(false);
  };

  // Soft delete product
  const handleDeleteProduct = async (productId, productName) => {
    if (!confirm(`Are you sure you want to remove "${productName}" from the store?`)) {
      return;
    }

    // Validate productId
    if (!productId) {
      toast.error('Invalid product ID');
      console.error('Product ID is missing:', productId);
      return;
    }

    try {
      // First, check if the product exists and get its current state
      const { data: productData, error: fetchError } = await supabase
        .from('products')
        .select('id, is_deleted')
        .eq('id', productId)
        .single();

      if (fetchError) {
        console.error('Error fetching product:', fetchError);
        toast.error(`Failed to find product: ${fetchError.message}`);
        return;
      }

      if (!productData) {
        toast.error('Product not found');
        return;
      }

      // Check if already deleted
      if (productData.is_deleted === true) {
        toast.error('Product is already deleted');
        fetchProducts(); // Refresh to update UI
        return;
      }

      // Instead of deleting, mark as deleted
      const { data, error } = await supabase
        .from('products')
        .update({ is_deleted: true })
        .eq('id', productId)
        .select();

      if (error) {
        console.error('Error removing product:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Provide more specific error messages
        if (error.code === 'PGRST116') {
          toast.error('Product not found or you do not have permission to delete it');
        } else if (error.message?.includes('permission') || error.message?.includes('policy')) {
          toast.error('Permission denied. Check your database policies.');
        } else if (error.message?.includes('column') && error.message?.includes('is_deleted')) {
          toast.error('Database error: is_deleted column may not exist. Please add it to your products table.');
        } else {
          toast.error(`Failed to remove product: ${error.message || 'Unknown error'}`);
        }
      } else {
        // Verify the update worked
        if (data && data.length > 0) {
          toast.success(`"${productName}" has been removed from store`);
          fetchProducts(); // Refresh the list
        } else {
          toast.error('Product update returned no data. The product may not exist.');
          fetchProducts(); // Refresh anyway
        }
      }
    } catch (err) {
      console.error('Unexpected error during deletion:', err);
      toast.error(`Unexpected error: ${err.message || 'Please try again'}`);
    }
  };

  // Restore deleted product
  const handleRestoreProduct = async (productId, productName) => {
    if (!confirm(`Are you sure you want to restore "${productName}"?`)) {
      return;
    }

    if (!productId) {
      toast.error('Invalid product ID');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .update({ is_deleted: false })
        .eq('id', productId)
        .select();

      if (error) {
        console.error('Error restoring product:', error);
        toast.error(`Failed to restore product: ${error.message || 'Unknown error'}`);
      } else {
        if (data && data.length > 0) {
          toast.success(`"${productName}" has been restored`);
          fetchProducts(); // Refresh the list
        } else {
          toast.error('Product restore returned no data');
          fetchProducts();
        }
      }
    } catch (err) {
      console.error('Unexpected error during restore:', err);
      toast.error(`Unexpected error: ${err.message || 'Please try again'}`);
    }
  };

  // Update product details
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    const product = editingDetails;

    const available_sizes = product.sizes.split(',').map(s => s.trim()).filter(Boolean);

    const { error } = await supabase
      .from('products')
      .update({
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        stock: parseInt(product.stock),
        category: product.category,
        color: product.color,
        available_sizes,
      })
      .eq('id', product.id);

    if (error) {
      toast.error('Error updating product: ' + error.message);
    } else {
      toast.success('Product updated successfully!');
      setEditingDetails(null);
      fetchProducts();
    }
  };

  // Add image to existing product
  const handleAddImageToProduct = async (productId, file) => {
    try {
      const [newImageUrl] = await uploadImages([file]);

      // Get current product data
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('image_urls, image_url')
        .eq('id', productId)
        .single();

      if (fetchError) throw fetchError;

      // Add new image to existing array
      const currentImages = product.image_urls || [product.image_url].filter(Boolean);
      const updatedImages = [...currentImages, newImageUrl];

      // Update product with new image array
      const { error: updateError } = await supabase
        .from('products')
        .update({
          image_urls: updatedImages,
          image_url: updatedImages[0] // Update main image if needed
        })
        .eq('id', productId);

      if (updateError) throw updateError;

      toast.success('Image added successfully!');
      fetchProducts();
      setEditingProduct(null);
    } catch (error) {
      toast.error('Failed to add image: ' + error.message);
    }
  };

  // Remove image from existing product
  const handleRemoveImageFromProduct = async (productId, imageUrl) => {
    if (!confirm('Are you sure you want to remove this image?')) return;

    try {
      // Get current product data
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('image_urls')
        .eq('id', productId)
        .single();

      if (fetchError) throw fetchError;

      // Remove image from array
      const updatedImages = (product.image_urls || []).filter(url => url !== imageUrl);

      if (updatedImages.length === 0) {
        toast.error('Cannot remove the last image. Product must have at least one image.');
        return;
      }

      // Update product with new image array
      const { error: updateError } = await supabase
        .from('products')
        .update({
          image_urls: updatedImages,
          image_url: updatedImages[0] // Update main image
        })
        .eq('id', productId);

      if (updateError) throw updateError;

      toast.success('Image removed successfully!');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to remove image: ' + error.message);
    }
  };

  // Create promo code
  const handleCreatePromoCode = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('promo_codes').insert([{
        code: promoCode,
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        max_usages: maxUsages ? parseInt(maxUsages) : null,
        expiration_date: expirationDate || null,
        is_active: true,
      }]);
      if (error) throw error;
      toast.success('Promo code created!');
      // Reset form
      setPromoCode('');
      setDiscountValue('');
      setMaxUsages('');
      setExpirationDate('');
    } catch (error) {
      toast.error('Error creating promo code: ' + error.message);
    }
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
    <div className="container max-w-6xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('add')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${activeTab === 'add' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${activeTab === 'manage' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          <Package className="w-4 h-4" />
          Manage Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('promo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${activeTab === 'promo' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
          <Plus className="w-4 h-4" />
          Promo Codes
        </button>
      </div>

      {/* Add Product Tab */}
      {activeTab === 'add' && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Add New Product</h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded" rows="3"></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price (EGP)</label>
                <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full p-2 border rounded" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input type="text" value={color} onChange={e => setColor(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. Red, Blue, Black" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded bg-white" required>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                  <option value="kids">Kids</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="training">Training</option>
                  <option value="basketball">Basketball</option>
                  <option value="sale">Sale</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sizes (comma separated)</label>
              <input type="text" value={sizes} onChange={e => setSizes(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. 40,41,42,43" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Product Images (Multiple)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="w-full p-2 border rounded"
                required
              />
              {imageFiles.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {imageFiles.length} image(s) selected
                </p>
              )}
            </div>
            <button type="submit" className="bg-black text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-black/90" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Add Product'}
            </button>
          </form>
        </div>
      )}

      {/* Manage Products Tab */}
      {activeTab === 'manage' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Manage Products</h2>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                  className="rounded"
                />
                Show deleted products
              </label>
              <button
                onClick={fetchProducts}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg font-medium"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No products found</div>
          ) : (
            <div className="grid gap-4">
              {products
                .filter(product => showDeleted || !product.is_deleted)
                .map(product => {
                const productImages = product.image_urls || [product.image_url].filter(Boolean);
                return (
                  <div key={product.id} className={`bg-white border rounded-lg p-4 ${product.is_deleted ? 'opacity-60 bg-gray-50' : ''}`}>
                    {product.is_deleted && (
                      <div className="mb-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded inline-block">
                        DELETED
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      {/* Main Product Info */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={productImages[0] || 'https://via.placeholder.com/64'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <p className="text-gray-600 text-sm">{product.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="font-medium">EGP{Number(product.price).toFixed(2)}</span>
                          <span className="text-gray-500">Stock: {product.stock}</span>
                          <span className="text-gray-500">Category: {product.category}</span>
                          {product.color && (
                            <span className="text-gray-500">Color: {product.color}</span>
                          )}
                          {product.available_sizes && (
                            <span className="text-gray-500">Sizes: {product.available_sizes.join(', ')}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingDetails(editingDetails && editingDetails.id === product.id ? null : { ...product, sizes: product.available_sizes ? product.available_sizes.join(', ') : '' })}
                          className="bg-green-100 hover:bg-green-200 text-green-600 p-2 rounded-lg transition-colors"
                          title="Edit product details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingProduct(editingProduct === product.id ? null : product.id)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors"
                          title="Manage images"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        {product.is_deleted ? (
                          <button
                            onClick={() => handleRestoreProduct(product.id, product.name)}
                            className="bg-green-100 hover:bg-green-200 text-green-600 p-2 rounded-lg transition-colors"
                            title="Restore product"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                            title="Remove product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Edit Details Section */}
                    {editingDetails && editingDetails.id === product.id && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-3">Edit Product Details</h4>
                        <form onSubmit={handleUpdateProduct} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Product Name</label>
                              <input
                                type="text"
                                value={editingDetails.name}
                                onChange={e => setEditingDetails({ ...editingDetails, name: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Price ($)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={editingDetails.price}
                                onChange={e => setEditingDetails({ ...editingDetails, price: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Stock</label>
                              <input
                                type="number"
                                value={editingDetails.stock}
                                onChange={e => setEditingDetails({ ...editingDetails, stock: e.target.value })}
                                className="w-full p-2 border rounded"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Color</label>
                              <input
                                type="text"
                                value={editingDetails.color || ''}
                                onChange={e => setEditingDetails({ ...editingDetails, color: e.target.value })}
                                className="w-full p-2 border rounded"
                                placeholder="e.g. Red, Blue, Black"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Category</label>
                              <select
                                value={editingDetails.category}
                                onChange={e => setEditingDetails({ ...editingDetails, category: e.target.value })}
                                className="w-full p-2 border rounded bg-white"
                                required
                              >
                                <option value="men">Men</option>
                                <option value="women">Women</option>
                                <option value="unisex">Unisex</option>
                                <option value="kids">Kids</option>
                                <option value="lifestyle">Lifestyle</option>
                                <option value="training">Training</option>
                                <option value="basketball">Basketball</option>
                                <option value="sale">Sale</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Sizes (comma separated)</label>
                              <input
                                type="text"
                                value={editingDetails.sizes || ''}
                                onChange={e => setEditingDetails({ ...editingDetails, sizes: e.target.value })}
                                className="w-full p-2 border rounded"
                                placeholder="e.g. 40,41,42,43"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                              value={editingDetails.description}
                              onChange={e => setEditingDetails({ ...editingDetails, description: e.target.value })}
                              className="w-full p-2 border rounded"
                              rows="3"
                            ></textarea>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
                            >
                              Update Product
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingDetails(null)}
                              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Image Management Section */}
                    {editingProduct === product.id && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-3">Product Images ({productImages.length})</h4>

                        {/* Current Images */}
                        <div className="grid grid-cols-4 gap-3 mb-4">
                          {productImages.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl}
                                alt={`${product.name} ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              <button
                                onClick={() => handleRemoveImageFromProduct(product.id, imageUrl)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove image"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              {index === 0 && (
                                <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                                  Main
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Add New Image */}
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                handleAddImageToProduct(product.id, e.target.files[0]);
                                e.target.value = ''; // Reset input
                              }
                            }}
                            className="flex-1 p-2 border rounded text-sm"
                          />
                          <span className="text-sm text-gray-500">Add another image</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Promo Codes Tab */}
      {activeTab === 'promo' && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Create Promo Code</h2>
          <form onSubmit={handleCreatePromoCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Promo Code</label>
              <input
                type="text"
                placeholder="e.g., SUMMER20"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full p-2 border rounded bg-white"
                >
                  <option value="percentage">Percentage Discount</option>
                  <option value="fixed">Fixed Amount Discount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Discount Value ({discountType === 'percentage' ? '%' : 'EGP'})
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={discountType === 'percentage' ? 'e.g., 20' : 'e.g., 50'}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Max Usages (optional)</label>
                <input
                  type="number"
                  placeholder="Leave empty for unlimited"
                  value={maxUsages}
                  onChange={(e) => setMaxUsages(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiration Date (optional)</label>
                <input
                  type="datetime-local"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <button type="submit" className="bg-black text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-black/90">
              Create Promo Code
            </button>
          </form>
        </div>
      )}
    </div>
  );
}