// src/components/Footer.jsx

import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Input, Button } from './atoms.jsx';
import emailjs from '@emailjs/browser';
import { toast } from 'react-hot-toast';

export default function Footer() {
  const form = useRef();
  const [loading, setLoading] = useState(false);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // --- THIS IS THE NEW, SIMPLER EMAILJS LOGIC ---
    emailjs.sendForm(
      'YOUR_SERVICE_ID', // Go to EmailJS -> Email Services -> find your Gmail service ID
      'YOUR_TEMPLATE_ID', // Go to EmailJS -> Email Templates -> find your template ID
      form.current,
      'YOUR_USER_ID' // Go to EmailJS -> Account -> find your User ID
    ).then((result) => {
        toast.success("Thank you! Your message has been sent.");
        form.current.reset(); // Clear the form
        setLoading(false);
    }, (error) => {
        toast.error("Failed to send message. Please try again.");
        setLoading(false);
    });
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
          <form ref={form} onSubmit={handleFeedbackSubmit} className='space-y-3'>
            <Input type="email" name="from_email" placeholder='Your email' required />
            <textarea
              name="message_html"
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