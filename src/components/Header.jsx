// src/components/Header.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Heart } from 'lucide-react';
import { Modal, Sheet, Button, Input, Badge } from './atoms.jsx';
import { supabase } from '../supabase';

const NAV = [
  { key: 'men', label: 'Men', to: '/men' },
  { key: 'women', label: 'Women', to: '/women' },
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
          // This can happen if the profile isn't created yet, which is okay.
        } else {
          setProfile(data);
        }
      };
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [session]);

  const isAdmin = profile?.role === 'admin';

  return (
    <header className='sticky top-0 z-40 w-full bg-white/80 backdrop-blur border-b border-black/5'>
      <div className='container'>
        <div className='flex h-16 items-center justify-between gap-4'>
          {/* LOGO AND MOBILE MENU BUTTON */}
          <div className='flex items-center gap-2'>
            <button className='sm:hidden' onClick={() => setMobileOpen(true)} aria-label='Open navigation'><Menu /></button>
            <Link to='/' className='flex items-center gap-2'>
              <div className='grid h-8 w-8 place-content-center rounded-xl bg-black text-white font-black'>S</div>
              <span className='hidden sm:block font-semibold'>Strike</span>
            </Link>
          </div>

          {/* MAIN NAVIGATION AND SEARCH */}
          <nav className='hidden items-center gap-6 sm:flex'>
            {NAV.map((c) => (
              <Link key={c.key} to={c.to} className='text-sm font-medium'>{c.label}</Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className='text-sm font-medium text-red-600'>Admin</Link>
            )}
            <button className='flex items-center gap-1 text-sm text-gray-500 hover:text-black' onClick={() => setSearchOpen(true)}>
              <Search size={18}/> Search
            </button>
          </nav>

          {/* USER ACTIONS (LOGIN, CART, ETC) */}
          <div className='flex items-center gap-2'>
            {session ? (
              <Link to="/account" className='hidden sm:flex items-center gap-2 text-sm font-medium hover:underline'>
                <User size={18} />
                {session.user.email}
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                 <Button variant='ghost' size='sm' asChild><Link to="/login">Login</Link></Button>
                 <Button size='sm' asChild><Link to="/signup">Sign Up</Link></Button>
              </div>
            )}
            <Button variant='outline' className='gap-2' onClick={onOpenCart}>
              <ShoppingCart size={18}/>
              <span className='hidden md:inline'>Cart</span>
              {cartCount > 0 && <Badge>{cartCount}</Badge>}
            </Button>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU SHEET --- */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen} side='left'>
        <div className='flex items-center justify-between'>
          <Link to='/' className='flex items-center gap-2'>
            <div className='grid h-8 w-8 place-content-center rounded-xl bg-black text-white font-black'>S</div>
            <span className='font-semibold'>Strike</span>
          </Link>
          <button onClick={() => setMobileOpen(false)}><X/></button>
        </div>
        <div className='mt-6 space-y-2'>
          {NAV.map((c) => (
            <Link key={c.key} to={c.to} onClick={() => setMobileOpen(false)} className='block rounded-lg p-3 text-base hover:bg-gray-100'>{c.label}</Link>
          ))}
           {isAdmin && (
              <Link to="/admin" onClick={() => setMobileOpen(false)} className='block rounded-lg p-3 text-base text-red-600 hover:bg-gray-100'>Admin</Link>
            )}
        </div>
        {/* --- THIS IS THE ONLY ADDED PART --- */}
        <div className="mt-6 pt-4 border-t">
          {session ? (
             <Link to="/account" onClick={() => setMobileOpen(false)} className="block p-3 text-center rounded-lg hover:bg-gray-100">My Account</Link>
          ) : (
            <div className="space-y-2">
              <Button asChild className="w-full"><Link to="/login" onClick={() => setMobileOpen(false)}>Login</Link></Button>
              <Button variant="outline" asChild className="w-full"><Link to="/signup" onClick={() => setMobileOpen(false)}>Sign Up</Link></Button>
            </div>
          )}
        </div>
        {/* --- END OF ADDED PART --- */}
      </Sheet>

      {/* --- SEARCH MODAL --- */}
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
        <Search/>
        <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search products...' />
      </div>
      <div className='mt-4 max-h-80 overflow-y-auto divide-y'>
        {results.map(p => (
          <button key={p.id} className='flex w-full items-center gap-4 py-3 text-left hover:bg-gray-100' onClick={() => handleNavigate(p.id)}>
            <img src={p.image_url || 'https://placehold.co/100x100'} alt={p.name} className='h-16 w-16 rounded-lg object-cover'/>
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