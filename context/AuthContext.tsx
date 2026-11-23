import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { type User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  location: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (details: { name: string; email: string; location: string }) => Promise<boolean>;
  updateLocation: (location: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const generateInitialsAvatar = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : (parts[0]?.slice(0, 2) || 'LA').toUpperCase();

  const safeInitials = initials.replace(/[^A-Z0-9]/g, '') || 'LA';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" rx="40" fill="#2563eb"/><text x="40" y="42" dominant-baseline="central" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="600">${safeInitials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false, location: null, isLoading: false, error: null };
  }
  try {
    const storedAuth = localStorage.getItem('lexilaw_auth');
    if (storedAuth) {
      const { user, isAuthenticated, location } = JSON.parse(storedAuth);
      if (isAuthenticated && user && location) {
        const sanitizedUser: User = {
          ...user,
          avatar: user.avatar?.startsWith('data:image/svg+xml')
            ? user.avatar
            : generateInitialsAvatar(user.name || 'User'),
        };
        return { user: sanitizedUser, isAuthenticated, location, isLoading: false, error: null };
      }
    }
  } catch (error) {
    console.error('Failed to load auth state from localStorage', error);
  }
  return { user: null, isAuthenticated: false, location: null, isLoading: false, error: null };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(getInitialState);

  useEffect(() => {
    try {
      const { isLoading, error, ...persistableState } = state;
      if (persistableState.isAuthenticated) {
        localStorage.setItem('lexilaw_auth', JSON.stringify(persistableState));
      } else {
        localStorage.removeItem('lexilaw_auth');
      }
    } catch (error) {
      console.error('Failed to save auth state to localStorage', error);
    }
  }, [state]);

  const login = (details: { name: string; email: string; location: string }): Promise<boolean> => {
    return new Promise((resolve) => {
      setState(s => ({ ...s, isLoading: true, error: null }));

      const user: User = {
        name: details.name.trim(),
        email: details.email.trim(),
        avatar: generateInitialsAvatar(details.name),
      };

      setState({
        user,
        location: details.location.trim(),
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      resolve(true);
    });
  };

  const updateLocation = (newLocation: string) => {
    const trimmed = newLocation.trim();
    if (!trimmed) return;
    setState(s => ({ ...s, location: trimmed }));
  };

  const logout = () => {
    setState({
      user: null,
      isAuthenticated: false,
      location: null,
      isLoading: false,
      error: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, updateLocation, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};