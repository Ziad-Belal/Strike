// src/components/Footer.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input, Button } from './atoms.jsx';
import { supabase } from '../supabase'; // We need this
import { toast } from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // This one line calls our secure backend function.
    const { error } = await supabase.functions.invoke('send-feedback', {
      body: { email, message },
    });

    if (error) {
      toast.error("Failed to send message. Please try again.");
      console.error("Supabase Function Error:", error);
    } else {
      toast.success("Thank you! Your message has been sent.");
      setEmail('');
      setMessage('');
    }
    setLoading(false);
  };

  return (
    <footer className='mt-16 border-t'>
      <div className='container grid grid-cols-1 md:grid-cols-4 gap-8 py-10'>
        <FooterCol title='Shop'>
          <FooterLink to='/men'>Men</FooterLink>
          <FooterLink to='/women'>Women</FooterLink>
          <FooterLink to='/new-arrivals'>New Arrivals</FooterLink>
          <FooterLink to='/sale'>Sales</FooterLink>
        </FooterCol>
        <FooterCol title='Help'>
          <FooterLink to='/contact'>Contact Us</FooterLink>
        </FooterCol>
        <div className="md:col-span-2">
          <div className='font-semibold'>Leave a Message</div>
          <p className="text-sm text-gray-600 mt-2 mb-4">Have a question or feedback?</p>
          <form onSubmit={handleFeedbackSubmit} className='space-y-3'>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder='Your email' required />
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Your message..."
              className="w-full rounded-3xl border p-2"
              rows="3"
              required
            ></textarea>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send'}
            </Button>
          </form>
        </div>
      </div>
      <div className='border-t text-center py-4 text-xs'>
        © {new Date().getFullYear()} Strike | the website is under development
      </div>
    </footer>
  );
}

function FooterCol({ title, children }) { /* ... */ }
function FooterLink({ to, children }) { /* ... */ }