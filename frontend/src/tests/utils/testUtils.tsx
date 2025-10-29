import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { store } from '../../store/store';
import modernTheme from '../../theme/modernTheme';

// Mock store for testing
const createMockStore = (initialState = {}) => {
  return {
    ...store,
    getState: () => ({
      ...store.getState(),
      ...initialState
    }),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    replaceReducer: jest.fn()
  };
};

// Custom render function with providers
const AllTheProviders = ({ children, initialState = {} }: { 
  children: React.ReactNode; 
  initialState?: any;
}) => {
  const mockStore = createMockStore(initialState);
  
  return (
    <Provider store={mockStore}>
      <BrowserRouter>
        <ThemeProvider theme={modernTheme}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            {children}
          </LocalizationProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialState?: any }
) => render(ui, { wrapper: ({ children }) => AllTheProviders({ children, initialState: options?.initialState }), ...options });

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  nom: 'Test',
  prenom: 'User',
  email: 'test@example.com',
  role: 'user',
  typeCompte: 'entreprise',
  entrepriseId: 'test-entreprise-id'
};

export const mockAdminUser = {
  id: 'test-admin-id',
  nom: 'Admin',
  prenom: 'User',
  email: 'admin@example.com',
  role: 'admin',
  typeCompte: 'admin'
};

export const mockEntreprise = {
  id: 'test-entreprise-id',
  identification: {
    nomEntreprise: 'Test Entreprise',
    region: 'Centre',
    ville: 'Yaoundé'
  },
  statut: 'Actif',
  conformite: 'Conforme'
};

// Mock auth state
export const mockAuthState = {
  auth: {
    user: mockUser,
    token: 'mock-token',
    isAuthenticated: true,
    loading: false,
    error: null
  }
};

export const mockAdminAuthState = {
  auth: {
    user: mockAdminUser,
    token: 'mock-admin-token',
    isAuthenticated: true,
    loading: false,
    error: null
  }
};

// Mock entreprise state
export const mockEntrepriseState = {
  entreprise: {
    current: mockEntreprise,
    loading: false,
    error: null
  }
};

// Mock dashboard data
export const mockAdminDashboardData = {
  totalEntreprises: 150,
  entreprisesActives: 120,
  entreprisesEnAttente: 30,
  totalUtilisateurs: 200,
  conformiteMoyenne: 85,
  statistiques: {
    parRegion: [
      { region: 'Centre', count: 50 },
      { region: 'Littoral', count: 40 },
      { region: 'Nord', count: 30 }
    ],
    parSecteur: [
      { secteur: 'Tertiaire', count: 80 },
      { secteur: 'Secondaire', count: 50 },
      { secteur: 'Primaire', count: 20 }
    ]
  }
};

export const mockEnterpriseDashboardData = {
  entreprise: mockEntreprise,
  kpis: [
    { nom: 'Chiffre d\'affaires', valeur: 1000000, unite: 'FCFA' },
    { nom: 'Employés', valeur: 25, unite: 'personnes' }
  ],
  messages: [
    { id: '1', sujet: 'Message important', lu: false },
    { id: '2', sujet: 'Rapport mensuel', lu: true }
  ]
};

// Mock messages data
export const mockMessages = [
  {
    id: '1',
    sujet: 'Mise à jour des informations',
    contenu: 'Veuillez mettre à jour vos informations d\'entreprise.',
    type: 'information',
    lu: false,
    date: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    sujet: 'Rapport mensuel',
    contenu: 'Votre rapport mensuel est disponible.',
    type: 'rapport',
    lu: true,
    date: '2024-01-10T14:30:00Z'
  }
];

// Mock reports data
export const mockReports = [
  {
    id: 'report-1',
    nom: 'Rapport Mensuel',
    type: 'mensuel',
    date: '2024-01-15',
    statut: 'disponible'
  },
  {
    id: 'report-2',
    nom: 'Rapport Trimestriel',
    type: 'trimestriel',
    date: '2024-01-01',
    statut: 'en_cours'
  }
];

// Helper functions
export const createMockStoreWithState = (state: any) => {
  return {
    ...store,
    getState: () => state,
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    replaceReducer: jest.fn()
  };
};

export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

// Mock localStorage
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Mock sessionStorage
export const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Setup localStorage mock
beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });
  
  Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true
  });
});

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

