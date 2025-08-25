// src/components/Header.jsx

import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react'
import { Modal, Sheet, Button, Input, Badge } from './atoms.jsx'
import { supabase } from '../supabase'

const NAV = [
  { key: 'men', label: 'Men', to: '/men' },
  { key: 'women', label: 'Women', to: '/women' },
  { key: 'new', label: 'New Arrivals', to: '/new-arrivals' },
  { key: 'sale', label: 'Sales', to: '/sale' },
]

export default function Header({ session, cartCount, onOpenCart }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  
  // --- NEW: Add state to hold the user's profile (which contains their role) ---
  const [profile, setProfile] = useState(null);

  // --- NEW: Fetch the user's profile when they log in ---
  useEffect(() => {
    if (session?.user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setProfile(data);
      };
      fetchProfile();
    } else {
      setProfile(null); // Clear the profile when the user logs out
    }
  }, [session]); // This effect runs whenever the session changes

  return (
    <header className='sticky top-0 z-40 w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-black/5'>
      <div className='container'>
        <div className='flex h-16 items-center justify-between gap-4'>
          <div className='flex items-center gap-2'>
            <button className='sm:hidden' onClick={() => setMobileOpen(true)} aria-label='Open navigation'><Menu /></button>
            <Link to='/' className='group -ml-1 flex items-center gap-2 rounded-3xl px-2 py-1'>
              <div className='grid h-8 w-8 place-content-center rounded-xl bg-black text-white font-black'>S</div>
              <span className='hidden text-lg font-semibold tracking-wide sm:block'>Strike</span>
            </Link>
          </div>

          <nav className='hidden items-center gap-6 sm:flex'>
            {NAV.map((c) => (
              <Link key={c.key} to={c.to} className='group relative py-2 text-sm font-medium'>
                {c.label}
                <span className='absolute -bottom-1 left-0 h-0.5 w-0 bg-black transition-all group-hover:w-full' />
              </Link>
            ))}

            {/* --- NEW: Conditionally render the Admin link --- */}
            {profile?.role === 'admin' && (
              <Link to="/admin" className='group relative py-2 text-sm font-medium text-red-600 hover:text-red-700'>
                Admin
                <span className='absolute -bottom-1 left-0 h-0.5 w-0 bg-red-600 transition-all group-hover:w-full' />
              </Link>
            )}

            <button className='flex items-center gap-1 text-sm' onClick={() => setSearchOpen(true)}><Search size={18}/> Search</button>
          </nav>

          <div className='flex items-center gap-2'>
            <button className='hidden sm:inline-flex' onClick={() => setSearchOpen(true)} aria-label='Search'><Search /></button>
            
            {session ? (
              <Link to="/account" className='hidden sm:flex items-center gap-2 text-sm font-medium hover:underline'>
                <User size={18} />
                {session.user.email}
              </Link>
            ) : (
              <div className='hidden sm:flex items-center gap-2'>
                <Button variant='ghost' size='sm' asChild><Link to="/login">Login</Link></Button>
                <Button size='sm' asChild><Link to="/signup">Sign Up</Link></Button>
              </div>
            )}

            <Button variant='outline' className='gap-2' onClick={onOpenCart} aria-label='Cart'>
              <ShoppingCart size={18}/>
              <span className='text-sm hidden md:inline'>Cart</span>
              {cartCount > 0 && <Badge>{cartCount}</Badge>}
            </Button>
          </div>
        </div>
      </div>

      {/* --- Mobile Menu --- */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen} side='left'>
        {/* ... (Mobile menu content is unchanged) ... */}
      </Sheet>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}

// ... SearchModal code remains the same ...
function SearchModal({ open, onClose }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    // ...
  }, [q]);

  const handleNavigate = (productId) => {
    // ...
  }

  return (
    <Modal open={open} onClose={onClose}>
      {/* ... */}
    </Modal>
  )
}