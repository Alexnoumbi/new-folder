import api from './api';
import { ComplianceStatus } from '../types/compliance.types';

const BASE_URL = '/admin/audit/compliance';

export const getComplianceStatus = async (): Promise<ComplianceStatus> => {
    try {
        const response = await api.get(`${BASE_URL}`);
        return response.data;
    } catch (error: any) {
        console.error('Erreur lors de la récupération du statut de conformité:', error);
        throw error;
    }
};
