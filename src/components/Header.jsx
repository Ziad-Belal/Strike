import React, { useState, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, User, Search, Globe, ChevronDown, Menu, X } from 'lucide-react'
import { Modal, Sheet, Button, Input, Badge } from './atoms.jsx'
import { PRODUCTS } from '../utils/products.js'

const NAV = [
  { key: 'men', label: 'Men', to: '/men' },
  { key: 'new', label: 'New Arrivals', to: '/new-arrivals' },
  { key: 'sale', label: 'Sales', to: '/sale' },
]

export default function Header({ cartCount, onOpenCart }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

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
            <button className='flex items-center gap-1 text-sm' onClick={() => setSearchOpen(true)}><Search size={18}/> Search</button>
            <div className='hidden items-center gap-1 text-sm md:flex'><Globe size={18}/><span>EN</span><ChevronDown size={16}/></div>
          </nav>

          <div className='flex items-center gap-2'>
            <button className='hidden sm:inline-flex' onClick={() => setSearchOpen(true)} aria-label='Search'><Search /></button>
            <button aria-label='Account' className='hidden sm:inline-flex'><User /></button>
            <Button variant='outline' className='gap-2' onClick={onOpenCart} aria-label='Cart'>
              <ShoppingCart size={18}/>
              <span className='text-sm'>Cart</span>
              {cartCount > 0 && <Badge>{cartCount}</Badge>}
            </Button>
          </div>
        </div>
      </div>

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
            // Close the mobile menu when a link is clicked
            <Link key={c.key} to={c.to} onClick={() => setMobileOpen(false)} className='block rounded-2xl px-3 py-3 text-base hover:bg-black/5'>{c.label}</Link>
          ))}
          <div className='pt-3'>
            <Button className='w-full' variant='outline' onClick={() => { setSearchOpen(true); setMobileOpen(false); }}>Search</Button>
          </div>
        </div>
      </Sheet>


      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}

function SearchModal({ open, onClose }) {
  const [q, setQ] = React.useState('')
  const results = useMemo(() => PRODUCTS.filter(p => p.name.toLowerCase().includes(q.toLowerCase())), [q])
  const navigate = useNavigate()
  return (
    <Modal open={open} onClose={onClose}>
      <div className='flex items-center gap-3'>
        <Search/>
        <Input autoFocus placeholder='Search products…' value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className='mt-4 max-h-80 overflow-y-auto divide-y divide-black/5'>
        {q && results.map(p => (
          <button key={p.id} className='flex w-full items-center gap-4 px-2 py-3 text-left hover:bg-black/5' onClick={() => { onClose(); navigate(`/product/${p.id}`); }}>
            <img src={p.img} alt={p.name} className='h-16 w-16 rounded-xl object-cover'/>
            <div>
              <div className='font-medium'>{p.name}</div>
              <div className='text-sm text-black/60'>${p.price}</div>
            </div>
          </button>
        ))}
        {q && results.length === 0 && <div className='p-4 text-sm text-black/60'>No results for “{q}”.</div>}
      </div>
    </Modal>
  )
}
