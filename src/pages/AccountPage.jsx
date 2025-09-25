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
          .eq('id', user.id);
        
        if (error) {
          console.error('Error fetching profile:', error);
          // This can happen if the profile is missing. The UI will handle it.
        } else if (profileData && profileData.length > 0) {
          const profile = profileData[0];
          setProfile(profile);
          setFullName(profile.full_name || '');
          // Handle both column name variations
          setPhoneNumber(profile.phone || profile.phone_number || '');
          setAddress(profile.address || profile.address_line1 || '');
        }
      }
      setLoading(false);
    };
    fetchUserAndProfile();
  }, []); // The empty array ensures this runs only once when the page loads
  // --- END CORRECTION ---

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    // Update with both column name variations for compatibility
    const { error } = await supabase.from('profiles').upsert({
      id: user.id, // Include ID for upsert
      full_name: fullName,
      phone: phoneNumber,
      address: address,
      phone_number: phoneNumber, // Include both variations
      address_line1: address,
    });

    if (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile.');
    } else {
      toast.success('Profile updated successfully!');
      // Refresh the profile data
      const { data: updatedProfileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id);
      if (updatedProfileData && updatedProfileData.length > 0) {
        setProfile(updatedProfileData[0]);
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
        <div className="container text-center py-10 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
            <p className="mb-6 text-gray-600">Let's set up your profile so you can place orders.</p>
            
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Full Name" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                className="w-full p-3 border rounded-lg" 
                required 
              />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)} 
                className="w-full p-3 border rounded-lg" 
                required 
              />
              <input 
                type="text" 
                placeholder="Home Address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                className="w-full p-3 border rounded-lg" 
                required 
              />
              
              <button 
                onClick={handleUpdateProfile} 
                className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700"
              >
                Create My Profile
              </button>
              
              <button 
                onClick={handleLogout} 
                className="w-full bg-gray-500 text-white p-3 rounded-lg font-bold hover:bg-gray-600"
              >
                Logout
              </button>
            </div>
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