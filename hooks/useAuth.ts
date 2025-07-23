"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient, isSupabaseConfigured } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  // If Supabase is not configured, return early
  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.warn('Supabase is not configured. Please set up your environment variables.');
      setLoading(false);
      return;
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const getUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          // Get profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', authUser.id)
            .single();

          setUser({
            id: authUser.id,
            email: authUser.email!,
            username: profile?.username || authUser.email!.split('@')[0]
          });
        }
      } catch (error) {
        console.error('Error getting user:', error);
      }
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', session.user.id)
              .single();

            setUser({
              id: session.user.id,
              email: session.user.email!,
              username: profile?.username || session.user.email!.split('@')[0]
            });
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, isSupabaseConfigured]);

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  return { user, loading, signOut };
}