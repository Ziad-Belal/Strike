// src/App.jsx

import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
// ... (the rest of your page imports)
import AccountPage from './pages/AccountPage.jsx';
import { supabase } from './supabase' 
// --- NEW: Import the toast library ---
import { Toaster, toast } from 'react-hot-toast'

export default function App() {
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  
  const addToCart = (product, size, qty) => {
    if (!size) { 
      // --- UPDATED: Replaced alert with a toast ---
      toast.error('Please select a size first.'); 
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
    // --- NEW: Add a success toast when an item is added ---
    toast.success(`${product.name} added to cart!`);
  };

  const removeItem = (productToRemove) => {
    setCartItems(prevItems => prevItems.filter(item => 
      !(item.id === productToRemove.id && item.size === productToRemove.size)
    ));
    // --- NEW: Add a toast when an item is removed ---
    toast.success(`${productToRemove.name} removed from cart.`);
  };
  
  const handleCheckout = async () => {
    if (!session) {
      // --- UPDATED: Replaced alert with a toast ---
      toast.error("Please log in to continue.");
      return;
    }
    
    if (cartItems.length === 0) {
      // --- UPDATED: Replaced alert with a toast ---
      toast.error("Your cart is empty.");
      return;
    }

    const { data, error } = await supabase.functions.invoke('create-order-and-notify', {
      body: { cartItems },
    });

    if (error) {
      console.error("Error checking out:", error);
      // --- UPDATED: Replaced alert with a toast ---
      toast.error("There was an issue placing your order.");
    } else {
      // --- UPDATED: Replaced alert with a toast ---
      toast.success("Order placed successfully!");
      setCartItems([]);
      setCartOpen(false);
      console.log("Order created by Edge Function:", data);
    }
  };

  return (
    <div className='min-h-screen bg-white text-black'>
      {/* --- NEW: Add the Toaster component here. It's invisible but will show the pop-ups. --- */}
      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#212121', // Dark background
            color: '#FFFFFF',      // White text
            borderRadius: '9999px', // Fully rounded like your buttons
          },
        }}
      />
      
      <Header session={session} cartCount={cartItems.length} onOpenCart={() => setCartOpen(true)} />
      
      <Routes>
        {/* ... All your routes ... */}
        <Route path='/' element={<Home />} />
        <Route path='/men' element={<Category category='men' />} />
        <Route path='/women' element={<Category category='women' />} />
        <Route path='/new-arrivals' element={<Category category='new' />} />
        <Route path='/sale' element={<Category category='sale' />} />
        <Route path='/product/:id' element={<ProductPage addToCart={addToCart} />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/login' element={<Login />} />
        <Route path='/account' element={<AccountPage />} />
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