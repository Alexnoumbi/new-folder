import api from './api';
import { SecurityAlert, SecurityStatus } from '../types/security.types';
import { ComplianceStatus } from '../types/kpi.types';
import { PortfolioStats } from '../types/reports.types';
import { SystemInfo } from '../types/system.types';
import { AdminStats } from '../types/admin.types';
import { AuditLog } from '../types/audit.types';

export type { AdminStats, AuditLog };

export const getAdminStats = async (): Promise<AdminStats> => {
    try {
        const response = await api.get('/stats');
        return response.data.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques admin:', error);
        throw error;
    }
};

export const getRecentActivity = async (): Promise<AdminStats['dernieresActivites']> => {
    try {
        const response = await api.get('/admin/activity');
        return response.data.data;
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'activité récente:', error);
        throw error;
    }
};

export const getAuditLogs = async (): Promise<AuditLog[]> => {
    try {
        const response = await api.get('/admin/audit');
        return response.data.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des logs d\'audit:', error);
        throw error;
    }
};

export const getSecurityAlerts = async (): Promise<SecurityAlert[]> => {
    try {
        const response = await api.get('/admin/security/alerts');
        return response.data.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des alertes de sécurité:', error);
        throw error;
    }
};

export const getSecurityStatus = async (): Promise<SecurityStatus> => {
    try {
        const response = await api.get('/admin/security/status');
        return response.data.data;
    } catch (error) {
        console.error('Erreur lors de la récupération du statut de sécurité:', error);
        throw error;
    }
};

export const getComplianceStatus = async (): Promise<ComplianceStatus> => {
    try {
        const response = await api.get('/admin/compliance/status');
        return response.data.data;
    } catch (error) {
        console.error('Erreur lors de la récupération du statut de conformité:', error);
        throw error;
    }
};

export const getPortfolioStats = async (): Promise<PortfolioStats> => {
    try {
        const response = await api.get('/admin/portfolio/stats');
        return response.data.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques du portfolio:', error);
        throw error;
    }
};

export const getSystemInfo = async (): Promise<SystemInfo> => {
    try {
        const response = await api.get('/system/info');
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des informations système:', error);
        throw error;
    }
};