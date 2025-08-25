// src/components/Header.jsx

import React, { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, User, Search, Globe, ChevronDown, Menu, X } from 'lucide-react'
import { Modal, Sheet, Button, Input, Badge } from './atoms.jsx'
import { supabase } from '../supabase' // Import Supabase

const NAV = [
  { key: 'men', label: 'Men', to: '/men' },
  { key: 'women', label: 'Women', to: '/women' }, // Added Women for completeness
  { key: 'new', label: 'New Arrivals', to: '/new-arrivals' },
  { key: 'sale', label: 'Sales', to: '/sale' },
]

export default function Header({ session, cartCount, onOpenCart }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  // navigate is no longer needed here since logout is moved, but we can keep it for now.
  const navigate = useNavigate();

  // --- MODIFICATION: The handleLogout function has been removed from the header. ---

  return (
    <header className='sticky top-0 z-40 w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-black/5'>
      <div className='container'>
        {/* --- MODIFICATION: Header is now bigger (h-20) --- */}
        <div className='flex h-20 items-center justify-between gap-4'>
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
            <button className='flex items-center gap-1 text-sm' onClick={() => setSearchOpen(true)}><Search size={18}/> Search</button>
          </nav>

          <div className='flex items-center gap-2'>
            <button className='hidden sm:inline-flex' onClick={() => setSearchOpen(true)} aria-label='Search'><Search /></button>
            
            {/* --- MODIFICATION: The entire login/logout section is changed. --- */}
            {session ? (
              // If user is logged in, show their email as a link to the new account page
              <Link to="/account" className='hidden sm:flex items-center gap-2 text-sm font-medium hover:underline'>
                <User size={18} />
                {session.user.email}
              </Link>
            ) : (
              // If user is logged out, show Login and Sign Up buttons (this part is the same)
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
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='grid h-8 w-8 place-content-center rounded-xl bg-black text-white font-black'>S</div>
            <span className='text-lg font-semibold'>Strike</span>
          </div>
          <button onClick={() => setMobileOpen(false)} aria-label='Close'><X/></button>
        </div>
        <div className='mt-6 space-y-1'>
          {NAV.map((c) => (
            <Link key={c.key} to={c.to} onClick={() => setMobileOpen(false)} className='block rounded-2xl px-3 py-3 text-base hover:bg-black/5'>{c.label}</Link>
          ))}
          <div className='pt-3 border-t mt-3'>
            {/* --- MODIFICATION: Mobile menu now links to Account page when logged in. --- */}
            {session ? (
               <Link to="/account" onClick={() => setMobileOpen(false)} className='flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50'>
                My Account
              </Link>
            ) : (
              <div className='space-y-2'>
                <Button className='w-full' asChild><Link to="/login" onClick={() => setMobileOpen(false)}>Login</Link></Button>
                <Button className='w-full' variant='outline' asChild><Link to="/signup" onClick={() => setMobileOpen(false)}>Sign Up</Link></Button>
              </div>
            )}
          </div>
        </div>
      </Sheet>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}

// The SearchModal function remains unchanged as it is already correct.
function SearchModal({ open, onClose }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (q.length > 2) {
        const performSearch = async () => {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .textSearch('name', q, { type: 'plain' })
          
          if (error) {
            console.error("Search error:", error);
          } else {
            setResults(data);
          }
        }
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [q]);

  const handleNavigate = (productId) => {
    onClose();
    navigate(`/product/${productId}`);
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className='flex items-center gap-3'>
        <Search/>
        <Input autoFocus placeholder='Search products…' value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className='mt-4 max-h-80 overflow-y-auto divide-y divide-black/5'>
        {results.map(p => (
          <button key={p.id} className='flex w-full items-center gap-4 px-2 py-3 text-left hover:bg-black/5' onClick={() => handleNavigate(p.id)}>
            <img src={p.image_url} alt={p.name} className='h-16 w-16 rounded-xl object-cover'/>
            <div>
              <div className='font-medium'>{p.name}</div>
              <div className='text-sm text-black/60'>${p.price}</div>
            </div>
          </button>
        ))}
        {q.length > 2 && results.length === 0 && <div className='p-4 text-sm text-black/60'>No results for “{q}”.</div>}
      </div>
    </Modal>
  )
}