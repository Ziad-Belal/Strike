// src/components/SupabaseTest.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function SupabaseTest() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runTests();
  }, []);

  const addResult = (test, success, message, details = null) => {
    setTestResults(prev => [...prev, { test, success, message, details }]);
  };

  const runTests = async () => {
    setTestResults([]);
    setLoading(true);

    try {
      // Test 1: Basic connection
      addResult('Connection', null, 'Testing basic connection...');
      try {
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        
        if (error) {
          addResult('Connection', false, 'Connection failed', error);
        } else {
          addResult('Connection', true, `Connection successful! Profiles table has ${data} records`);
        }
      } catch (err) {
        addResult('Connection', false, 'Connection error', err);
      }

      // Test 2: Check current user
      addResult('User Session', null, 'Checking current user session...');
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          addResult('User Session', false, 'User session error', userError);
        } else if (!user) {
          addResult('User Session', false, 'No user logged in', 'Please log in through your app first');
        } else {
          addResult('User Session', true, `User found: ${user.email} (ID: ${user.id})`);

          // Test 3: Try to fetch user's profile
          addResult('Profile Access', null, 'Testing profile access...');
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id);

            if (profileError) {
              addResult('Profile Access', false, 'Profile query failed', profileError);
            } else {
              addResult('Profile Access', true, `Profile query successful! Records found: ${profileData.length}`, profileData);
            }
          } catch (err) {
            addResult('Profile Access', false, 'Profile access error', err);
          }
        }
      } catch (err) {
        addResult('User Session', false, 'User session error', err);
      }

      // Test 4: Check table structure
      addResult('Table Structure', null, 'Checking profiles table structure...');
      try {
        const { data: tableData, error: tableError } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);

        if (tableError) {
          addResult('Table Structure', false, 'Table structure check failed', tableError);
        } else {
          if (tableData && tableData.length > 0) {
            addResult('Table Structure', true, `Table columns: ${Object.keys(tableData[0]).join(', ')}`, tableData[0]);
          } else {
            addResult('Table Structure', false, 'Table exists but has no records');
          }
        }
      } catch (err) {
        addResult('Table Structure', false, 'Table structure error', err);
      }

      // Test 5: Test Edge Function
      addResult('Edge Function', null, 'Testing Edge Function...');
      try {
        const { data: functionData, error: functionError } = await supabase.functions.invoke('create-order-and-notify', {
          body: { test: true }
        });

        if (functionError) {
          addResult('Edge Function', false, 'Edge Function test failed', functionError);
        } else {
          addResult('Edge Function', true, 'Edge Function accessible', functionData);
        }
      } catch (err) {
        addResult('Edge Function', false, 'Edge Function error', err);
      }

    } catch (error) {
      addResult('General', false, 'Unexpected error', error);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Supabase Diagnostic Test</h1>
      
      {loading && <div className="text-blue-600">Running tests...</div>}
      
      <div className="space-y-4">
        {testResults.map((result, index) => (
          <div key={index} className={`p-4 rounded-lg border ${
            result.success === true ? 'bg-green-100 border-green-300' :
            result.success === false ? 'bg-red-100 border-red-300' :
            'bg-yellow-100 border-yellow-300'
          }`}>
            <div className="font-semibold">
              {result.success === true ? '✅' : result.success === false ? '❌' : '🔄'} {result.test}
            </div>
            <div className="mt-2">{result.message}</div>
            {result.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-600">Show details</summary>
                <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      <button 
        onClick={runTests}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={loading}
      >
        Run Tests Again
      </button>
    </div>
  );
}