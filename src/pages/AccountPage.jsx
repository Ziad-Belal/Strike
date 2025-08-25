// src/pages/AccountPage.jsx

import React, { useState, useEffect } from 'react'; // We need useState and useEffect
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function AccountPage() {
  const navigate = useNavigate();
  
  // --- NEW: Add state to manage the user and loading status ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- NEW: This useEffect safely fetches the user's session when the page loads ---
  useEffect(() => {
    const fetchUser = async () => {
      // Use the modern, asynchronous way to get the user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false); // Stop loading once we have the user info (or lack thereof)
    };

    fetchUser();
  }, []); // The empty array [] means this runs once when the page loads

  // The function to handle logging out (this is unchanged)
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/'); // Go back to the homepage after logging out
  };

  // --- NEW: Show a loading message while we're fetching the user ---
  if (loading) {
    return <div className="container py-10 text-center">Loading your account...</div>;
  }

  // If, after loading, there is no user, then show the "not logged in" message
  if (!user) {
    return (
      <div className="container py-10 text-center">
        <p>You are not logged in.</p>
        <button onClick={() => navigate('/login')} className="mt-4 bg-black text-white px-4 py-2 rounded-lg">
          Go to Login
        </button>
      </div>
    );
  }
  
  // If loading is finished AND we have a user, show the account page
  return (
    <div className="container max-w-md mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      
      <div className="p-6 border rounded-lg space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600">Logged in as:</label>
          <p className="text-lg font-semibold">{user.email}</p>
        </div>
        
        {/* The big logout button */}
        <button 
          onClick={handleLogout} 
          className="w-full bg-red-500 text-white px-6 py-3 rounded-lg text-lg font-bold hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}