// src/App.jsx

import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Category from './pages/Category.jsx'
import ProductPage from './pages/ProductPage.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import SignUp from './pages/SignUp.jsx';
import Login from './pages/Login.jsx';
import { supabase } from './supabase' 

export default function App() {
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  
  // --- NEW: STATE TO MANAGE USER SESSION ---
  // This state will hold the user's data if they are logged in, otherwise it's null.
  const [session, setSession] = useState(null)

  // --- NEW: LISTENER FOR LOGIN/LOGOUT EVENTS ---
  // This useEffect runs once and listens for any authentication changes (login, logout).
  // It keeps our 'session' state perfectly in sync with Supabase.
  useEffect(() => {
    // Check for an active session when the app loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // The listener itself
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // Cleanup the listener when the component is unmounted
    return () => subscription.unsubscribe()
  }, [])

  
  // The addToCart and removeItem functions are unchanged, they are perfect.
  const addToCart = (product, size, qty) => {
    if (!size) { 
      alert('Please select a size first.'); 
      return; 
    }
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id && item.size === size);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id && item.size === size
            ? { ...item, qty: item.qty + qty }
            : item
        );
      } else {
        return [...prevItems, { ...product, size, qty }];
      }
    });
    setCartOpen(true);
  };

  const removeItem = (productToRemove) => {
    setCartItems(prevItems => prevItems.filter(item => 
      !(item.id === productToRemove.id && item.size === productToRemove.size)
    ));
  };
  
  // --- UPDATED: THE NEW CHECKOUT FUNCTION ---
  // This function is now completely different.
  const handleCheckout = async () => {
    // 1. Check if the user is logged in using our new 'session' state
    if (!session) {
      alert("Please log in or create an account to continue.");
      // Optional: you could redirect to the login page here
      // navigate('/login');
      return;
    }
    
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // 2. Call our secure Supabase Edge Function
    // We send the cart items in the body of the request.
    const { data, error } = await supabase.functions.invoke('create-order-and-notify', {
      body: { cartItems },
    });

    if (error) {
      console.error("Error checking out:", error);
      alert("There was an issue placing your order. Please try again.");
    } else {
      // 3. Success! The function handled everything.
      alert("Order placed successfully!");
      setCartItems([]);
      setCartOpen(false);
      console.log("Order created by Edge Function:", data);
    }
  };

  return (
    <div className='min-h-screen bg-white text-black'>
      {/* --- UPDATED: Pass the session to the Header --- */}
      {/* Now your Header will know if a user is logged in or not. */}
      <Header session={session} cartCount={cartItems.length} onOpenCart={() => setCartOpen(true)} />
      
      <Routes>
        {/* Your existing routes are perfect */}
        <Route path='/' element={<Home />} />
        <Route path='/men' element={<Category category='men' />} />
        <Route path='/women' element={<Category category='women' />} />
        <Route path='/new-arrivals' element={<Category category='new' />} />
        <Route path='/sale' element={<Category category='sale' />} />
        <Route path='/product/:id' element={<ProductPage addToCart={addToCart} />} />
        
        {/* --- NEW: ADDED SIGNUP AND LOGIN ROUTES --- */}
        <Route path='/signup' element={<SignUp />} />
        <Route path='/login' element={<Login />} />

        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
      
      <Footer />
      
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