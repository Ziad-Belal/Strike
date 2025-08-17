import React from 'react'
import { Link } from 'react-router-dom'
import { Input, Button } from './atoms.jsx'

export default function Footer() {
  return (
    <footer className='mt-16 border-t border-black/10 bg-white'>
      <div className='container grid grid-cols-2 gap-8 py-10 sm:grid-cols-4'>
        <FooterCol title='Shop'>
          <FooterLink to='/men'>Men</FooterLink>
          <FooterLink to='/new-arrivals'>New Arrivals</FooterLink>
          <FooterLink to='/sale'>Sales</FooterLink>
        </FooterCol>
        <FooterCol title='Help'>
          <a className='block text-sm text-black/70 hover:text-black' href='#'>Order Status</a>
          <a className='block text-sm text-black/70 hover:text-black' href='#'>Delivery & Returns</a>
          <a className='block text-sm text-black/70 hover:text-black' href='#'>Contact Us</a>
        </FooterCol>
        <FooterCol title='About'>
          <a className='block text-sm text-black/70 hover:text-black' href='#'>Sustainability</a>
        </FooterCol>
        <div>
          <div className='text-sm font-semibold'>Join our newsletter</div>
          <div className='mt-3 flex gap-2'>
            <Input placeholder='Your email'/>
            <Button>Sign up</Button>
          </div>
          <div className='mt-4 text-xs text-black/60'>By signing up, you agree to our Terms & Privacy Policy.</div>
        </div>
      </div>
      <div className='border-t border-black/10 py-4 text-center text-xs text-black/60'>© {new Date().getFullYear()} Strike. Demo front-end only.</div>
    </footer>
  )
}

function FooterCol({ title, children }) {
  return (
    <div>
      <div className='text-sm font-semibold'>{title}</div>
      <div className='mt-3 space-y-2'>{children}</div>
    </div>
  )
}

function FooterLink({ to, children }) {
  return <Link to={to} className='block text-sm text-black/70 hover:text-black'>{children}</Link>
}
