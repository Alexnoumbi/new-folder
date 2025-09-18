// Types pour l'authentification
export interface AuthHeaders {
    Authorization?: string;
    'Content-Type': string;
}

export interface UserSession {
    id: string;
    email: string;
    role: string;
}

// Fonction pour obtenir la session utilisateur depuis sessionStorage
export const getSession = (): UserSession | null => {
    const sessionData = sessionStorage.getItem('user');
    return sessionData ? JSON.parse(sessionData) : null;
};

// Fonction pour sauvegarder la session utilisateur
export const saveSession = (session: UserSession): void => {
    sessionStorage.setItem('user', JSON.stringify(session));
};

// Fonction pour supprimer la session utilisateur
export const clearSession = (): void => {
    sessionStorage.removeItem('user');
};

// Fonction pour vérifier si l'utilisateur est authentifié
export const isAuthenticated = (): boolean => {
    return !!getSession();
};

// Helper pour obtenir les headers d'authentification
export const getAuthHeaders = (): AuthHeaders => {
    return {
        'Content-Type': 'application/json'
    };
};
