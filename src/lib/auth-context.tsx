import React, { createContext, useContext, useState, ReactNode } from 'react';
import { signupUser, loginUser, SignupRequest, LoginRequest } from './api';

// JWT decoder function
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

interface User {
  id?: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  email_verified?: boolean;
  realm_roles?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (userData: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => void;
  getAuthTokens: () => {
    accessToken: string | null;
    tokenType: string | null;
    refreshToken: string | null;
    creatorId: string | null;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user from stored tokens on app load
  React.useEffect(() => {
    const initializeAuth = () => {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        try {
          const decodedToken = decodeJWT(accessToken);
          console.log('Initializing user from stored token:', decodedToken);
          
          if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
            // Token is still valid
            const userObj = {
              id: decodedToken.sub || 'unknown',
              username: decodedToken.preferred_username || decodedToken.username || 'user',
              firstName: decodedToken.given_name || 'User',
              lastName: decodedToken.family_name || 'Name',
              email: decodedToken.email || '',
              email_verified: decodedToken.email_verified || false,
              realm_roles: decodedToken.realm_access?.roles || [],
            };
            setUser(userObj);
            console.log('User initialized from stored token');
          } else {
            // Token expired, clear storage
            console.log('Stored token expired, clearing storage');
            localStorage.removeItem('access_token');
            localStorage.removeItem('token_type');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('creator_id');
          }
        } catch (error) {
          console.error('Error initializing from stored token:', error);
          // Clear corrupted tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('token_type');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('creator_id');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function using actual API
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const credentials: LoginRequest = { email, password };
      const response = await loginUser(credentials);
      
      console.log('Full login API response:', response);
      console.log('Response message:', response.message);
      console.log('Response data:', response.data);
      
      if (response.message === "Login successful") {
        const tokenData = response.data as any;
        
        // Store authentication tokens in localStorage
        if (tokenData.access_token) {
          localStorage.setItem('access_token', tokenData.access_token);
          localStorage.setItem('token_type', tokenData.token_type || 'Bearer');
          localStorage.setItem('refresh_token', tokenData.refresh_token || '');
          
          if (tokenData.creator_id) {
            localStorage.setItem('creator_id', tokenData.creator_id);
          }
          
          console.log('Stored tokens in localStorage');
          
          // Decode JWT to extract user information
          const decodedToken = decodeJWT(tokenData.access_token);
          console.log('Decoded JWT payload:', decodedToken);
          
          if (decodedToken) {
            // Create user object from JWT payload
            const userObj = {
              id: decodedToken.sub || 'unknown', // JWT subject
              username: decodedToken.preferred_username || decodedToken.username || email.split('@')[0],
              firstName: decodedToken.given_name || 'User',
              lastName: decodedToken.family_name || 'Name', 
              email: decodedToken.email || email,
              email_verified: decodedToken.email_verified || false,
              realm_roles: decodedToken.realm_access?.roles || [],
            };
            
            console.log('Setting user from JWT data:', userObj);
            setUser(userObj);
            return true;
          }
        }
        
        // Fallback if JWT decoding fails
        console.log('JWT decoding failed, using fallback user');
        const fallbackUser = {
          id: 'temp-id',
          username: email.split('@')[0],
          firstName: 'User',
          lastName: 'Name',
          email: email,
          email_verified: false,
          realm_roles: [],
        };
        setUser(fallbackUser);
        return true;
      }
      
      // Handle error cases
      const errorMessage = typeof response.data === 'string' 
        ? response.data 
        : response.message || 'Login failed';
      
      throw new Error(errorMessage);
      
    } catch (error) {
      // Re-throw the error so it can be handled by the UI
      throw error;
    }
  };

  // Signup function using actual API - UPDATED to not auto-login
  const signup = async (userData: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<boolean> => {
    try {
      const signupData: SignupRequest = {
        username: userData.username,
        firstname: userData.firstName,
        lastname: userData.lastName,
        email: userData.email,
        password: userData.password,
      };
      
      const response = await signupUser(signupData);
      
      // Check for various success messages that might be returned by the API
      const successMessages = [
        "Resource created successfully",
        "User created successfully", 
        "Account created successfully",
        "Registration successful",
        "created successfully",
        "success"
      ];
      
            if (response.message && successMessages.some(msg => 
        response.message.toLowerCase().includes(msg.toLowerCase()) || 
        msg.toLowerCase().includes(response.message.toLowerCase())
      )) {
        // Signup successful - but DO NOT log in the user automatically
        // They need to verify email and manually login
        return true;
      }
      
      // Handle error cases - always show the data value as specified by user
      const errorMessage = typeof response.data === 'string' 
        ? response.data 
        : response.message || 'An error occurred during signup';
      
      throw new Error(errorMessage);
      
    } catch (error) {
      // Re-throw the error so it can be handled by the UI
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    // Clear all stored authentication data
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('creator_id');
    console.log('User logged out, tokens cleared');
  };

  const getAuthTokens = () => {
    return {
      accessToken: localStorage.getItem('access_token'),
      tokenType: localStorage.getItem('token_type'),
      refreshToken: localStorage.getItem('refresh_token'),
      creatorId: localStorage.getItem('creator_id'),
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        getAuthTokens,
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