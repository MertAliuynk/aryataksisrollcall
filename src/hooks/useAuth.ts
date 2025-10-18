'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../utils/trpc'

interface User {
  id: string
  username: string
  role: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const verifyToken = api.auth.verifyToken.useMutation({
    onSuccess: (userData) => {
      setUser(userData)
      setIsLoading(false)
    },
    onError: () => {
      setUser(null)
      setIsLoading(false)
      // Token geçersizse localStorage'dan temizle
      localStorage.removeItem('auth-token')
    }
  })

  useEffect(() => {
    const token = localStorage.getItem('auth-token')
    if (token) {
      verifyToken.mutate({ token })
    } else {
      setIsLoading(false)
    }
  }, [])

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