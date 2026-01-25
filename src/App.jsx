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
import { Modal, Input, Button } from './components/atoms.jsx';

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
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [pfName, setPfName] = useState('');
  const [pfPhone, setPfPhone] = useState('');
  const [pfAddress, setPfAddress] = useState('');
  const [pfLoading, setPfLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [pendingPromo, setPendingPromo] = useState(null);

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

  useEffect(() => {
    const loadProfile = async () => {
      if (!profileModalOpen || !session?.user) return;
      try {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id);
        const p = data && data.length > 0 ? data[0] : null;
        setPfName(p?.full_name || session.user.email || '');
        const clean = (p?.phone || '').replace(/\D/g, '');
        setPfPhone(clean);
        setPfAddress(p?.address || '');
      } catch {
        setPfName(session.user.email || '');
        setPfPhone('');
        setPfAddress('');
      }
    };
    loadProfile();
  }, [profileModalOpen, session]);

  const saveProfile = async () => {
    if (!session?.user) return;
    const cleanPhone = (pfPhone || '').replace(/\D/g, '');
    const validPhone = cleanPhone.length >= 6 && cleanPhone.length <= 15;
    if (!validPhone || !pfAddress) {
      toast.error('Enter a valid phone (6-15 digits) and address.');
      return;
    }
    try {
      setPfLoading(true);
      const { error } = await supabase.from('profiles').upsert([{
        id: session.user.id,
        full_name: pfName || session.user.email,
        phone: cleanPhone,
        address: pfAddress
      }]).select();
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Profile updated.');
      }
    } catch (e) {
      toast.error('Failed to update profile.');
    } finally {
      setPfLoading(false);
    }
  };
  const performCheckout = async () => {
    if (!session) {
      setLoginModalOpen(true);
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    const cleanPhone = (pfPhone || '').replace(/\D/g, '');
    const hasValidPhone = cleanPhone.length >= 6 && cleanPhone.length <= 15;
    if (!hasValidPhone || !pfAddress || !pfName) {
      toast.error('Please fill name, valid phone (6-15 digits), and address.');
      return;
    }
    try {
      setPlacingOrder(true);
      const { error: upsertError } = await supabase.from('profiles').upsert([{
        id: session.user.id,
        full_name: pfName || session.user.email,
        phone: cleanPhone,
        address: pfAddress
      }]).select();
      if (upsertError) {
        toast.error(upsertError.message);
        setPlacingOrder(false);
        return;
      }
      const subtotal = cartItems.reduce((sum, it) => sum + it.price * it.qty, 0);
      const shippingCost = cartItems.length > 0 ? 60 : 0;
      const appliedPromo = pendingPromo;
      const discount = appliedPromo ? (appliedPromo.discount_type === 'percentage' ? subtotal * (appliedPromo.discount_value / 100) : Math.min(appliedPromo.discount_value, subtotal)) : 0;
      const discountedSubtotal = subtotal - discount;
      const total = discountedSubtotal + shippingCost;
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
        toast.error('There is an issue with an item in your cart. Please remove and re-add it.');
        setPlacingOrder(false);
        return;
      }
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
          full_name: pfName || session.user.email,
          phone: cleanPhone,
          address: pfAddress
        }
      };
      const token = session?.access_token;
      const { data, error } = await supabase.functions.invoke('place-order', {
        body: orderData,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (error) {
        let errorMessage = 'There was an issue placing your order. Please try again.';
        try {
          if (error?.context) {
            const ctx = await error.context.json();
            if (ctx?.error) errorMessage = ctx.error;
          }
        } catch { }
        if (error.message) errorMessage = errorMessage || error.message;
        toast.error(errorMessage);
        setPlacingOrder(false);
      } else {
        if (appliedPromo) {
          try {
            await supabase.from('promo_codes').update({ current_usages: appliedPromo.current_usages + 1 }).eq('id', appliedPromo.id);
          } catch { }
        }
        toast.success('Order placed successfully! Please check your email.');
        setCartItems([]);
        try {
          localStorage.removeItem('strike_cart');
        } catch { }
        setCartOpen(false);
        setProfileModalOpen(false);
        setPlacingOrder(false);
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
      setPlacingOrder(false);
    }
  };
  const saveProfileAndCheckout = async () => {
    await saveProfile();
    await performCheckout();
  };

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
      setLoginModalOpen(true);
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    setPendingPromo(appliedPromo);
    setProfileModalOpen(true);
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
      <Modal open={loginModalOpen} onClose={() => setLoginModalOpen(false)}>
        <div className='space-y-4'>
          <div className='text-lg font-semibold'>Please log in to continue</div>
          <div className='flex items-center gap-2'>
            <Button asChild><a href="/login">Login</a></Button>
            <Button variant='outline' asChild><a href="/signup">Sign Up</a></Button>
          </div>
        </div>
      </Modal>
      <Modal open={profileModalOpen} onClose={() => setProfileModalOpen(false)}>
        <div className='space-y-4'>
          <div className='text-lg font-semibold'>Complete Your Profile</div>
          <Input placeholder='Full Name' value={pfName} onChange={(e) => setPfName(e.target.value)} />
          <Input placeholder='Phone Number (6-15 digits)' value={pfPhone} onChange={(e) => setPfPhone(e.target.value.replace(/\D/g, ''))} />
          <Input placeholder='Address' value={pfAddress} onChange={(e) => setPfAddress(e.target.value)} />
          <div className='flex items-center gap-2'>
            <Button onClick={saveProfileAndCheckout} disabled={pfLoading || placingOrder}>{pfLoading || placingOrder ? 'Processing...' : 'Continue'}</Button>
            <Button variant='outline' onClick={() => setProfileModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
