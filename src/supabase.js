import { createClient } from '@supabase/supabase-js';

// Your Supabase URL and anon key
const supabaseUrl = 'https://zhjueqcwhflbqjhmqsey.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoanVlcWN3aGZsYnFqaG1xc2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTcwODgsImV4cCI6MjA3MTAzMzA4OH0.fd2h8uJV2eNiFkcblf8u-8bqrsnqCaBxOOa7Xq8iEt4'

export const supabase = createClient(supabaseUrl, supabaseKey)
