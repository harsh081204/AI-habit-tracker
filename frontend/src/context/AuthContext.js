"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in (via cookie or token)
    const checkLogin = async () => {
      try {
        // We'll call a simple /me or /profile endpoint later
        // For now, check if the token cookie exists
        const hasToken = document.cookie.includes('token=');
        if (hasToken) {
          // Simulated user data for now
          setUser({ id: '1', name: 'Rahul Kumar', email: 'rahul@example.com' });
        }
      } catch (err) {
        console.error("Auth check failed", err);
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // 1. CALL GO BACKEND (Placeholder URL for now)
      // const res = await fetch('http://localhost:8080/api/login', { 
      //   method: 'POST', body: JSON.stringify({ email, password }) 
      // });
      
      // 2. SIMULATE SUCCESS (Since Go isn't running yet)
      document.cookie = "token=simulated-jwt-token; path=/; max-age=86400";
      setUser({ id: '1', email });
      router.push('/journal');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      // 1. CALL GO BACKEND
      // const res = await fetch('http://localhost:8080/api/signup', { ... });
      
      // 2. SIMULATE SUCCESS
      document.cookie = "token=simulated-jwt-token; path=/; max-age=86400";
      setUser({ id: '1', ...userData });
      router.push('/journal');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
