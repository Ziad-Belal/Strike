// src/components/Header.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { Modal, Button, Input, Badge } from './atoms.jsx';
import { supabase } from '../supabase';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/Screenshot 2025-09-15 171641.png';

const NAV = [
  { key: 'men', label: 'Men', to: '/men' },
  { key: 'women', label: 'Women', to: '/women' },
  { key: 'unisex', label: 'Unisex', to: '/unisex' }, // NEW
  { key: 'new', label: 'New Arrivals', to: '/new-arrivals' },
  { key: 'sale', label: 'Sales', to: '/sale' },
];

export default function Header({ session, cartCount, onOpenCart }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (session?.user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (error) {
          // It's okay if this fails initially while the profile is being created.
        } else {
          setProfile(data);
        }
      };
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [session]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isAdmin = profile?.role === 'admin';

  return (
    <header className='sticky top-0 z-40 w-full bg-white/80 backdrop-blur border-b border-black/5'>
      <div className='container'>
        <div className='flex h-16 items-center justify-between gap-4'>
          <div className='flex items-center gap-2'>
            <button className='sm:hidden' onClick={() => setMobileOpen(true)} aria-label='Open navigation'><Menu /></button>
            <Link to='/' className='flex items-center gap-2'>
              <img src={logo} alt="Strike Logo" className="h-8 w-8 object-contain" />
            </Link>
          </div>
          <nav className='hidden items-center gap-6 sm:flex'>
            {NAV.map((c) => (<Link key={c.key} to={c.to} className='text-sm font-medium'>{c.label}</Link>))}
            {isAdmin && (<Link to="/admin" className='text-sm font-medium text-red-600'>Admin</Link>)}
            <button className='flex items-center gap-1 text-sm text-gray-500 hover:text-black' onClick={() => setSearchOpen(true)}>
              <Search size={18} /> Search
            </button>
          </nav>
          <div className='flex items-center gap-3'>
            {session ? (
              <Link to="/account" className='hidden sm:flex items-center gap-2 text-sm'><User size={18} />{session.user.email}</Link>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant='ghost' size='sm' asChild><Link to="/login">Login</Link></Button>
                <Button size='sm' asChild><Link to="/signup">Sign Up</Link></Button>
              </div>
            )}
            <Button variant='outline' className='gap-2' onClick={onOpenCart}>
              <ShoppingCart size={18} /><span className='hidden md:inline'>Cart</span>
              {cartCount > 0 && <Badge>{cartCount}</Badge>}
            </Button>
            <span className='hidden sm:inline text-xl font-bold tracking-tight'>Strike</span>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              className="relative h-full w-full bg-white flex flex-col shadow-xl"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <Link to="/" className="flex items-center gap-3">
                  <img src={logo} alt="Strike Logo" className="h-9 w-9 rounded-2xl object-cover" />
                  <span className="text-lg font-semibold tracking-tight">Strike</span>
                </Link>
                <button onClick={() => setMobileOpen(false)}><X size={28} /></button>
              </div>

              <nav className="px-2 py-3 space-y-1 border-b">
                {NAV.map((c) => (
                  <Link
                    key={c.key}
                    to={c.to}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-4 py-3 text-base font-medium hover:bg-gray-100"
                  >
                    {c.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-4 py-3 text-base font-medium text-red-600 hover:bg-gray-100"
                  >
                    Admin
                  </Link>
                )}
              </nav>

              <div className="px-4 py-3 space-y-2">
                {session ? (
                  <Link
                    to="/account"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-4 py-3 text-center bg-gray-100 font-semibold"
                  >
                    My Account
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link to="/login" onClick={() => setMobileOpen(false)}>
                        Login
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/signup" onClick={() => setMobileOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-auto p-4 border-t bg-white">
                <Button
                  variant='outline'
                  className='gap-2 w-full'
                  onClick={() => { setMobileOpen(false); onOpenCart(); }}
                >
                  <ShoppingCart size={18} /> Cart {cartCount > 0 && <Badge>{cartCount}</Badge>}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

function SearchModal({ open, onClose }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (q.length > 2) {
        supabase.from('products').select('*').textSearch('name', q, { type: 'plain' })
          .then(({ data }) => setResults(data || []));
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  const handleNavigate = (productId) => {
    onClose();
    navigate(`/product/${productId}`);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className='flex items-center gap-3'>
        <Search />
        <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search products...' />
      </div>
      <div className='mt-4 max-h-80 overflow-y-auto divide-y'>
        {results.map(p => (
          <button key={p.id} className='flex w-full items-center gap-4 py-3 text-left hover:bg-gray-100' onClick={() => handleNavigate(p.id)}>
            <img src={p.image_url || 'https://placehold.co/100x100'} alt={p.name} className='h-16 w-16 rounded-lg object-cover' />
            <div>
              <div className='font-medium'>{p.name}</div>
              <div className='text-sm text-gray-600'>${Number(p.price).toFixed(2)}</div>
            </div>
          </button>
        ))}
        {q.length > 2 && results.length === 0 && <div className='p-4 text-sm text-gray-600'>No results for “{q}”.</div>}
      </div>
    </Modal>
  )
}
