// src/pages/AccountPage.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export default function AccountPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // This function runs when the page loads to get the user's profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  // Function to handle logging the user out
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/'); // Go to homepage after logout
  };

  if (loading) {
    return <div className="container py-10 text-center">Loading...</div>;
  }

  if (!profile) {
    return <div className="container py-10 text-center">Please log in to view your account.</div>;
  }

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      
      <div className="space-y-4 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold">Account Details</h2>
        <div>
          <label className="text-sm font-medium text-gray-600">Email</label>
          <p className="text-lg">{supabase.auth.user()?.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Full Name</label>
          <input 
            type="text" 
            defaultValue={profile.full_name || ''} 
            className="w-full p-2 border rounded mt-1"
          />
        </div>
        {/* You can add more profile fields here like address, city, etc. */}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Save Changes
        </button>
        <button onClick={handleLogout} className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600">
          Logout
        </button>
      </div>
    </div>
  );
}