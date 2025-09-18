import api from './api';

export const ocrService = {
  extractText: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/ocr/extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default ocrService;
