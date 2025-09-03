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
import AdminPage from './pages/AdminPage.jsx'; // We are adding this back
import { supabase } from './supabase';
import { Toaster, toast } from 'react-hot-toast';

export default function App() {
  const [session, setSession] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const addToCart = (product, size, qty) => {
    // ... Full cart logic ...
  };

  const removeItem = (productToRemove) => {
    // ... Full remove logic ...
  };

  const handleCheckout = async () => {
    // ... Full checkout logic ...
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
        <Route path='/product/:id' element={<ProductPage addToCart={addToCart} />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} /> 
        <Route path='/account' element={<AccountPage />} /> 
        <Route path='/admin' element={<AdminPage />} /> 
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} removeItem={removeItem} onCheckout={handleCheckout} />
    </div>
  );
}