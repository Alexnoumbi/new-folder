import api from './api';
import { AdminStats } from '../types/admin.types';

export const getDashboardStats = async (): Promise<AdminStats> => {
    try {
        const response = await api.get('/admin/stats');
        console.log('Response from API:', response);
        return response.data.data;
    } catch (error: any) {
        console.error('Dashboard error:', error);
        throw error;
    }
};

export type EntrepriseEvolutionPoint = { month: string; count: number };

export const getEntreprisesEvolution = async (start?: string): Promise<EntrepriseEvolutionPoint[]> => {
    const response = await api.get('/admin/entreprises/evolution', {
        params: start ? { start } : undefined
    });
    return response.data.data as EntrepriseEvolutionPoint[];
};
