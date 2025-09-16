// src/pages/AccountPage.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function AccountPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  // --- THIS IS THE CORRECT, MODERN WAY TO GET THE USER ---
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      // First, we get the user from the current session
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Only if a user is found, we try to fetch their profile
      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          // This can happen if the profile is missing. The UI will handle it.
        } else if (profileData) {
          setProfile(profileData);
          setFullName(profileData.full_name || '');
          setPhoneNumber(profileData.phone || ''); // ← Changed from phone_number
          setAddress(profileData.address || ''); // ← Changed from address_line1
        }
      }
      setLoading(false);
    };
    fetchUserAndProfile();
  }, []); // The empty array ensures this runs only once when the page loads
  // --- END CORRECTION ---

  const handleUpdateProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({
      full_name: fullName,
      phone: phoneNumber, // ← Changed from phone_number
      address: address, // ← Changed from address_line1
    }).eq('id', user.id);

    if (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile.');
    } else {
      toast.success('Profile updated successfully!');
      // Refresh the profile data
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return <div className="container py-10 text-center">Loading your profile...</div>;
  }

  if (!user) {
    return (
      <div className="container text-center py-10">
        <p>Please log in to view your account.</p>
        <button onClick={() => navigate('/login')} className="mt-4 bg-black text-white px-4 py-2 rounded-lg">
          Go to Login
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
        <div className="container text-center py-10">
            <p>Could not load your profile details. This can happen right after sign-up. Please try refreshing the page or logging in again.</p>
            <button onClick={handleLogout} className="mt-4 bg-red-500 text-white p-3 rounded-lg font-bold">Logout</button>
        </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      <div className="space-y-4 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold">Your Details</h2>
        <div>
          <label className="text-sm font-medium text-gray-600">Email</label>
          <p className="text-lg">{user.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Full Name</label>
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-2 border rounded mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Phone Number</label>
          <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full p-2 border rounded mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Address</label>
          <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2 border rounded mt-1" />
        </div>
        <button onClick={handleUpdateProfile} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Save Changes
        </button>
      </div>
      <div className="mt-8">
        <button onClick={handleLogout} className="w-full bg-red-500 text-white p-3 rounded-lg font-bold">
          Logout
        </button>
      </div>
    </div>
  );
}