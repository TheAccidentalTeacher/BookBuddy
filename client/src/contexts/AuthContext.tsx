import React, { createContext, useContext, useReducer } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  settings: {
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    colorScheme: 'light' | 'dark' | 'high-contrast';
    lineSpacing: 'normal' | 'relaxed' | 'loose';
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction = { type: 'UPDATE_USER'; payload: Partial<User> };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for single-user mode (Alana Terry)
const mockUser: User = {
  id: 'alana-terry',
  username: 'Alana Terry',
  email: 'alana@example.com',
  settings: {
    fontSize: 'medium',
    colorScheme: 'light',
    lineSpacing: 'normal',
  },
};

const initialState: AuthState = {
  user: mockUser,
  token: 'mock-token',
  isLoading: false,
  isAuthenticated: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : state.user,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Simple mock functions for single-user mode
  const login = async (email: string, password: string) => {
    return Promise.resolve();
  };

  const register = async (username: string, email: string, password: string) => {
    return Promise.resolve();
  };

  const logout = () => {
    // No-op for single user mode
  };

  const updateUser = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
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
