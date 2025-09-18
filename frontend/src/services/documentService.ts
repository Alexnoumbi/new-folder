import api from './api';

export interface Document {
  id?: string;
  _id?: string;
  type: string;
  required: boolean;
  dueDate: string;
  status: 'RECEIVED' | 'WAITING' | 'EXPIRED' | 'UPDATE_REQUIRED' | 'VALIDATED';
  files: Array<{ name: string; url: string; uploadedAt?: string }>;
  uploadedAt?: string;
  validatedBy?: string;
}

export const getDocuments = async (): Promise<Document[]> => {
  const response = await api.get(`/documents`);
  return response.data;
};

const documentService = {
  getDocuments,

  uploadDocument: async (documentType: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', documentType);

    const response = await api.post(`/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as Document;
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
