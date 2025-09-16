// src/pages/SlideshowManagement.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';
import { Upload, X, Eye, EyeOff, MoveUp, MoveDown } from 'lucide-react';

export default function SlideshowManagement() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    const { data, error } = await supabase
      .from('slideshow_images')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching slides:', error);
      toast.error('Failed to load slides');
    } else {
      setSlides(data || []);
    }
    setLoading(false);
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `slideshow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `slideshow/${fileName}`;

    console.log('Uploading to path:', filePath);

    const { data, error: uploadError } = await supabase.storage
      .from('product_images')  // Changed from 'images' to 'product_images'
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error details:', uploadError);
      return null;
    }

    console.log('Upload success:', data);

    const { data: urlData } = supabase.storage
      .from('product_images')  // Changed from 'images' to 'product_images'
      .getPublicUrl(filePath);

    console.log('Public URL:', urlData.publicUrl);

    return urlData.publicUrl;
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const imageUrl = await uploadImage(file);

    if (imageUrl) {
      const maxOrder = slides.length > 0 ? Math.max(...slides.map(s => s.display_order)) : 0;
      
      const { data, error } = await supabase
        .from('slideshow_images')
        .insert([
          {
            image_url: imageUrl,
            title: 'New Slide',
            description: 'Add your description here',
            display_order: maxOrder + 1,
            is_active: true
          }
        ])
        .select();

      if (error) {
        console.error('Error saving slide:', error);
        toast.error('Failed to save slide');
      } else {
        toast.success('Slide uploaded successfully');
        fetchSlides();
      }
    } else {
      toast.error('Failed to upload image');
    }
    setUploading(false);
  };

  const updateSlide = async (id, updates) => {
    const { error } = await supabase
      .from('slideshow_images')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating slide:', error);
      toast.error('Failed to update slide');
    } else {
      toast.success('Slide updated');
      fetchSlides();
    }
  };

  const deleteSlide = async (id) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    const { error } = await supabase
      .from('slideshow_images')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting slide:', error);
      toast.error('Failed to delete slide');
    } else {
      toast.success('Slide deleted');
      fetchSlides();
    }
  };

  const moveSlide = async (id, direction) => {
    const slideIndex = slides.findIndex(s => s.id === id);
    const targetIndex = direction === 'up' ? slideIndex - 1 : slideIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const slide = slides[slideIndex];
    const targetSlide = slides[targetIndex];

    // Swap display orders
    await Promise.all([
      supabase.from('slideshow_images').update({ display_order: targetSlide.display_order }).eq('id', slide.id),
      supabase.from('slideshow_images').update({ display_order: slide.display_order }).eq('id', targetSlide.id)
    ]);

    fetchSlides();
  };

  if (loading) {
    return <div className="container py-20 text-center">Loading slides...</div>;
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Slideshow Management</h1>
        <p className="text-gray-600">Manage the images displayed in the homepage slideshow</p>
      </div>

      {/* Upload Section */}
      <div className="mb-8 p-6 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <Upload className="mx-auto mb-4 w-12 h-12 text-gray-400" />
          <label className="cursor-pointer">
            <span className="bg-black text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-gray-800">
              {uploading ? 'Uploading...' : 'Upload New Slide'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
          <p className="mt-2 text-sm text-gray-500">
            Recommended: 1200x600px or larger. JPG, PNG, WebP supported.
          </p>
        </div>
      </div>

      {/* Slides List */}
      <div className="space-y-6">
        {slides.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No slides yet. Upload your first slide above.
          </div>
        ) : (
          slides.map((slide, index) => (
            <div key={slide.id} className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="flex gap-6">
                {/* Image Preview */}
                <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={slide.image_url} 
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={slide.description || ''}
                      onChange={(e) => updateSlide(slide.id, { description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      rows="2"
                    />
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => updateSlide(slide.id, { is_active: !slide.is_active })}
                    className={`p-2 rounded-lg ${slide.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                    title={slide.is_active ? 'Hide slide' : 'Show slide'}
                  >
                    {slide.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => moveSlide(slide.id, 'up')}
                    disabled={index === 0}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => moveSlide(slide.id, 'down')}
                    disabled={index === slides.length - 1}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => deleteSlide(slide.id)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                    title="Delete slide"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}