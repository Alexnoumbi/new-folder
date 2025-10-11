import axios from 'axios';
import { ReportTemplate, CreateTemplateData } from '../types/reportTemplate.types';

const BASE_URL = 'http://localhost:5000/api/enhanced-reports';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getTemplates = async (type?: string, format?: string): Promise<ReportTemplate[]> => {
  const params: any = {};
  if (type) params.type = type;
  if (format) params.format = format;
  
  const response = await axios.get(`${BASE_URL}/templates`, {
    params,
    headers: getAuthHeaders()
  });
  return response.data.data || response.data || [];
};

export const createTemplate = async (data: CreateTemplateData): Promise<ReportTemplate> => {
  const response = await axios.post(`${BASE_URL}/templates`, data, {
    headers: getAuthHeaders()
  });
  return response.data.data;
};

export const updateTemplate = async (id: string, data: Partial<CreateTemplateData>): Promise<ReportTemplate> => {
  const response = await axios.put(`${BASE_URL}/templates/${id}`, data, {
    headers: getAuthHeaders()
  });
  return response.data.data;
};

export const deleteTemplate = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/templates/${id}`, {
    headers: getAuthHeaders()
  });
};

export const duplicateTemplate = async (id: string): Promise<ReportTemplate> => {
  const response = await axios.post(`${BASE_URL}/templates/${id}/duplicate`, {}, {
    headers: getAuthHeaders()
  });
  return response.data.data;
};

export const generateFromTemplate = async (id: string): Promise<any> => {
  const response = await axios.post(`${BASE_URL}/templates/${id}/generate`, {}, {
    headers: getAuthHeaders()
  });
  return response.data.data;
};

