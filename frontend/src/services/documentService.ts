import api from './api';

export interface Document {
  id: string;
  type: string;
  required: boolean;
  dueDate: string;
  status: 'RECEIVED' | 'WAITING' | 'EXPIRED' | 'UPDATE_REQUIRED';
  files: Array<{ name: string; url: string }>;
  uploadedAt?: string;
  validatedBy?: string;
}

export const getDocuments = async (companyId?: string): Promise<Document[]> => {
  if (!companyId) return [];
  const response = await api.get(`/documents/company/${companyId}`);
  return response.data;
};

const documentService = {
  getCompanyDocuments: async (companyId: string): Promise<Document[]> => {
    const response = await api.get(`/documents/company/${companyId}`);
    return response.data;
  },

  uploadDocument: async (companyId: string, documentType: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', documentType);

    const response = await api.post(`/documents/company/${companyId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  validateDocument: async (documentId: string, status: Document['status'], comment?: string) => {
    const response = await api.put(`/documents/${documentId}/validate`, {
      status,
      comment,
    });
    return response.data;
  },

  getDocumentTypes: async () => {
    const response = await api.get('/documents/types');
    return response.data;
  },

  deleteDocument: async (documentId: string) => {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  }
};

export default documentService;
