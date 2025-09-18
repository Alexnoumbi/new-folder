import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setUser as setUserAction, clearUser as clearUserAction } from '../store/slices/userSlice';
import { login as loginService, logout as logoutService, getCurrentUser } from '../services/authService';
import type { User } from '../types/user.types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const [user, _setUser] = useState<User | null>(getCurrentUser());
  const [loading, setLoading] = useState(true);

  const setUser = useCallback((userData: User | null) => {
    _setUser(userData);
    if (userData) {
      dispatch(setUserAction(userData));
    } else {
      dispatch(clearUserAction());
    }
  }, [dispatch]);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId');

    if (userEmail && userId) {
      setUser(getCurrentUser());
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await loginService({ email, password });
      setUser(response.user);
      // persist user data
      try { localStorage.setItem('user', JSON.stringify(response.user)); } catch {}
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutService();
    setUser(null);
    // remove user data from local storage
    try { localStorage.removeItem('user'); } catch {}
  }, []);

  const updateUserData = useCallback((newData: any) => {
    if (user) {
      const updatedUser = { ...user, ...newData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  }, [user]);

  return {
    user,
    setUser,
    loading,
    login,
    logout,
    updateUserData,
    isAuthenticated: !!user,
    dispatch
  };
};
