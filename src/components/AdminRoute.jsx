// src/components/AdminRoute.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profile && profile.role === 'admin') {
          setIsAdmin(true);
        }
      }
      setLoading(false);
    };
    checkAdminStatus();
  }, []);

  if (loading) {
    return <div className="container py-10 text-center">Checking permissions...</div>;
  }

  // If the user is an admin, show the page. Otherwise, redirect to the homepage.
  return isAdmin ? children : <Navigate to="/" />;
}