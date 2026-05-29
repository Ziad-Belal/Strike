import { createClient } from '@supabase/supabase-js';

// Use environment variables when available, otherwise fall back to the hardcoded anon key.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zhjueqcwhflbqjhmqsey.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoanVlcWN3aGZsYnFqaG1xc2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTcwODgsImV4cCI6MjA3MTAzMzA4OH0.fd2h8uJV2eNiFkcblf8u-8bqrsnqCaBxOOa7Xq8iEt4';

export const supabase = createClient(supabaseUrl, supabaseKey);
export const supabaseAnon = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: {
            getItem: () => null,
            setItem: () => { },
            removeItem: () => { },
        },
    },
});
