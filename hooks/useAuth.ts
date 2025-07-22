"use client";

import { useEffect, useState } from 'react';
import { getAuthToken, removeAuthToken } from '@/lib/client-auth-helpers';

export interface User {
  id: string;
  email: string;
  username: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const response = await fetch('/api/auth/session', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user);
          } else {
            removeAuthToken();
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          removeAuthToken();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const signOut = () => {
    removeAuthToken();
    setUser(null);
  };

  return { user, loading, signOut };
}