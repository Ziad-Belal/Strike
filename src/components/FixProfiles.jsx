// src/components/FixProfiles.jsx
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';

export default function FixProfiles() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const createProfileForCurrentUser = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setResult({ success: false, message: 'Please log in first.' });
        setLoading(false);
        return;
      }

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id);

      if (existingProfile && existingProfile.length > 0) {
        setResult({ 
          success: true, 
          message: 'Profile already exists!', 
          profile: existingProfile[0] 
        });
        setLoading(false);
        return;
      }

      // Create profile with default values
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          full_name: user.email, // Use email as default name
          phone: 'Not provided',
          address: 'Not provided',
          phone_number: 'Not provided', // Include both variations
          address_line1: 'Not provided',
        }]);

      if (insertError) {
        console.error('Insert error:', insertError);
        setResult({ 
          success: false, 
          message: `Profile creation failed: ${insertError.message}`,
          error: insertError
        });
      } else {
        setResult({ 
          success: true, 
          message: 'Profile created successfully! You can now proceed with checkout.',
          userId: user.id
        });
        toast.success('Profile created! You can now checkout.');
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({ 
        success: false, 
        message: `Unexpected error: ${error.message}`,
        error
      });
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Fix Missing Profile</h2>
      <p className="mb-4 text-gray-600">
        This will create a profile record for your account so checkout can work properly.
      </p>
      
      <button 
        onClick={createProfileForCurrentUser}
        disabled={loading}
        className={`px-6 py-3 rounded-lg font-medium ${
          loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {loading ? 'Creating Profile...' : 'Create My Profile'}
      </button>

      {result && (
        <div className={`mt-4 p-4 rounded-lg ${
          result.success ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
        } border`}>
          <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.success ? '✅' : '❌'} {result.message}
          </p>
          {result.profile && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm">Show profile data</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(result.profile, null, 2)}
              </pre>
            </details>
          )}
          {result.error && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-red-600">Show error details</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(result.error, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}