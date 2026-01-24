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

    // Validate phone number format - only digits, 6-15 digits
    const cleanPhone = phoneNumber.replace(/\D/g, ''); // Remove all non-digits
    if (cleanPhone.length < 6 || cleanPhone.length > 15) {
      toast.error('Please enter a valid phone number (6-15 digits)');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Sign up user
      const { data, error } = await supabase.auth.signUp({
        email, 
        password,
          options: {
            data: {
              full_name: fullName,
              phone: cleanPhone,
              address: address,
            }
          }
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      // Create profile row in 'profiles' table
      const user = data?.user;
      if (user) {
        // Create profile with the correct column names
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: user.id,
            full_name: fullName,
            phone: cleanPhone,
            address: address,
          }
        ]);
        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast.error('Profile creation failed: ' + profileError.message);
          setLoading(false);
          return;
        } else {
          console.log('Profile created successfully for user:', user.id);
        }
      }

      toast.success('Sign up successful! Please check your email to confirm.');
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An unexpected error occurred during signup.');
    } finally {
      setLoading(false);
    }
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