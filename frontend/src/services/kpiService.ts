import api from './api';
import { KPI, KPIFormData } from '../types/kpi.types';

export const getKPIs = async (): Promise<KPI[]> => {
    try {
        const response = await api.get('/kpis');
        return response.data?.data || [];
    } catch (error) {
        console.error('Erreur lors de la récupération des KPIs:', error);
        throw error;
    }
};

export const createKPI = async (data: KPIFormData): Promise<KPI> => {
    try {
        const response = await api.post('/kpis', data);
        return response.data?.data;
    } catch (error) {
        console.error('Erreur lors de la création du KPI:', error);
        throw error;
    }
};

export const updateKPI = async (id: string, data: Partial<KPIFormData>): Promise<KPI> => {
    try {
        const response = await api.put(`/kpis/${id}`, data);
        return response.data?.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du KPI:', error);
        throw error;
    }
};

export const deleteKPI = async (id: string): Promise<void> => {
    try {
        await api.delete(`/kpis/${id}`);
    } catch (error) {
        console.error('Erreur lors de la suppression du KPI:', error);
        throw error;
    }
};

export const getKPIHistory = async (kpiId: string): Promise<any[]> => {
    try {
        const response = await api.get(`/kpis/${kpiId}/history`);
        return response.data?.data || [];
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique:', error);
        throw error;
    }
};

export const submitKPIValue = async (kpiId: string, data: { value: number; comment?: string }): Promise<any> => {
    try {
        const response = await api.post(`/kpis/${kpiId}/submit`, data);
        return response.data?.data;
    } catch (error) {
        console.error('Erreur lors de la soumission de la valeur:', error);
        throw error;
    }
};

export const getEnterpriseKPIs = async (enterpriseId: string): Promise<KPI[]> => {
    try {
        const response = await api.get(`/kpis/enterprise/${enterpriseId}`);
        return response.data?.data || [];
    } catch (error) {
        console.error('Erreur lors de la récupération des KPIs de l\'entreprise:', error);
        throw error;
    }
};
