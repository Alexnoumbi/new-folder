import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// Supprimer complètement l'intercepteur d'authentification
// Plus besoin d'ajouter le token aux requêtes

export default api;
