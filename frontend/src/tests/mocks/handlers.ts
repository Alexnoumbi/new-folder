import { http, HttpResponse } from 'msw';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/api/auth/login`, async ({ request }) => {
    const { email, password } = await request.json() as any;
    
    if (email === 'admin@test.com' && password === 'admin123') {
      return HttpResponse.json({
        success: true,
        message: 'Connexion réussie',
        data: {
          user: {
            id: 'admin-id',
            nom: 'Admin',
            prenom: 'User',
            email: 'admin@test.com',
            role: 'admin',
            typeCompte: 'admin'
          },
          token: 'mock-admin-token'
        }
      });
    }
    
    if (email === 'entreprise@test.com' && password === 'entreprise123') {
      return HttpResponse.json({
        success: true,
        message: 'Connexion réussie',
        data: {
          user: {
            id: 'entreprise-id',
            nom: 'Entreprise',
            prenom: 'User',
            email: 'entreprise@test.com',
            role: 'user',
            typeCompte: 'entreprise',
            entrepriseId: 'entreprise-data-id'
          },
          entreprise: {
            id: 'entreprise-data-id',
            identification: {
              nomEntreprise: 'Test Entreprise',
              region: 'Centre',
              ville: 'Yaoundé'
            },
            statut: 'Actif',
            conformite: 'Conforme'
          },
          token: 'mock-entreprise-token'
        }
      });
    }
    
    return HttpResponse.json(
      {
        success: false,
        message: 'Email ou mot de passe incorrect'
      },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE_URL}/api/auth/register`, async ({ request }) => {
    const { email, nom, prenom, typeCompte } = await request.json() as any;
    
    if (email === 'existing@test.com') {
      return HttpResponse.json(
        {
          success: false,
          message: 'Un utilisateur avec cet email existe déjà'
        },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        user: {
          id: 'new-user-id',
          nom,
          prenom,
          email,
          typeCompte,
          role: 'user'
        },
        token: 'mock-new-user-token'
      }
    }, { status: 201 });
  }),

  // Entreprises endpoints
  http.get(`${API_BASE_URL}/api/entreprises`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Non autorisé'
        },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'entreprise-1',
          identification: {
            nomEntreprise: 'Entreprise 1',
            region: 'Centre',
            ville: 'Yaoundé'
          },
          statut: 'Actif',
          conformite: 'Conforme'
        },
        {
          id: 'entreprise-2',
          identification: {
            nomEntreprise: 'Entreprise 2',
            region: 'Littoral',
            ville: 'Douala'
          },
          statut: 'En attente',
          conformite: 'Non vérifié'
        }
      ]
    });
  }),

  http.get(`${API_BASE_URL}/api/entreprises/:id`, ({ request, params }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Non autorisé'
        },
        { status: 401 }
      );
    }
    
    if (id === 'non-existent') {
      return HttpResponse.json(
        {
          success: false,
          message: 'Entreprise non trouvée'
        },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: {
        id,
        identification: {
          nomEntreprise: 'Test Entreprise',
          region: 'Centre',
          ville: 'Yaoundé'
        },
        statut: 'Actif',
        conformite: 'Conforme'
      }
    });
  }),

  http.put(`${API_BASE_URL}/api/entreprises/:id`, async ({ request, params }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization');
    const body = await request.json();
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Non autorisé'
        },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      message: 'Entreprise mise à jour avec succès',
      data: {
        id,
        ...(body as any)
      }
    });
  }),

  // Dashboard endpoints
  http.get(`${API_BASE_URL}/api/dashboard/admin`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Non autorisé'
        },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: {
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
      }
    });
  }),

  http.get(`${API_BASE_URL}/api/dashboard/enterprise/:id`, ({ request, params }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Non autorisé'
        },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: {
        entreprise: {
          id,
          nomEntreprise: 'Mon Entreprise',
          statut: 'Actif',
          conformite: 'Conforme'
        },
        kpis: [
          { nom: 'Chiffre d\'affaires', valeur: 1000000, unite: 'FCFA' },
          { nom: 'Employés', valeur: 25, unite: 'personnes' }
        ],
        messages: [
          { id: '1', sujet: 'Message important', lu: false },
          { id: '2', sujet: 'Rapport mensuel', lu: true }
        ]
      }
    });
  }),

  // Messages endpoints
  http.get(`${API_BASE_URL}/api/messages/:id`, ({ request, params }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Non autorisé'
        },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: [
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
      ]
    });
  }),

  // Reports endpoints
  http.get(`${API_BASE_URL}/api/reports/enterprise/:id`, ({ request, params }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Non autorisé'
        },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: [
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
      ]
    });
  })
];