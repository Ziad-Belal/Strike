// src/pages/Login.jsx

import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // We'll use toasts for better user feedback

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully!");
      navigate('/');
    }
    setLoading(false);
  };

  // --- THIS IS THE NEW, CORRECTED PASSWORD RESET FUNCTION ---
  const handlePasswordReset = async () => {
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }
    
    setLoading(true);
    // This is the modern, correct method for password resets
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset link has been sent to your email!");
    }
    setLoading(false);
  };
  // --- END OF NEW FUNCTION ---

  return (
    <div className="container py-10 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Log In</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-lg"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded-lg"
          required
        />
        <button type="submit" disabled={loading} className="w-full bg-black text-white p-3 rounded-lg font-bold disabled:bg-gray-400">
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </form>
      
      {/* --- THIS IS THE NEW "FORGOT PASSWORD?" BUTTON --- */}
      <div className="text-center mt-4">
        <button onClick={handlePasswordReset} disabled={loading} className="text-sm text-gray-600 hover:underline disabled:opacity-50">
          Forgot your password?
        </button>
      </div>

      {/* A helpful link to the sign-up page */}
      <div className="text-center mt-6">
        <p>Don't have an account? <Link to="/signup" className="font-bold hover:underline">Sign Up</Link></p>
      </div>
    </div>
  );
}