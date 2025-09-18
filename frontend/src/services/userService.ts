import api from './api';
import type { User, UserCreateData, UserUpdateData } from '../types/user.types';

export type { User, UserCreateData, UserUpdateData };

// User management functions
export const getUsers = async (search?: string, role?: string, typeCompte?: string): Promise<User[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    if (typeCompte) params.append('typeCompte', typeCompte);

    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
};

export const getUserById = async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};

export const createUser = async (userData: UserCreateData): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data;
};

export const updateUser = async (id: string, userData: UserUpdateData): Promise<User> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
};

export const deleteUser = async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
};

const userService = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};

export default userService;
