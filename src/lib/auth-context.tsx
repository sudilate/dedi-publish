import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (userData: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // This is a mock implementation - replace with actual API calls later
  const login = async (username: string, password: string): Promise<boolean> => {
    // In a real implementation, this would call your API
    // For now, we'll simulate a successful login for any non-empty credentials
    if (username && password) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setUser({
        username,
        firstName: 'Demo',
        lastName: 'User',
        email: `${username}@example.com`,
      });
      return true;
    }
    return false;
  };

  // Mock signup function - replace with actual API call later
  const signup = async (userData: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<boolean> => {
    // In a real implementation, this would call your API
    if (userData.username && userData.password) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setUser({
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
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