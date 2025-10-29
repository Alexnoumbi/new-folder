import api from './api';

export const ocrService = {
  extractText: async (file: File, entrepriseId?: string) => {
    const formData = new FormData();
    formData.append('image', file);
    
    // Ajouter l'entrepriseId si fourni
    if (entrepriseId) {
      formData.append('entrepriseId', entrepriseId);
    }

    const response = await api.post('/ocr/extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default ocrService;
