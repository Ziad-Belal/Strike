// src/pages/SignUp.jsx
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    // This is how you pass the extra data to Supabase during sign-up
    const { error } = await supabase.auth.signUp(
      { email, password },
      {
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
          address_line1: address,
        }
      }
    );

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Sign up successful! Please check your email to confirm.');
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="container py-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Your Account</h1>
      <form onSubmit={handleSignUp} className="space-y-4">
        <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-3 border rounded-lg" required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-lg" required />
        <input type="tel" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full p-3 border rounded-lg" required />
        <input type="text" placeholder="Home Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-3 border rounded-lg" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg" required />
        <button type="submit" disabled={loading} className="w-full bg-black text-white p-3 rounded-lg font-bold disabled:bg-gray-400">
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}