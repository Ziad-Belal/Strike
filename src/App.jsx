// src/App.jsx

import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Category from './pages/Category.jsx'
import ProductPage from './pages/ProductPage.jsx'
import CartDrawer from './components/CartDrawer.jsx'
// Make sure this import path is correct for your project
import { supabase } from './supabase' 

export default function App() {
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])

  // 1. REMOVED: No longer need to fetch all products here.
  // Components like Home.jsx now fetch their own data. This is more efficient.

  // 2. IMPROVED: The addToCart function now handles quantity updates.
  const addToCart = (product, size, qty) => {
    if (!size) { 
      alert('Please select a size first.'); 
      return; 
    }

    setCartItems(prevItems => {
      // Check if the item (with the same ID and size) is already in the cart
      const existingItem = prevItems.find(item => item.id === product.id && item.size === size);

      if (existingItem) {
        // If it exists, update the quantity
        return prevItems.map(item =>
          item.id === product.id && item.size === size
            ? { ...item, qty: item.qty + qty }
            : item
        );
      } else {
        // If it's a new item, add it to the cart
        return [...prevItems, { ...product, size, qty }];
      }
    });
    setCartOpen(true); // Open cart after adding an item
  };

  const removeItem = (productToRemove) => {
    setCartItems(prevItems => prevItems.filter(item => 
      // We need a more robust way to identify the item, e.g., by id and size
      !(item.id === productToRemove.id && item.size === productToRemove.size)
    ));
  };
  
  // 3. NEW: The function to handle the final checkout process.
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // Step A: Calculate total price
    const total_price = cartItems.reduce((total, item) => {
      return total + item.price * item.qty;
    }, 0);

    // Step B: Create a new order in the 'orders' table
    // For now, user_id is null. If you implement users, you would put the user's ID here.
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({ total_price: total_price, user_id: null })
      .select() // .select() returns the newly created order, including its ID
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      alert("There was an issue placing your order. Please try again.");
      return;
    }

    const order_id = orderData.id;

    // Step C: Create the corresponding order items
    const orderItemsToInsert = cartItems.map(item => ({
      order_id: order_id,
      product_id: item.id,
      quantity: item.qty,
      price: item.price // This is the price per item at the time of purchase
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      alert("There was an issue saving your order details. Please try again.");
      return;
    }

    // Step D: Success! Clear the cart and give feedback.
    alert("Order placed successfully!");
    setCartItems([]);
    setCartOpen(false);
  };

  return (
    <div className='min-h-screen bg-white text-black'>
      <Header cartCount={cartItems.length} onOpenCart={() => setCartOpen(true)} />
      <Routes>
        {/* 4. UPDATED: No longer passing products prop to Home */}
        <Route path='/' element={<Home />} />
        <Route path='/men' element={<Category category='men' />} />
        <Route path='/new-arrivals' element={<Category category='new' />} />
        <Route path='/sale' element={<Category category='sale' />} />
        {/* 5. UPDATED: Route param changed from :slug to :id to match our logic */}
        <Route path='/product/:id' element={<ProductPage addToCart={addToCart} />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
      <Footer />
      {/* 6. NEW: Pass the handleCheckout function to the CartDrawer */}
      <CartDrawer 
        open={cartOpen} 
        onClose={() => setCartOpen(false)} 
        items={cartItems} 
        removeItem={removeItem} 
        onCheckout={handleCheckout} 
      />
    </div>
  );
}