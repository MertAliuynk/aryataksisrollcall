'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../utils/trpc'
import { skipToken } from '@tanstack/react-query';

interface User {
  id: string
  username: string
  role: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()


  // Token doğrulama için useQuery kullan

  const [token, setToken] = useState<string | null>(null);
  const { data: verifyData, isLoading: verifyLoading, isError: verifyError } = api.auth.verifyToken.useQuery(
    token ? { token } : skipToken
  );


  useEffect(() => {
    const storedToken = localStorage.getItem('auth-token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    if (token === null) return;
    if (!verifyLoading) {
      if (verifyData && verifyData.staff) {
        setUser(verifyData.staff);
      } else if (verifyError) {
        setUser(null);
        localStorage.removeItem('auth-token');
      }
      setIsLoading(false);
    }
  }, [verifyLoading, verifyData, verifyError, token]);



  const logout = () => {
    localStorage.removeItem('auth-token')
    setUser(null)
    router.push('/staff-login')
  }

  const isAuthenticated = !!user

  return {
    user,
    isLoading,
    isAuthenticated,
    logout
  }
}