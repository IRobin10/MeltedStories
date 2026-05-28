import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

let tabId = 'default';
if (typeof window !== 'undefined') {
  tabId = window.sessionStorage.getItem('supabase_tab_id') || '';
  if (!tabId) {
    tabId = Math.random().toString(36).substring(2);
    window.sessionStorage.setItem('supabase_tab_id', tabId);
  }
}

// Use custom storage to keep sessions isolated per tab (sessionStorage)
const customStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(key);
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: customStorage,
    storageKey: `sb-auth-token-${tabId}`,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
