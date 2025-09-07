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
import { supabase } from './supabase';
import { Toaster, toast } from 'react-hot-toast';

export default function App() {
  const [session, setSession] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // --- THIS IS THE FULLY RESTORED, WORKING addToCart FUNCTION ---
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

  // --- THIS IS THE FULLY RESTORED removeItem FUNCTION ---
  const removeItem = (productToRemove) => {
    setCartItems(prev => prev.filter(i => !(i.id === productToRemove.id && i.size === productToRemove.size)));
    toast.success(`${productToRemove.name} removed from cart.`);
  };

  // --- THIS IS THE FULLY RESTORED handleCheckout FUNCTION ---
  const handleCheckout = async () => {
    if (!session) { 
      toast.error("Please log in to continue."); 
      return; 
    }
    if (cartItems.length === 0) { 
      toast.error("Your cart is empty."); 
      return; 
    }
    
    // This is the checkout logic that saves the order to the database.
    const { data: orderData, error: orderError } = await supabase.from('orders').insert({ 
      user_id: session.user.id, 
      total_price: cartItems.reduce((acc, item) => acc + item.price * item.qty, 0) 
    }).select().single();

    if(orderError) { 
      toast.error("Could not place order."); 
      return; 
    }
    
    const orderItems = cartItems.map(item => ({ 
      order_id: orderData.id, 
      product_id: item.id, 
      quantity: item.qty, 
      price: item.price 
    }));
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    
    if(itemsError) {
        toast.error("Could not save order details.");
    } else {
        toast.success("Order placed successfully!");
        setCartItems([]);
        setCartOpen(false);
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