// src/pages/SignUp.jsx
import React, { useState } from 'react';
import { supabase } from '../supabase'; // Make sure path is correct
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) {
      setError(error.message);
    } else {
      alert('Sign up successful! Please check your email to confirm.');
      navigate('/'); // Go to homepage after sign up
    }
  };

  return (
    <div className="container py-10 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create an Account</h1>
      <form onSubmit={handleSignUp} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-black text-white p-3 rounded">
          Sign Up
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
}