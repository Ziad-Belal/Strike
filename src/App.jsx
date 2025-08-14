import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Category from './pages/Category.jsx'
import ProductPage from './pages/ProductPage.jsx'
import CartDrawer from './components/CartDrawer.jsx'

export default function App() {
  const [cartOpen, setCartOpen] = React.useState(false)
  const [cartItems, setCartItems] = React.useState([])

  const addToCart = (product, size, qty) => {
    if (!size) { alert('Please select a size first.'); return; }
    setCartItems(prev => [...prev, { ...product, size, qty }])
    setCartOpen(true)
  }

  const removeItem = (idx) => setCartItems(prev => prev.filter((_, i) => i !== idx))

  return (
    <div className='min-h-screen bg-white text-black'>
      <Header cartCount={cartItems.length} onOpenCart={() => setCartOpen(true)} />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/men' element={<Category category='men' />} />
        <Route path='/new-arrivals' element={<Category category='new' />} />
        <Route path='/sale' element={<Category category='sale' />} />
        <Route path='/product/:slug' element={<ProductPage addToCart={addToCart} />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} removeItem={removeItem} />
    </div>
  )
}
