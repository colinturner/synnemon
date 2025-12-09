import { browser } from '$app/environment';
import { supabase, isSupabaseConfigured } from '$lib/supabase';
import type { AuthState } from '$lib/types';

function createAuthStore() {
  let state = $state<AuthState>({
    isAuthenticated: false,
    isAllowed: false,
    user: null,
    loading: true
  });

  // Check if user email is in allowlist
  async function checkAllowlist(email: string): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      const { data, error } = await supabase
        .from('allowed_users')
        .select('email')
        .eq('email', email.toLowerCase())
        .single();
      
      if (error) {
        console.error('Allowlist check error:', error);
        return false;
      }
      
      return !!data;
    } catch (e) {
      console.error('Allowlist check failed:', e);
      return false;
    }
  }

  // Initialize auth state
  async function init() {
    if (!browser || !supabase || !isSupabaseConfigured()) {
      state = { ...state, loading: false };
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const isAllowed = await checkAllowlist(session.user.email || '');
        
        state = {
          isAuthenticated: true,
          isAllowed,
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name,
            avatar: session.user.user_metadata?.avatar_url
          },
          loading: false
        };
      } else {
        state = { ...state, loading: false };
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const isAllowed = await checkAllowlist(session.user.email || '');
          
          state = {
            isAuthenticated: true,
            isAllowed,
            user: {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name,
              avatar: session.user.user_metadata?.avatar_url
            },
            loading: false
          };
        } else {
          state = {
            isAuthenticated: false,
            isAllowed: false,
            user: null,
            loading: false
          };
        }
      });
    } catch (e) {
      console.error('Auth init failed:', e);
      state = { ...state, loading: false };
    }
  }

  // Sign in with Google
  async function signInWithGoogle() {
    if (!supabase) return;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: browser ? window.location.origin : undefined
      }
    });
    
    if (error) {
      console.error('Sign in error:', error);
    }
  }

  // Sign out
  async function signOut() {
    if (!supabase) return;
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
    }
  }

  return {
    get state() {
      return state;
    },
    init,
    signInWithGoogle,
    signOut
  };
}

export const authStore = createAuthStore();

