// src/App.jsx

import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Category from './pages/Category.jsx';
import ProductPage from './pages/ProductPage.jsx';
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx';
import AccountPage from './pages/AccountPage.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import AdminPage from './pages/AdminPage.jsx';
import SlideshowManagement from './pages/SlideshowManagement.jsx'; // <-- Add this import at the top
import SupabaseTest from './components/SupabaseTest.jsx';
import FixProfiles from './components/FixProfiles.jsx';
import { supabase } from './supabase';
import { Toaster, toast } from 'react-hot-toast';

export default function App() {
  const [session, setSession] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    // This correctly gets the initial session and listens for any changes.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // This is the cleanup function to prevent memory leaks.
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // This is the full, working addToCart function.
  const addToCart = (product, size, qty) => {
    if (!size && product.available_sizes?.length > 0) {
      toast.error('Please select a size first.');
      return;
    }
    setCartItems(prev => {
        const existing = prev.find(i => i.id === product.id && i.size === size);
        if (existing) {
            return prev.map(i => i.id === product.id && i.size === size ? { ...i, qty: i.qty + qty } : i);
        }
        return [...prev, { ...product, size, qty }];
    });
    setCartOpen(true);
    toast.success(`${product.name} added to cart!`);
  };

  // This is the full, working removeItem function.
  const removeItem = (productToRemove) => {
    setCartItems(prev => prev.filter(i => !(i.id === productToRemove.id && i.size === productToRemove.size)));
    toast.success(`${productToRemove.name} removed from cart.`);
  };

  // This is the updated handleCheckout function that includes user profile data
  const handleCheckout = async () => {
    if (!session) {
      toast.error("Please log in to continue.");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    try {
      // First, fetch the user's profile information without .single()
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id);

      // Don't block checkout if profile doesn't exist, just use default values
      let profile = null;
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        console.log("Proceeding with checkout using email only");
      } else if (profileData && profileData.length > 0) {
        profile = profileData[0];
      }

      // Prepare the order data with both cart items and user info
      const orderData = {
        cartItems,
        userInfo: {
          email: session.user.email,
          full_name: profile?.full_name || session.user.email || 'Not provided',
          phone: profile?.phone || profile?.phone_number || 'Not provided',
          address: profile?.address || profile?.address_line1 || 'Not provided'
        }
      };

      // Send the complete order data to the backend
      const { data, error } = await supabase.functions.invoke('create-order-and-notify', {
        body: orderData,
      });

      if (error) {
        console.error("Error from Edge Function:", error);
        toast.error("There was an issue placing your order. Please try again.");
      } else {
        toast.success("Order placed successfully! Please check your email.");
        setCartItems([]);
        setCartOpen(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className='min-h-screen bg-white text-black'>
      <Toaster position="bottom-center" />
      <Header session={session} cartCount={cartItems.length} onOpenCart={() => setCartOpen(true)} />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/men' element={<Category category='men' />} />
        <Route path='/women' element={<Category category='women' />} />
        <Route path='/new-arrivals' element={<Category category='new' />} />
        <Route path='/sale' element={<Category category='sale' />} />
        <Route path='/unisex' element={<Category category='unisex' />} /> {/* <-- Added this line */}
        <Route path='/product/:id' element={<ProductPage addToCart={addToCart} />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/account' element={<AccountPage />} />
        <Route path='/admin' element={<AdminPage />} />
        <Route path='/slideshow' element={<SlideshowManagement />} />
        <Route path='/test-supabase' element={<SupabaseTest />} />
        <Route path='/fix-profile' element={<FixProfiles />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} removeItem={removeItem} onCheckout={handleCheckout} />
    </div>
  );
}
