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
          // Extract phone number and clean it (remove all non-digits)
          const existingPhone = profile.phone || '';
          const cleanPhone = existingPhone.replace(/\D/g, '');
          setPhoneNumber(cleanPhone);
          setAddress(profile.address || '');
        }
      }
      setLoading(false);
    };
    fetchUserAndProfile();
  }, []); // The empty array ensures this runs only once when the page loads
  // --- END CORRECTION ---

  const isValidPhone = (phone) => {
    if (!phone) return false;
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 6 && digits.length <= 15;
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    if (!fullName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    
    // Clean phone number - remove all non-digits
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!isValidPhone(cleanPhone)) {
      toast.error('Please enter a valid phone number (6-15 digits).');
      return;
    }
    if (!address.trim()) {
      toast.error('Please enter your address.');
      return;
    }
    
    try {
      // First try to update existing profile
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: cleanPhone,
          address: address.trim(),
        })
        .eq('id', user.id)
        .select();

      // If update returns no rows, the profile doesn't exist, so insert it
      if (updateError || !updateData || updateData.length === 0) {
        const { data: insertData, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: fullName.trim(),
            phone: cleanPhone,
            address: address.trim(),
          })
          .select();

        if (insertError) {
          console.error('Insert error:', insertError);
          console.error('Error details:', {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint
          });
          toast.error(`Failed to create profile: ${insertError.message || 'Unknown error'}`);
          return;
        }

        // Successfully inserted
        if (insertData && insertData.length > 0) {
          setProfile(insertData[0]);
          setFullName(insertData[0].full_name || '');
          const existingPhone = insertData[0].phone || '';
          setPhoneNumber(existingPhone.replace(/\D/g, ''));
          setAddress(insertData[0].address || '');
          toast.success('Profile created successfully!');
          return;
        }
      }

      // Update was successful
      if (updateData && updateData.length > 0) {
        setProfile(updateData[0]);
        setFullName(updateData[0].full_name || '');
          const existingPhone = updateData[0].phone || '';
          setPhoneNumber(existingPhone.replace(/\D/g, ''));
        setAddress(updateData[0].address || '');
        toast.success('Profile updated successfully!');
        return;
      }

      // Fallback: fetch the profile
      const { data: fetchedData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (fetchedData) {
        setProfile(fetchedData);
        setFullName(fetchedData.full_name || '');
          const existingPhone = fetchedData.phone || '';
          setPhoneNumber(existingPhone.replace(/\D/g, ''));
        setAddress(fetchedData.address || '');
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Profile update completed but could not verify. Please refresh the page.');
      }

    } catch (err) {
      console.error('Unexpected error during profile update:', err);
      toast.error(`Unexpected error: ${err.message || 'Please try again'}`);
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
                placeholder="Phone Number (e.g., 01023286497)" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} 
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
          <input 
            type="tel" 
            value={phoneNumber} 
            onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} 
            placeholder="e.g., 01023286497"
            className="w-full p-2 border rounded mt-1" 
          />
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
