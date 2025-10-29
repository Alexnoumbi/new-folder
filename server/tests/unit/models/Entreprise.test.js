const mongoose = require('mongoose');
const Entreprise = require('../../../models/Entreprise');

describe('Entreprise Model', () => {
  beforeEach(async () => {
    // Clear database before each test
    await Entreprise.deleteMany({});
  });

  describe('Schema Validation', () => {
  it('should create a valid entreprise with minimal data', async () => {
    const entrepriseData = {
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
    };

      const entreprise = new Entreprise(entrepriseData);
      const savedEntreprise = await entreprise.save();

      expect(savedEntreprise._id).toBeDefined();
      expect(savedEntreprise.identification.nomEntreprise).toBe(entrepriseData.identification.nomEntreprise);
      expect(savedEntreprise.contact.email).toBe(entrepriseData.contact.email);
    });

    it('should require nomEntreprise', async () => {
      const entrepriseData = {
        identification: {
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
        }
      };

      const entreprise = new Entreprise(entrepriseData);
      await expect(entreprise.save()).rejects.toThrow('Le nom de l\'entreprise est requis');
    });

    it('should require region', async () => {
      const entrepriseData = {
        identification: {
          nomEntreprise: 'Test Entreprise',
          ville: 'Yaoundé',
          dateCreation: new Date(),
          secteurActivite: 'Tertiaire',
          sousSecteur: 'Autres',
          formeJuridique: 'EI',
          numeroContribuable: 'TEST123'
        },
        contact: {
          email: 'test@entreprise.com'
        }
      };

      const entreprise = new Entreprise(entrepriseData);
      await expect(entreprise.save()).rejects.toThrow('La région est requise');
    });

    it('should validate region enum', async () => {
      const entrepriseData = {
        identification: {
          nomEntreprise: 'Test Entreprise',
          region: 'Invalid Region',
          ville: 'Yaoundé',
          dateCreation: new Date(),
          secteurActivite: 'Tertiaire',
          sousSecteur: 'Autres',
          formeJuridique: 'EI',
          numeroContribuable: 'TEST123'
        },
        contact: {
          email: 'test@entreprise.com'
        }
      };

      const entreprise = new Entreprise(entrepriseData);
      await expect(entreprise.save()).rejects.toThrow('`Invalid Region` is not a valid enum value');
    });

    it('should require ville', async () => {
      const entrepriseData = {
        identification: {
          nomEntreprise: 'Test Entreprise',
          region: 'Centre',
          dateCreation: new Date(),
          secteurActivite: 'Tertiaire',
          sousSecteur: 'Autres',
          formeJuridique: 'EI',
          numeroContribuable: 'TEST123'
        },
        contact: {
          email: 'test@entreprise.com'
        }
      };

      const entreprise = new Entreprise(entrepriseData);
      await expect(entreprise.save()).rejects.toThrow('La ville est requise');
    });

    it('should require dateCreation', async () => {
      const entrepriseData = {
        identification: {
          nomEntreprise: 'Test Entreprise',
          region: 'Centre',
          ville: 'Yaoundé',
          secteurActivite: 'Tertiaire',
          sousSecteur: 'Autres',
          formeJuridique: 'EI',
          numeroContribuable: 'TEST123'
        },
        contact: {
          email: 'test@entreprise.com'
        }
      };

      const entreprise = new Entreprise(entrepriseData);
      await expect(entreprise.save()).rejects.toThrow('La date de création est requise');
    });

    it('should require secteurActivite', async () => {
      const entrepriseData = {
        identification: {
          nomEntreprise: 'Test Entreprise',
          region: 'Centre',
          ville: 'Yaoundé',
          dateCreation: new Date(),
          sousSecteur: 'Autres',
          formeJuridique: 'EI',
          numeroContribuable: 'TEST123'
        },
        contact: {
          email: 'test@entreprise.com'
        }
      };

      const entreprise = new Entreprise(entrepriseData);
      await expect(entreprise.save()).rejects.toThrow('Le secteur d\'activité est requis');
    });

    it('should validate secteurActivite enum', async () => {
      const entrepriseData = {
        identification: {
          nomEntreprise: 'Test Entreprise',
          region: 'Centre',
          ville: 'Yaoundé',
          dateCreation: new Date(),
          secteurActivite: 'Invalid Sector',
          sousSecteur: 'Autres',
          formeJuridique: 'EI',
          numeroContribuable: 'TEST123'
        },
        contact: {
          email: 'test@entreprise.com'
        }
      };

      const entreprise = new Entreprise(entrepriseData);
      await expect(entreprise.save()).rejects.toThrow('`Invalid Sector` is not a valid enum value');
    });

    it('should require sousSecteur', async () => {
      const entrepriseData = {
        identification: {
          nomEntreprise: 'Test Entreprise',
          region: 'Centre',
          ville: 'Yaoundé',
          dateCreation: new Date(),
          secteurActivite: 'Tertiaire',
          formeJuridique: 'EI',
          numeroContribuable: 'TEST123'
        },
        contact: {
          email: 'test@entreprise.com'
        }
      };

      const entreprise = new Entreprise(entrepriseData);
      await expect(entreprise.save()).rejects.toThrow('Le sous-secteur est requis');
    });

    it('should require formeJuridique', async () => {
      const entrepriseData = {
        identification: {
          nomEntreprise: 'Test Entreprise',
          region: 'Centre',
          ville: 'Yaoundé',
          dateCreation: new Date(),
          secteurActivite: 'Tertiaire',
          sousSecteur: 'Autres',
          numeroContribuable: 'TEST123'
        },
        contact: {
          email: 'test@entreprise.com'
        }
      };

      const entreprise = new Entreprise(entrepriseData);
      await expect(entreprise.save()).rejects.toThrow('La forme juridique est requise');
    });

    it('should require numeroContribuable', async () => {
      const entrepriseData = {
        identification: {
          nomEntreprise: 'Test Entreprise',
          region: 'Centre',
          ville: 'Yaoundé',
          dateCreation: new Date(),
          secteurActivite: 'Tertiaire',
          sousSecteur: 'Autres',
          formeJuridique: 'EI'
        },
        contact: {
          email: 'test@entreprise.com'
        }
      };

      const entreprise = new Entreprise(entrepriseData);
      await expect(entreprise.save()).rejects.toThrow('Le numéro de contribuable est requis');
    });

    it('should validate numeroContribuable format', async () => {
      const entrepriseData = {
        identification: {
          nomEntreprise: 'Test Entreprise',
          region: 'Centre',
          ville: 'Yaoundé',
          dateCreation: new Date(),
          secteurActivite: 'Tertiaire',
          sousSecteur: 'Autres',
          formeJuridique: 'EI',
          numeroContribuable: 'invalid-format!'
        },
        contact: {
          email: 'test@entreprise.com'
        }
      };

      const entreprise = new Entreprise(entrepriseData);
      await expect(entreprise.save()).rejects.toThrow('Le numéro de contribuable doit être alphanumérique');
    });

    it('should enforce unique numeroContribuable', async () => {
      const entrepriseData = {
        identification: {
          nomEntreprise: 'Test Entreprise',
          region: 'Centre',
          ville: 'Yaoundé',
          dateCreation: new Date(),
          secteurActivite: 'Tertiaire',
          sousSecteur: 'Autres',
          formeJuridique: 'EI',
          numeroContribuable: 'UNIQUE123'
        },
        contact: {
          email: 'test@entreprise.com'
        },
        investissementEmploi: {
          effectifsEmployes: 10
        }
      };

      await Entreprise.create(entrepriseData);
      const duplicateEntreprise = new Entreprise(entrepriseData);
      await expect(duplicateEntreprise.save()).rejects.toThrow('duplicate key error');
    });

    it('should require contact email', async () => {
      const entrepriseData = {
        identification: {
          nomEntreprise: 'Test Entreprise',
          region: 'Centre',
          ville: 'Yaoundé',
          dateCreation: new Date(),
          secteurActivite: 'Tertiaire',
          sousSecteur: 'Autres',
          formeJuridique: 'EI',
          numeroContribuable: 'TEST123'
        }
      };

      const entreprise = new Entreprise(entrepriseData);
      await expect(entreprise.save()).rejects.toThrow('L\'email est requis');
    });

    it('should validate contact email format', async () => {
      const entrepriseData = {
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
          email: 'invalid-email'
        }
      };

      const entreprise = new Entreprise(entrepriseData);
      await expect(entreprise.save()).rejects.toThrow('Veuillez entrer un email valide');
    });
  });

  describe('Performance Economique Validation', () => {
    it('should validate chiffreAffaires montant is not negative', async () => {
      const entrepriseData = {
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
        performanceEconomique: {
          chiffreAffaires: {
            montant: -1000,
            devise: 'FCFA',
            periode: 'Année complète'
          }
        }
      };

      const entreprise = new Entreprise(entrepriseData);
      await expect(entreprise.save()).rejects.toThrow('Le chiffre d\'affaires ne peut pas être négatif');
    });

    it('should validate coutsProduction montant is not negative', async () => {
      const entrepriseData = {
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
        performanceEconomique: {
          coutsProduction: {
            montant: -500,
            devise: 'FCFA'
          }
        }
      };

      const entreprise = new Entreprise(entrepriseData);
      await expect(entreprise.save()).rejects.toThrow('Les coûts de production ne peuvent pas être négatifs');
    });
  });

  describe('Investissement Emploi Validation', () => {
    it('should require effectifsEmployes', async () => {
      const entrepriseData = {
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
          effectifsEmployes: -5
        }
      };

      const entreprise = new Entreprise(entrepriseData);
      await expect(entreprise.save()).rejects.toThrow('Le nombre d\'employés ne peut pas être négatif');
    });
  });

  describe('Innovation Digitalisation Validation', () => {
    it('should validate integrationInnovation range', async () => {
      const entrepriseData = {
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
        },
        innovationDigitalisation: {
          integrationInnovation: 5
        }
      };

      const entreprise = new Entreprise(entrepriseData);
      await expect(entreprise.save()).rejects.toThrow(/integrationInnovation.*5.*more than maximum.*3/);
    });
  });

  describe('Conventions Validation', () => {
    it('should validate atteinteCiblesInvestissement range', async () => {
      const entrepriseData = {
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
        },
        conventions: {
          atteinteCiblesInvestissement: 150
        }
      };

      const entreprise = new Entreprise(entrepriseData);
      await expect(entreprise.save()).rejects.toThrow(/atteinteCiblesInvestissement.*150.*more than maximum.*100/);
    });
  });

  describe('Default Values', () => {
    it('should set default statut to En attente', async () => {
      const entrepriseData = {
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
      };

      const entreprise = await Entreprise.create(entrepriseData);
      expect(entreprise.statut).toBe('En attente');
    });

    it('should set default conformite to Non vérifié', async () => {
      const entrepriseData = {
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
      };

      const entreprise = await Entreprise.create(entrepriseData);
      expect(entreprise.conformite).toBe('Non vérifié');
    });

    it('should set default informationsCompletes to false', async () => {
      const entrepriseData = {
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
      };

      const entreprise = await Entreprise.create(entrepriseData);
      expect(entreprise.informationsCompletes).toBe(false);
    });
  });

  describe('Virtual Properties', () => {
    it.skip('should populate conventionsActives virtual', async () => {
      const entrepriseData = {
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
      };

      const entreprise = await Entreprise.create(entrepriseData);
      expect(entreprise.conventionsActives).toBeDefined();
    });
  });
});
