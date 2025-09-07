// src/pages/AccountPage.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function AccountPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- THIS IS THE CORRECT, MODERN WAY TO GET THE USER ---
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(profileData);
        }
      }
      setLoading(false);
    };
    fetchUserAndProfile();
  }, []);
  // --- END CORRECTION ---

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return <div className="container py-10 text-center">Loading...</div>;
  }

  if (!user || !profile) {
    return <div className="container py-10 text-center">Could not load profile. Please log in again.</div>;
  }

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      
      <div className="space-y-4 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold">Account Details</h2>
        <div>
          <label className="text-sm font-medium text-gray-600">Email</label>
          <p className="text-lg">{user.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Full Name</label>
          <input 
            type="text" 
            defaultValue={profile.full_name || ''} 
            className="w-full p-2 border rounded mt-1"
          />
        </div>
      </div>

      <div className="mt-8">
        <button 
          onClick={handleLogout} 
          className="w-full bg-red-500 text-white p-3 rounded-lg font-bold hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}