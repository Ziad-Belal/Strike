// src/components/Header.jsx

import React, { useState, useEffect } from 'react'; // We need useState and useEffect for the modal
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search } from 'lucide-react'; // Added Search back
import { Modal, Input, Button, Badge } from './atoms.jsx'; // Added Modal and Input back
import { supabase } from '../supabase'; // We need supabase for the search

const NAV = [
  { key: 'men', label: 'Men', to: '/men' },
  { key: 'women', label: 'Women', to: '/women' },
  { key: 'new', label: 'New Arrivals', to: '/new-arrivals' },
  { key: 'sale', label: 'Sales', to: '/sale' },
];

export default function Header({ session, cartCount, onOpenCart }) {
  // --- THIS IS THE RESTORED SEARCH STATE ---
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className='sticky top-0 z-40 w-full bg-white/80 backdrop-blur border-b'>
      <div className='container'>
        <div className='flex h-16 items-center justify-between'>
          <Link to='/' className='flex items-center gap-2'>
            <div className='grid h-8 w-8 place-content-center rounded-xl bg-black text-white font-black'>S</div>
            <span className='hidden sm:block font-semibold'>Strike</span>
          </Link>
          <nav className='hidden items-center gap-6 sm:flex'>
            {NAV.map((c) => (<Link key={c.key} to={c.to} className='text-sm font-medium'>{c.label}</Link>))}
            {/* --- THIS IS THE RESTORED SEARCH BUTTON --- */}
            <button className='flex items-center gap-1 text-sm text-gray-500 hover:text-black' onClick={() => setSearchOpen(true)}>
              <Search size={18}/> Search
            </button>
          </nav>
          <div className='flex items-center gap-2'>
            {session ? (
              <Link to="/account" className='hidden sm:flex items-center gap-2 text-sm font-medium hover:underline'>
                <User size={18} />
                {session.user.email}
              </Link>
            ) : (
              <div className="flex items-center gap-2">
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
      {/* --- THIS IS THE RESTORED SEARCH MODAL --- */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

// --- THIS IS THE RESTORED SEARCHMODAL FUNCTION ---
function SearchModal({ open, onClose }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (q.length > 2) {
        const performSearch = async () => {
          const { data, error } = await supabase.from('products').select('*').textSearch('name', q, { type: 'plain' })
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
        <Input autoFocus placeholder='Search products…' value={q} onChange={(e) => setQ(e.g.value)} />
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