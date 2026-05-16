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
    <footer className='mt-20 border-t border-gray-100 bg-gray-50'>
      <div className='container grid grid-cols-1 md:grid-cols-5 gap-10 py-16'>
        <FooterCol title='Shop'>
          <FooterLink to='/men'>Men</FooterLink>
          <FooterLink to='/women'>Women</FooterLink>
          <FooterLink to='/unisex'>Unisex</FooterLink>
          <FooterLink to='/new-arrivals'>New Arrivals</FooterLink>
          <FooterLink to='/sale'>Sales</FooterLink>
        </FooterCol>
        <FooterCol title='Company'>
          <FooterLink to='/about'>About</FooterLink>
          <FooterLink to='/vision-mission'>Vision & Mission</FooterLink>
        </FooterCol>
        <FooterCol title='Help'>
          <FooterLink to='/contact'>Contact Us</FooterLink>
        </FooterCol>
        <div className="md:col-span-2">
          <div className='font-bold text-lg text-gray-900 mb-2'>Get in Touch</div>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">Have a question, feedback, or just want to say hi? We'd love to hear from you!</p>
          <form onSubmit={handleFeedbackSubmit} className='space-y-4'>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder='Your email' required />
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Your message..."
              className="w-full rounded-xl border border-gray-200 p-3 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              rows="3"
              required
            ></textarea>
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
      </div>
      <div className='border-t border-gray-100 bg-white'>
        <div className='container flex flex-col sm:flex-row items-center justify-between py-6 gap-4'>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Strike Sports. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm">
            <FooterLink to='/privacy'>Privacy Policy</FooterLink>
            <FooterLink to='/terms'>Terms of Service</FooterLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-900">{title}</h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="block text-sm text-gray-600 hover:text-black transition-colors"
    >
      {children}
    </Link>
  );
}