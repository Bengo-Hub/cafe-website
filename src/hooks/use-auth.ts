'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const { login: setStoreUser, logout: clearStore } = useAuthStore();

  useEffect(() => {
    if (session?.user) {
      setStoreUser(session.user as any);
    } else if (status === 'unauthenticated') {
      clearStore();
    }
  }, [session, status, setStoreUser, clearStore]);

  return {
    user: session?.user,
    isAuthenticated: !!session?.user,
    isLoading: status === 'loading',
    login: () => signIn('bengobox-auth'),
    logout: () => signOut(),
  };
};
