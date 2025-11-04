/**
 * Utilitaire pour construire les URLs d'images
 * Gère les chemins relatifs et absolus pour le développement et la production
 */

/**
 * Obtient l'URL de base du serveur (sans /api)
 * Les uploads sont servis via /api/uploads
 */
export const getApiBaseUrl = (): string => {
  // Si une variable d'environnement est définie, l'utiliser
  if (process.env.REACT_APP_API_URL) {
    // Retirer /api si présent pour obtenir la base
    const url = process.env.REACT_APP_API_URL.replace(/\/api$/, '');
    if (url) {
      return url;
    }
  }
  
  // Vérifier si window est disponible (côté client)
  if (typeof window !== 'undefined') {
    // Si on est en développement local (localhost ou 127.0.0.1)
    if (window.location.origin.includes('localhost') || 
        window.location.origin.includes('127.0.0.1') ||
        window.location.port === '3000') {
      // En développement local - utiliser le serveur backend
      return 'http://localhost:5000';
    } else {
      // En production - utiliser le même domaine
      return window.location.origin;
    }
  }
  
  // Fallback pour SSR (ne devrait pas arriver)
  return 'http://localhost:5000';
};

/**
 * Construit l'URL complète d'une image/logo
 * @param logoPath - Le chemin du logo (peut être relatif ou absolu)
 * @returns L'URL complète de l'image
 */
export const getImageUrl = (logoPath: string | null | undefined): string | undefined => {
  if (!logoPath) {
    console.log('[getImageUrl] Logo path est null/undefined');
    return undefined;
  }

  console.log('[getImageUrl] Logo path reçu:', logoPath);

  // Si c'est déjà une URL complète (http/https), la retourner telle quelle
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
    console.log('[getImageUrl] URL complète détectée:', logoPath);
    return logoPath;
  }

  // Obtenir l'URL de base du serveur (sans /api)
  const baseUrl = getApiBaseUrl();
  console.log('[getImageUrl] Base URL:', baseUrl);

  // Si c'est déjà un chemin /api/uploads, utiliser directement
  if (logoPath.startsWith('/api/uploads')) {
    const fullUrl = `${baseUrl}${logoPath}`;
    console.log('[getImageUrl] ✅ URL construite (déjà /api/uploads):', fullUrl);
    return fullUrl;
  }

  // Si c'est un chemin relatif commençant par /uploads, remplacer par /api/uploads
  if (logoPath.startsWith('/uploads')) {
    const apiPath = logoPath.replace(/^\/uploads/, '/api/uploads');
    const fullUrl = `${baseUrl}${apiPath}`;
    console.log('[getImageUrl] ✅ URL construite (convertie /uploads → /api/uploads):', fullUrl, 'depuis:', logoPath);
    return fullUrl;
  }

  // Si c'est un chemin relatif sans /, ajouter /api/uploads
  if (!logoPath.startsWith('/')) {
    const fullUrl = `${baseUrl}/api/uploads/${logoPath}`;
    console.log('[getImageUrl] ✅ URL construite (ajout /api/uploads):', fullUrl);
    return fullUrl;
  }

  // Sinon, construire l'URL avec le base URL
  const fullUrl = `${baseUrl}${logoPath}`;
  console.log('[getImageUrl] ⚠️ URL construite (chemin non standard):', fullUrl, 'depuis:', logoPath);
  return fullUrl;
};
