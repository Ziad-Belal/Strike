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
import AboutPage from './pages/AboutPage.jsx';
import ContactUs from './pages/ContactUs.jsx';
import VisionMissionPage from './pages/VisionMissionPage.jsx';
import { supabase } from './supabase';
import { Toaster, toast } from 'react-hot-toast';

export default function App() {
  const [session, setSession] = useState(null);
  // Load cart from localStorage on mount
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('strike_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
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
      const newCart = existing
        ? prev.map(i => i.id === product.id && i.size === size ? { ...i, qty: i.qty + qty } : i)
        : [...prev, { ...product, size, qty }];
      // Save to localStorage
      try {
        localStorage.setItem('strike_cart', JSON.stringify(newCart));
      } catch (e) {
        console.error('Failed to save cart to localStorage:', e);
      }
      return newCart;
    });
    setCartOpen(true);
    toast.success(`${product.name} added to cart!`);
  };

  // This is the full, working removeItem function.
  const removeItem = (productToRemove) => {
    setCartItems(prev => {
      const newCart = prev.filter(i => !(i.id === productToRemove.id && i.size === productToRemove.size));
      // Save to localStorage
      try {
        localStorage.setItem('strike_cart', JSON.stringify(newCart));
      } catch (e) {
        console.error('Failed to save cart to localStorage:', e);
      }
      return newCart;
    });
    toast.success(`${productToRemove.name} removed from cart.`);
  };

  // This is the updated handleCheckout function that includes user profile data
  const handleCheckout = async (appliedPromo = null) => {
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

      // Validate user contact info before proceeding
      const phoneCandidate = (profile?.phone || '').trim();
      const addressCandidate = (profile?.address || '').trim();
      // Clean phone to get only digits
      const cleanPhone = phoneCandidate.replace(/\D/g, '');
      const hasValidPhone = cleanPhone.length >= 6 && cleanPhone.length <= 15;
      if (!hasValidPhone || !addressCandidate) {
        toast.error("Please complete your profile with a valid phone (6-15 digits) and address.");
        return;
      }

      // Calculate totals including promo discount
      const subtotal = cartItems.reduce((sum, it) => sum + it.price * it.qty, 0);
      const shippingCost = cartItems.length > 0 ? 60 : 0;
      const discount = appliedPromo ? (
        appliedPromo.discount_type === 'percentage'
          ? subtotal * (appliedPromo.discount_value / 100)
          : Math.min(appliedPromo.discount_value, subtotal)
      ) : 0;
      const discountedSubtotal = subtotal - discount;
      const total = discountedSubtotal + shippingCost;

      // Normalize cart items and validate each
      const items = cartItems.map((it) => ({
        id: it.id,
        name: it.name,
        price: Number(it.price),
        qty: Number(it.qty || 1),
        size: it.size || null,
        image_url: it.image_url || null,
      }));
      const invalidItem = items.find(i => !i.id || !i.name || !(i.price > 0) || !(i.qty >= 1));
      if (invalidItem) {
        console.error('Invalid cart item detected:', invalidItem);
        toast.error('There is an issue with an item in your cart. Please remove and re-add it.');
        return;
      }

      // Prepare the order data with both cart items and user info
      const orderData = {
        items,
        currency: 'EGP',
        shippingCost,
        discount,
        promoCode: appliedPromo?.code || null,
        promo: appliedPromo || null,
        subtotal,
        total,
        userInfo: {
          email: session.user.email,
          full_name: profile?.full_name || session.user.email,
          phone: cleanPhone, // Use cleaned phone number (digits only)
          address: addressCandidate
        }
      };

      // Send the complete order data to the backend
      const token = session?.access_token;
      const { data, error } = await supabase.functions.invoke('place-order', {
        body: orderData,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (error) {
        console.error("Error from Edge Function:", error);
        console.error("Error details:", {
          message: error.message,
          context: error.context,
          status: error.status
        });

        // Try to get more details from the response
        let errorMessage = "There was an issue placing your order. Please try again.";
        try {
          if (error?.context) {
            const ctx = await error.context.json();
            if (ctx?.error) errorMessage = ctx.error;
          }
        } catch { }
        if (error.message) errorMessage = errorMessage || error.message;

        toast.error(errorMessage);
      } else {
        // Update promo code usage if applied
        if (appliedPromo) {
          try {
            await supabase
              .from('promo_codes')
              .update({ current_usages: appliedPromo.current_usages + 1 })
              .eq('id', appliedPromo.id);
          } catch (promoError) {
            console.error("Error updating promo code usage:", promoError);
            // Don't fail the entire checkout for promo code update errors
          }
        }

        toast.success("Order placed successfully! Please check your email.");
        setCartItems([]);
        // Clear cart from localStorage
        try {
          localStorage.removeItem('strike_cart');
        } catch (e) {
          console.error('Failed to clear cart from localStorage:', e);
        }
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
        <Route path='/about' element={<AboutPage />} />
        <Route path='/contact' element={<ContactUs />} />
        <Route path='/vision-mission' element={<VisionMissionPage />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} removeItem={removeItem} onCheckout={handleCheckout} />
    </div>
  );
}
