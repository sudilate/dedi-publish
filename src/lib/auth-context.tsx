import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { registerUser, getCurrentUser, logoutUser } from './api';

interface User {
  id?: string;
  email: string;
  email_verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  register: (email: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for authentication on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('🔍 Checking auth status...');
        const userData = await getCurrentUser();
        console.log('✅ User data received:', userData);
        setUser({
          id: userData.id,
          email: userData.email,
          email_verified: userData.email_verified || true,
        });
      } catch (error) {
        console.log('❌ No active session found:', error);
      } finally {
        setIsLoading(false);
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Registration function using simplified API
  const register = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await registerUser(email);
      
      // If registerUser doesn't throw an error, the registration was successful
      // (registerUser already handles HTTP status codes including 201)
      return true;
      
    } catch (error) {
      // Re-throw the error so it can be handled by the UI
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      console.log('User logged out');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}