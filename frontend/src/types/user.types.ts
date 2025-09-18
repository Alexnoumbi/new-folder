export interface BaseUser {
    nom: string;
    prenom: string;
    email: string;
    role: 'user' | 'admin' | 'super_admin';
    typeCompte: 'admin' | 'entreprise';
    status: 'active' | 'inactive' | 'pending';
    telephone?: string;
    entreprise?: string;
}

export interface User extends BaseUser {
    id: string; // Changed from _id to match auth.types.ts
    createdAt?: string;
    updatedAt?: string;
    preferences?: UserPreferences;
    // Optional loaded entreprise details (added so useAuth can attach entreprise info)
    entrepriseDetails?: any;
    entrepriseId?: string;
}

export interface UserPreferences {
    darkMode?: boolean;
    language?: string;
    notifications?: {
        email?: boolean;
        sms?: boolean;
    };
}

export interface UserCreateData extends BaseUser {
    password?: string;
}

export interface UserUpdateData extends Partial<BaseUser> {
    currentPassword?: string;
    newPassword?: string;
    preferences?: Partial<UserPreferences>;
}

export interface UserProfileUpdateData extends UserUpdateData {}
