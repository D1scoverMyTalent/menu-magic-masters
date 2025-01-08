import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jhzsgtgdzezpzucpgtli.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoenNndGdkemV6cHp1Y3BndGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyNzAxMjcsImV4cCI6MjA0OTg0NjEyN30.Qh7lAXzeWnOF18zBrrh3Bkn3HhefXFdg232Y-K3lCgY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        try {
          const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        } catch (error) {
          console.error('Error reading from localStorage:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          console.error('Error writing to localStorage:', error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing from localStorage:', error);
        }
      }
    }
  }
});

// Initialize session from local storage
const initSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      // Clear any invalid session data
      await supabase.auth.signOut({ scope: 'local' });
    }
    return session;
  } catch (error) {
    console.error('Session initialization error:', error);
    return null;
  }
};

// Call initSession when the client is imported
initSession();