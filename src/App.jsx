// src/App.jsx

import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Category from './pages/Category.jsx'
import ProductPage from './pages/ProductPage.jsx'
import SignUp from './pages/SignUp.jsx'
import Login from './pages/Login.jsx'
import AccountPage from './pages/AccountPage.jsx'
import CartDrawer from './components/CartDrawer.jsx'
// --- FINAL FIX: Corrected the import paths for Admin components ---
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminRoute from './components/AdminRoute.jsx'
// --- END FIX ---
import { supabase } from './supabase' 
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
    toast.success(`${product.name} added to cart!`);
  };

  const removeItem = (productToRemove) => {
    setCartItems(prevItems => prevItems.filter(item => 
      !(item.id === productToRemove.id && item.size === productToRemove.size)
    ));
    toast.success(`${productToRemove.name} removed from cart.`);
  };
  
  const handleCheckout = async () => {
    if (!session) {
      toast.error("Please log in to continue.");
      return;
    }
    
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    const { data, error } = await supabase.functions.invoke('create-order-and-notify', {
      body: { cartItems },
    });

    if (error) {
      console.error("Error checking out:", error);
      toast.error("There was an issue placing your order.");
    } else {
      toast.success("Order placed successfully!");
      setCartItems([]);
      setCartOpen(false);
      console.log("Order created by Edge Function:", data);
    }
  };

  return (
    <div className='min-h-screen bg-white text-black'>
      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#212121',
            color: '#FFFFFF',
            borderRadius: '9999px',
          },
        }}
      />
      
      <Header session={session} cartCount={cartItems.length} onOpenCart={() => setCartOpen(true)} />
      
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/men' element={<Category category='men' />} />
        <Route path='/women' element={<Category category='women' />} />
        <Route path='/new-arrivals' element={<Category category='new' />} />
        <Route path='/sale' element={<Category category='sale' />} />
        <Route path='/product/:id' element={<ProductPage addToCart={addToCart} />} />
        
        {/* Auth Routes */}
        <Route path='/signup' element={<SignUp />} />
        <Route path='/login' element={<Login />} />
        <Route path='/account' element={<AccountPage />} />
        
        {/* Admin Route */}
        <Route path='/admin' element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        
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