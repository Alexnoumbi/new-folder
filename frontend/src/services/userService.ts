import api from './api';
import type { User } from '../types/auth.types';

export interface UserProfile extends User {
  settings?: {
    notifications: boolean;
    theme: 'light' | 'dark';
    language: string;
  };
}

export type UserCreateData = Omit<User, '_id'>;
export type UserUpdateData = Partial<User>;

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const createUser = async (data: UserCreateData): Promise<User> => {
  const response = await api.post('/admin/users', data);
  return response.data;
};

export const updateUser = async (id: string, data: UserUpdateData): Promise<User> => {
  const response = await api.put(`/admin/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/admin/users/${id}`);
};

export const getUserProfile = async (userId?: string): Promise<UserProfile> => {
  const path = userId ? `/users/${userId}/profile` : '/users/profile';
  const response = await api.get(path);
  return response.data;
};

export const updateUserProfile = async (userId: string | undefined, data: Partial<UserProfile>): Promise<UserProfile> => {
  const path = userId ? `/users/${userId}/profile` : '/users/profile';
  const response = await api.put(path, data);
  return response.data;
};

export type { User }; // Re-export User type

export default {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile
};
