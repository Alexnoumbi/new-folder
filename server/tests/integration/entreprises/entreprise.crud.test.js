const request = require('supertest');
const app = require('../../testServer');
const User = require('../../../models/User');
const Entreprise = require('../../../models/Entreprise');
const { createAuthToken } = require('../../helpers/testHelpers');

describe('Tests d\'Intégration CRUD Entreprise', () => {
  let authToken;
  let adminUser;
  let entrepriseUser;
  let entreprise;

  beforeEach(async () => {
    // Clear database before each test
    await User.deleteMany({});
    await Entreprise.deleteMany({});

    // Create admin user
    adminUser = await User.create({
      nom: 'Admin',
      prenom: 'User',
      email: 'admin@test.com',
      motDePasse: 'admin123',
      role: 'admin',
      typeCompte: 'admin'
    });

    // Create entreprise user
    entrepriseUser = await User.create({
      nom: 'Entreprise',
      prenom: 'User',
      email: 'entreprise@test.com',
      motDePasse: 'entreprise123',
      role: 'user',
      typeCompte: 'entreprise'
    });

    // Create test entreprise
    entreprise = await Entreprise.create({
      identification: {
        nomEntreprise: 'Test Entreprise',
        region: 'Centre',
        ville: 'Yaoundé',
        dateCreation: new Date(),
        secteurActivite: 'Tertiaire',
        sousSecteur: 'Autres',
        formeJuridique: 'EI',
        numeroContribuable: 'TEST123'
      },
      contact: {
        email: 'test@entreprise.com'
      },
      investissementEmploi: {
        effectifsEmployes: 10
      }
    });

    // Link entreprise to user
    entrepriseUser.entrepriseId = entreprise._id;
    await entrepriseUser.save();

    authToken = createAuthToken(adminUser._id, 'admin');
  });

  describe('GET /api/entreprises', () => {
    it('devrait obtenir toutes les entreprises pour l\'administrateur', async () => {
      const response = await request(app)
        .get('/api/entreprises')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('devrait filtrer les entreprises par statut', async () => {
      // Create entreprise with different statut
      await Entreprise.create({
        identification: {
          nomEntreprise: 'Inactive Entreprise',
          region: 'Centre',
          ville: 'Yaoundé',
          dateCreation: new Date(),
          secteurActivite: 'Tertiaire',
          sousSecteur: 'Autres',
          formeJuridique: 'EI',
          numeroContribuable: 'INACTIVE123'
        },
        contact: {
          email: 'inactive@test.com'
        },
        statut: 'Inactif',
        investissementEmploi: {
          effectifsEmployes: 5
        }
      });

      const response = await request(app)
        .get('/api/entreprises?statut=En attente')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(ent => ent.statut === 'En attente')).toBe(true);
    });

    it('devrait filtrer les entreprises par région', async () => {
      const response = await request(app)
        .get('/api/entreprises?region=Centre')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every(ent => ent.identification.region === 'Centre')).toBe(true);
    });

    it('devrait exiger une authentification', async () => {
      const response = await request(app)
        .get('/api/entreprises')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Non autorisé');
    });

    it('devrait exiger le rôle administrateur', async () => {
      const userToken = createAuthToken(entrepriseUser._id, 'user');
      
      const response = await request(app)
        .get('/api/entreprises')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Accès refusé');
    });
  });

  describe('GET /api/entreprises/:id', () => {
    it('devrait obtenir une entreprise par ID pour l\'administrateur', async () => {
      const response = await request(app)
        .get(`/api/entreprises/${entreprise._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(entreprise._id.toString());
      expect(response.body.data.identification.nomEntreprise).toBe('Test Entreprise');
    });

    it('devrait obtenir sa propre entreprise pour l\'utilisateur entreprise', async () => {
      const userToken = createAuthToken(entrepriseUser._id, 'user');
      
      const response = await request(app)
        .get(`/api/entreprises/${entreprise._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(entreprise._id.toString());
    });

    it('ne devrait pas permettre à un utilisateur entreprise d\'accéder à d\'autres entreprises', async () => {
      // Create another entreprise
      const otherEntreprise = await Entreprise.create({
        identification: {
          nomEntreprise: 'Other Entreprise',
          region: 'Centre',
          ville: 'Yaoundé',
          dateCreation: new Date(),
          secteurActivite: 'Tertiaire',
          sousSecteur: 'Autres',
          formeJuridique: 'EI',
          numeroContribuable: 'OTHER123'
        },
        contact: {
          email: 'other@test.com'
        },
        investissementEmploi: {
          effectifsEmployes: 8
        }
      });

      const userToken = createAuthToken(entrepriseUser._id, 'user');
      
      const response = await request(app)
        .get(`/api/entreprises/${otherEntreprise._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Accès refusé');
    });

    it('devrait retourner 404 pour une entreprise inexistante', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/entreprises/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Entreprise non trouvée');
    });
  });

  describe('PUT /api/entreprises/:id', () => {
    it('devrait mettre à jour une entreprise pour l\'administrateur', async () => {
      const updateData = {
        identification: {
          nomEntreprise: 'Updated Entreprise Name',
          region: 'Littoral',
          ville: 'Douala'
        },
        statut: 'Actif'
      };

      const response = await request(app)
        .put(`/api/entreprises/${entreprise._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.identification.nomEntreprise).toBe('Updated Entreprise Name');
      expect(response.body.data.identification.region).toBe('Littoral');
      expect(response.body.data.statut).toBe('Actif');
    });

    it('devrait mettre à jour sa propre entreprise pour l\'utilisateur entreprise', async () => {
      const updateData = {
        identification: {
          nomEntreprise: 'My Updated Entreprise'
        }
      };

      const userToken = createAuthToken(entrepriseUser._id, 'user');
      
      const response = await request(app)
        .put(`/api/entreprises/${entreprise._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.identification.nomEntreprise).toBe('My Updated Entreprise');
    });

    it('ne devrait pas permettre à un utilisateur entreprise de mettre à jour d\'autres entreprises', async () => {
      const otherEntreprise = await Entreprise.create({
        identification: {
          nomEntreprise: 'Other Entreprise',
          region: 'Centre',
          ville: 'Yaoundé',
          dateCreation: new Date(),
          secteurActivite: 'Tertiaire',
          sousSecteur: 'Autres',
          formeJuridique: 'EI',
          numeroContribuable: 'OTHER123'
        },
        contact: {
          email: 'other@test.com'
        },
        investissementEmploi: {
          effectifsEmployes: 8
        }
      });

      const updateData = {
        identification: {
          nomEntreprise: 'Hacked Name'
        }
      };

      const userToken = createAuthToken(entrepriseUser._id, 'user');
      
      const response = await request(app)
        .put(`/api/entreprises/${otherEntreprise._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('devrait valider les champs obligatoires', async () => {
      const updateData = {
        identification: {
          nomEntreprise: '', // Empty name should fail
          region: 'Invalid Region' // Invalid region should fail
        }
      };

      const response = await request(app)
        .put(`/api/entreprises/${entreprise._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/entreprises', () => {
    it('devrait créer une nouvelle entreprise pour l\'administrateur', async () => {
      const newEntrepriseData = {
        identification: {
          nomEntreprise: 'New Entreprise',
          region: 'Centre',
          ville: 'Yaoundé',
          dateCreation: new Date(),
          secteurActivite: 'Tertiaire',
          sousSecteur: 'Autres',
          formeJuridique: 'SARL',
          numeroContribuable: 'NEW123'
        },
        contact: {
          email: 'new@entreprise.com'
        },
        investissementEmploi: {
          effectifsEmployes: 15
        }
      };

      const response = await request(app)
        .post('/api/entreprises')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newEntrepriseData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.identification.nomEntreprise).toBe('New Entreprise');
      expect(response.body.data.statut).toBe('En attente');
    });

    it('ne devrait pas permettre à un utilisateur entreprise de créer des entreprises', async () => {
      const newEntrepriseData = {
        identification: {
          nomEntreprise: 'Unauthorized Entreprise',
          region: 'Centre',
          ville: 'Yaoundé',
          dateCreation: new Date(),
          secteurActivite: 'Tertiaire',
          sousSecteur: 'Autres',
          formeJuridique: 'EI',
          numeroContribuable: 'UNAUTH123'
        },
        contact: {
          email: 'unauth@test.com'
        },
        investissementEmploi: {
          effectifsEmployes: 20
        }
      };

      const userToken = createAuthToken(entrepriseUser._id, 'user');
      
      const response = await request(app)
        .post('/api/entreprises')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newEntrepriseData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('devrait valider les champs obligatoires pour la création', async () => {
      const incompleteData = {
        identification: {
          nomEntreprise: 'Incomplete Entreprise'
          // Missing required fields
        }
      };

      const response = await request(app)
        .post('/api/entreprises')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/entreprises/:id', () => {
    it('devrait supprimer une entreprise pour l\'administrateur', async () => {
      const response = await request(app)
        .delete(`/api/entreprises/${entreprise._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Entreprise supprimée');

      // Verify entreprise is deleted
      const deletedEntreprise = await Entreprise.findById(entreprise._id);
      expect(deletedEntreprise).toBeNull();
    });

    it('ne devrait pas permettre à un utilisateur entreprise de supprimer des entreprises', async () => {
      const userToken = createAuthToken(entrepriseUser._id, 'user');
      
      const response = await request(app)
        .delete(`/api/entreprises/${entreprise._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('devrait retourner 404 pour une entreprise inexistante lors de la suppression', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/api/entreprises/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
