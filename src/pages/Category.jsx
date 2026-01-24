// src/pages/Category.jsx

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ProductGrid from '../components/ProductGrid.jsx'
import Filters from '../components/Filters.jsx'
import { supabase } from '../supabase'

export default function Category({ category }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})

  useEffect(() => {
    fetchProducts()
  }, [category, filters])

  const fetchProducts = async () => {
    setLoading(true)
    
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_deleted', false) // Only show non-deleted products

      // Handle "New Arrivals" specially - show newest products from all categories
      if (category === 'new') {
        query = query.order('created_at', { ascending: false }).limit(20) // Show 20 newest products
      } else {
        // For all other categories, filter by category
        query = query.ilike('category', category).order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } else {
        // Apply client-side filtering for size and color
        let filteredProducts = (data || []).filter(product => product && !product.is_deleted)
        
        if (filters?.size) {
          filteredProducts = filteredProducts.filter(product => 
            product.available_sizes && Array.isArray(product.available_sizes) && product.available_sizes.includes(filters.size)
          )
        }
        
        if (filters?.color) {
          filteredProducts = filteredProducts.filter(product => 
            product.color && typeof product.color === 'string' && product.color.toLowerCase().includes(filters.color.toLowerCase())
          )
        }
        
        setProducts(filteredProducts)
      }
    } catch (error) {
      console.error('Error in fetchProducts:', error)
      setProducts([])
    }
    
    setLoading(false)
  }

  // Get the display title for the page
  const getTitle = () => {
    if (category === 'new') return 'New Arrivals'
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  if (loading) {
    return <div className="container py-10 text-center">Loading products...</div>
  }

  return (
    <div className='container py-10'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>{getTitle()}</h1>
        {category === 'new' && (
          <p className='text-gray-600 mt-2'>Our latest products from all categories</p>
        )}
      </div>
      
      <div className='grid gap-8 lg:grid-cols-[250px_1fr]'>
        <Filters filters={filters} onFilterChange={setFilters} />
        <div>
          {products.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No products found in this category.
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>
    </div>
  )
}