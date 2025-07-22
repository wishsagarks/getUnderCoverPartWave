"use client";

import { useEffect, useState } from 'react';
import { getCurrentUser, getAuthToken, removeAuthToken } from '@/lib/auth';

export interface User {
  id: string;
  email: string;
  username: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      const currentUser = getCurrentUser(token);
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const signOut = () => {
    removeAuthToken();
    setUser(null);
  };

  return { user, loading, signOut };
}