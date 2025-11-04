/**
 * Utilitaire pour construire les URLs d'images
 * Gère les chemins relatifs et absolus pour le développement et la production
 */

/**
 * Obtient l'URL de base de l'API
 */
export const getApiBaseUrl = (): string => {
  // Si une variable d'environnement est définie, l'utiliser
  if (process.env.REACT_APP_API_URL) {
    // Retirer /api si présent car on l'ajoute après
    return process.env.REACT_APP_API_URL.replace(/\/api$/, '');
  }
  
  // En production, utiliser le même domaine (proxy ou serveur)
  // En développement, utiliser localhost:5000
  if (process.env.NODE_ENV === 'production') {
    // Si on est en production, utiliser le même domaine
    return window.location.origin;
  }
  
  // Par défaut en développement
  return 'http://localhost:5000';
};

/**
 * Construit l'URL complète d'une image/logo
 * @param logoPath - Le chemin du logo (peut être relatif ou absolu)
 * @returns L'URL complète de l'image
 */
export const getImageUrl = (logoPath: string | null | undefined): string | undefined => {
  if (!logoPath) {
    return undefined;
  }

  // Si c'est déjà une URL complète (http/https), la retourner telle quelle
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
    return logoPath;
  }

  // Si c'est un chemin relatif commençant par /uploads
  if (logoPath.startsWith('/uploads')) {
    const apiBaseUrl = getApiBaseUrl();
    return `${apiBaseUrl}${logoPath}`;
  }

  // Si c'est un chemin relatif sans /, ajouter /uploads
  if (!logoPath.startsWith('/')) {
    const apiBaseUrl = getApiBaseUrl();
    return `${apiBaseUrl}/uploads/${logoPath}`;
  }

  // Sinon, construire l'URL avec le base URL
  const apiBaseUrl = getApiBaseUrl();
  return `${apiBaseUrl}${logoPath}`;
};

