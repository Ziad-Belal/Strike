// src/components/Footer.jsx

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Input, Button } from './atoms.jsx'
import { supabase } from '../supabase' // We need this for the new function
import { toast } from 'react-hot-toast' // We need this for feedback

export default function Footer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // This function handles the new form submission
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Call our new, secure backend function
    const { error } = await supabase.functions.invoke('send-feedback', {
      body: { email, message },
    });

    if (error) {
      toast.error("Failed to send message. Please try again.");
      console.error(error);
    } else {
      toast.success("Thank you! Your message has been sent.");
      // Clear the form
      setEmail('');
      setMessage('');
    }
    setLoading(false);
  };

  return (
    <footer className='mt-16 border-t border-black/10 bg-white'>
      <div className='container grid grid-cols-1 gap-8 py-10 md:grid-cols-4'>
        
        {/* Column 1 */}
        <FooterCol title='Shop'>
          <FooterLink to='/men'>Men</FooterLink>
          <FooterLink to='/women'>Women</FooterLink>
          <FooterLink to='/new-arrivals'>New Arrivals</FooterLink>
          <FooterLink to='/sale'>Sales</FooterLink>
        </FooterCol>
        
        {/* Column 2 */}
        <FooterCol title='Help'>
          <FooterLink to='/delivery'>Delivery & Returns</FooterLink>
          <FooterLink to='/contact'>Contact Us</FooterLink>
        </FooterCol>

        {/* Column 3 is removed to make space for the form */}

        {/* Column 4 (The new form) spans two columns on larger screens */}
        <div className="md:col-span-2">
          <div className='text-sm font-semibold'>Contact Us</div>
          <p className="text-sm text-black/70 mt-3 mb-4">Have a question or feedback? Drop us a line.</p>
          <form onSubmit={handleFeedbackSubmit} className='space-y-3'>
            <Input 
              type="email" 
              placeholder='Your email' 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <textarea
              placeholder="Your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-3xl border border-black/10 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-black/20"
              rows="3"
              required
            ></textarea>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
      </div>
      <div className='border-t border-black/10 py-4 text-center text-xs text-black/60'>
        © {new Date().getFullYear()} Strike | All Rights Reserved
      </div>
    </footer>
  )
}

// These helper components are unchanged
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