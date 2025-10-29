/**
 * Test data fixtures for consistent testing
 */

const testUsers = {
  admin: {
    nom: 'Admin',
    prenom: 'User',
    email: 'admin@test.com',
    motDePasse: 'admin123',
    role: 'admin',
    typeCompte: 'admin'
  },
  entreprise: {
    nom: 'Entreprise',
    prenom: 'User',
    email: 'entreprise@test.com',
    motDePasse: 'entreprise123',
    role: 'user',
    typeCompte: 'entreprise'
  },
  superAdmin: {
    nom: 'Super',
    prenom: 'Admin',
    email: 'superadmin@test.com',
    motDePasse: 'superadmin123',
    role: 'super_admin',
    typeCompte: 'admin'
  }
};

const testEntreprises = {
  complete: {
    identification: {
      nomEntreprise: 'Entreprise Test Complète',
      raisonSociale: 'ETC SARL',
      region: 'Centre',
      ville: 'Yaoundé',
      dateCreation: new Date('2020-01-01'),
      secteurActivite: 'Tertiaire',
      sousSecteur: 'Commerce',
      filiereProduction: 'Commerce de détail',
      formeJuridique: 'SARL',
      numeroContribuable: 'COMPLETE123'
    },
    performanceEconomique: {
      chiffreAffaires: {
        montant: 1000000,
        devise: 'FCFA',
        periode: 'Année complète'
      },
      evolutionCA: 'Hausse',
      coutsProduction: {
        montant: 600000,
        devise: 'FCFA'
      },
      evolutionCouts: 'Accroissement',
      situationTresorerie: 'Normale',
      sourcesFinancement: {
        ressourcesPropres: true,
        subventions: false,
        concoursBancaires: true,
        creditsFournisseur: false,
        autres: false
      }
    },
    investissementEmploi: {
      effectifsEmployes: 25,
      nouveauxEmploisCrees: 5,
      nouveauxInvestissementsRealises: true,
      typesInvestissements: {
        immobiliers: true,
        mobiliers: true,
        incorporels: false,
        financiers: false
      }
    },
    innovationDigitalisation: {
      integrationInnovation: 2,
      integrationEconomieNumerique: 3,
      utilisationIA: 1
    },
    conventions: {
      respectDelaisReporting: {
        conforme: true,
        joursRetard: 0
      },
      atteinteCiblesInvestissement: 85,
      atteinteCiblesEmploi: 90,
      conformiteNormesSpecifiques: {
        conforme: true,
        niveauConformite: 4
      }
    },
    contact: {
      telephone: '+237123456789',
      email: 'contact@entreprise-test.com',
      siteWeb: 'https://www.entreprise-test.com',
      adresse: {
        rue: '123 Avenue de la République',
        ville: 'Yaoundé',
        codePostal: '00000',
        pays: 'Cameroun'
      }
    },
    statut: 'Actif',
    conformite: 'Conforme',
    informationsCompletes: true
  },
  minimal: {
    identification: {
      nomEntreprise: 'Entreprise Test Minimale',
      region: 'Centre',
      ville: 'Yaoundé',
      dateCreation: new Date(),
      secteurActivite: 'Tertiaire',
      sousSecteur: 'Autres',
      formeJuridique: 'EI',
      numeroContribuable: 'MINIMAL123'
    },
    contact: {
      email: 'minimal@test.com'
    },
    statut: 'En attente',
    informationsCompletes: false
  }
};

const testKPIs = {
  chiffreAffaires: {
    nom: 'Chiffre d\'affaires',
    description: 'Montant total des ventes',
    type: 'quantitatif',
    unite: 'FCFA',
    valeurCible: 1000000,
    valeurActuelle: 750000,
    periode: 'Année',
    statut: 'En cours'
  },
  effectifs: {
    nom: 'Nombre d\'employés',
    description: 'Effectif total de l\'entreprise',
    type: 'quantitatif',
    unite: 'personnes',
    valeurCible: 50,
    valeurActuelle: 35,
    periode: 'Année',
    statut: 'En cours'
  },
  satisfaction: {
    nom: 'Satisfaction client',
    description: 'Niveau de satisfaction des clients',
    type: 'qualitatif',
    unite: '%',
    valeurCible: 90,
    valeurActuelle: 85,
    periode: 'Trimestre',
    statut: 'En cours'
  }
};

const testWorkflows = {
  approbationEntreprise: {
    nom: 'Approbation Entreprise',
    description: 'Workflow d\'approbation d\'une nouvelle entreprise',
    etapes: [
      {
        nom: 'Soumission',
        description: 'L\'entreprise soumet sa demande',
        ordre: 1,
        type: 'automatique',
        statut: 'active'
      },
      {
        nom: 'Vérification',
        description: 'Vérification des documents',
        ordre: 2,
        type: 'manuelle',
        statut: 'active'
      },
      {
        nom: 'Approbation',
        description: 'Approbation finale',
        ordre: 3,
        type: 'manuelle',
        statut: 'active'
      }
    ],
    statut: 'actif'
  }
};

const testForms = {
  kpiSubmission: {
    nom: 'Soumission KPI',
    description: 'Formulaire de soumission des KPIs',
    champs: [
      {
        nom: 'kpi_nom',
        type: 'text',
        label: 'Nom du KPI',
        required: true
      },
      {
        nom: 'kpi_valeur',
        type: 'number',
        label: 'Valeur',
        required: true
      },
      {
        nom: 'kpi_periode',
        type: 'select',
        label: 'Période',
        options: ['Mois', 'Trimestre', 'Année'],
        required: true
      }
    ],
    statut: 'actif'
  }
};

const testMessages = {
  adminToEntreprise: {
    sujet: 'Mise à jour des informations',
    contenu: 'Veuillez mettre à jour vos informations d\'entreprise.',
    type: 'information',
    priorite: 'normale'
  },
  entrepriseToAdmin: {
    sujet: 'Question sur les KPIs',
    contenu: 'J\'ai une question concernant la soumission des KPIs.',
    type: 'question',
    priorite: 'normale'
  }
};

module.exports = {
  testUsers,
  testEntreprises,
  testKPIs,
  testWorkflows,
  testForms,
  testMessages
};

