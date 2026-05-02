import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  sex: string | null;
  phoneNumber: string | null;
  location: string | null;
  photoUrl: string | null;
  isAdmin: boolean;
  preferredLanguage: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  accountVerified: boolean | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  token: string | null;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    sex: string,
    phoneNumber: string,
    location: string,
    photo: File | null,
    referralCode?: string
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('auth_token');
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setToken(storedToken);
        loadProfile(userData.id, storedToken);
      } catch {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const loadProfile = async (userId: string, authToken: string) => {
    try {
      const response = await fetch(`/api/profile/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
    setLoading(false);
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    sex: string,
    phoneNumber: string,
    location: string,
    _photo: File | null,
    referralCode?: string
  ) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        fullName,
        sex: sex || undefined,
        phoneNumber: phoneNumber || undefined,
        location: location || undefined,
        referralCode: referralCode || undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    const data = await response.json();
    const userData = { id: data.profile.id, email: data.profile.email };
    localStorage.setItem('auth_user', JSON.stringify(userData));
    localStorage.setItem('auth_token', data.token);
    setUser(userData);
    setToken(data.token);
    setProfile(data.profile);
  };

  const signIn = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    const userData = { id: data.profile.id, email: data.profile.email };
    localStorage.setItem('auth_user', JSON.stringify(userData));
    localStorage.setItem('auth_token', data.token);
    setUser(userData);
    setToken(data.token);
    setProfile(data.profile);
  };

  const signOut = async () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    setUser(null);
    setToken(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user && token) {
      await loadProfile(user.id, token);
    }
  };

  const value = {
    user,
    profile,
    loading,
    token,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
