import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  login: (email: string, pass: string, phone?: string) => Promise<void>;
  register: (userData: Partial<User>) => Promise<User>;
  updateProfile: (userData: Partial<User>) => Promise<User>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  awardPoints: (points: number, reason: string) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initUser = async () => {
      try {
        const u = await authApi.getCurrentUser();
        setUser(u);
      } catch (err) {
        console.error('Failed to load user', err);
      } finally {
        setLoading(false);
      }
    };
    initUser();
  }, []);

  const login = async (email: string, pass: string, phone?: string) => {
    const res = await authApi.login(email, pass, phone);
    setUser(res.user);
  };

  const register = async (userData: Partial<User>) => {
    const newUser = await authApi.register(userData);
    setUser(newUser);
    return newUser;
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return user as any;
    const updated = await authApi.updateProfile(user.id, userData);
    setUser({ ...updated });
    return updated;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    const u = authApi.switchRoleUser(newRole);
    setUser({ ...u });
  };

  const awardPoints = (amount: number, reason: string) => {
    if (!user) return;
    const updated = { ...user, points: (user.points || 0) + amount };
    setUser(updated);
    localStorage.setItem('es_current_user', JSON.stringify(updated));
    console.log(`Awarded +${amount} points for: ${reason}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'ATTENDEE',
        login,
        register,
        updateProfile,
        logout,
        switchRole,
        awardPoints,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
