const mongoose = require('mongoose');

const entrepriseSchema = new mongoose.Schema({
  // 1. Indicateurs d'Identification et Structure de l'Entreprise
  identification: {
    codeEntreprise: {
      type: String,
      trim: true,
      maxlength: [50, 'Le code entreprise ne peut pas dépasser 50 caractères'],
      description: 'Code court ou identifiant unique de l\'entreprise (ex: ENT1)'
    },
    nomEntreprise: {
      type: String,
      required: [true, 'Le nom de l\'entreprise est requis'],
      trim: true,
      maxlength: [200, 'Le nom ne peut pas dépasser 200 caractères']
    },
    raisonSociale: {
      type: String,
      trim: true,
      maxlength: [200, 'La raison sociale ne peut pas dépasser 200 caractères']
    },
    region: {
      type: String,
      required: [true, 'La région est requise'],
      trim: true,
      enum: [
        'Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 'Littoral', 
        'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest'
      ]
    },
    ville: {
      type: String,
      required: [true, 'La ville est requise'],
      trim: true,
      maxlength: [100, 'La ville ne peut pas dépasser 100 caractères']
    },
    dateCreation: {
      type: Date,
      required: [true, 'La date de création est requise']
    },
    secteurActivite: {
      type: String,
      required: [true, 'Le secteur d\'activité est requis'],
      enum: [
        'Primaire', 'Secondaire', 'Tertiaire', 'Informatique', 'BTP', 'Commerce'
      ]
    },
    sousSecteur: {
      type: String,
      required: [true, 'Le sous-secteur est requis'],
      enum: [
        'Agro-industriel', 'Forêt-Bois', 'Mines', 'Pétrole-Gaz',
        'Industrie manufacturière', 'BTP', 'Énergie', 'Eau',
        'Commerce', 'Transport', 'Télécommunications', 'Banque-Assurance',
        'Tourisme', 'Santé', 'Éducation', 'Autres'
      ]
    },
    filiereProduction: {
      type: String,
      trim: true,
      maxlength: [100, 'La filière de production ne peut pas dépasser 100 caractères']
    },
    formeJuridique: {
      type: String,
      required: [true, 'La forme juridique est requise'],
      enum: [
        'SARL', 'SA', 'EI', 'SUARL', 'SARLU', 'SNC', 'SCS', 'SAS', 'EURL', 'Autres'
      ]
    },
    typeEntreprise: {
      type: String,
      trim: true,
      maxlength: [50, 'Le type d\'entreprise ne peut pas dépasser 50 caractères'],
      description: 'Type d\'entreprise (peut être différent de la forme juridique)'
    },
    numeroContribuable: {
      type: String,
      required: [true, 'Le numéro de contribuable est requis'],
      trim: true,
      unique: true,
      match: [/^[A-Z0-9]+$/, 'Le numéro de contribuable doit être alphanumérique']
    },
    siret: {
      type: String,
      trim: true,
      maxlength: [14, 'Le SIRET doit contenir 14 caractères'],
      description: 'Numéro SIRET de l\'entreprise'
    },
    codeAPE: {
      type: String,
      trim: true,
      maxlength: [10, 'Le code APE ne peut pas dépasser 10 caractères'],
      description: 'Code APE (Activité Principale Exercée)'
    },
    tvaIntracommunautaire: {
      type: String,
      trim: true,
      maxlength: [20, 'Le numéro TVA ne peut pas dépasser 20 caractères'],
      description: 'Numéro de TVA intracommunautaire'
    }
  },

  // 2. Indicateurs de Performance Économique et Financière
  performanceEconomique: {
    chiffreAffaires: {
      montant: {
        type: Number,
        min: [0, 'Le chiffre d\'affaires ne peut pas être négatif']
      },
      devise: {
        type: String,
        enum: ['FCFA', 'USD', 'EUR'],
        default: 'FCFA'
      },
      periode: {
        type: String,
        enum: ['Trimestre 1', 'Trimestre 2', 'Trimestre 3', 'Trimestre 4', 'Année complète']
      }
    },
    evolutionCA: {
      type: String,
      enum: ['Hausse', 'Baisse', 'Stabilité']
    },
    coutsProduction: {
      montant: {
        type: Number,
        min: [0, 'Les coûts de production ne peuvent pas être négatifs']
      },
      devise: {
        type: String,
        enum: ['FCFA', 'USD', 'EUR'],
        default: 'FCFA'
      }
    },
    evolutionCouts: {
      type: String,
      enum: ['Accroissement', 'Baisse', 'Stabilité']
    },
    situationTresorerie: {
      type: String,
      enum: ['Difficile', 'Normale', 'Aisée']
    },
    sourcesFinancement: {
      ressourcesPropres: { type: Boolean, default: false },
      subventions: { type: Boolean, default: false },
      concoursBancaires: { type: Boolean, default: false },
      creditsFournisseur: { type: Boolean, default: false },
      autres: { type: Boolean, default: false },
      autresDetails: {
        type: String,
        trim: true,
        maxlength: [200, 'Les détails ne peuvent pas dépasser 200 caractères']
      }
    }
  },

  // 3. Indicateurs d'Investissement et d'Emploi
  investissementEmploi: {
    effectifsEmployes: {
      type: Number,
      required: [true, 'Le nombre d\'employés est requis'],
      min: [0, 'Le nombre d\'employés ne peut pas être négatif']
    },
    nouveauxEmploisCrees: {
      type: Number,
      default: 0,
      min: [0, 'Le nombre de nouveaux emplois ne peut pas être négatif']
    },
    nouveauxInvestissementsRealises: {
      type: Boolean,
      default: false
    },
    typesInvestissements: {
      immobiliers: { type: Boolean, default: false },
      mobiliers: { type: Boolean, default: false },
      incorporels: { type: Boolean, default: false },
      financiers: { type: Boolean, default: false }
    }
  },

  // 4. Indicateurs d'Innovation et de Digitalisation
  innovationDigitalisation: {
    integrationInnovation: {
      type: Number,
      min: 1,
      max: 3,
      default: 1
    },
    integrationEconomieNumerique: {
      type: Number,
      min: 1,
      max: 3,
      default: 1
    },
    utilisationIA: {
      type: Number,
      min: 1,
      max: 3,
      default: 1
    }
  },

  // 5. Indicateurs liés aux Conventions
  conventions: {
    respectDelaisReporting: {
      conforme: { type: Boolean, default: true },
      joursRetard: { type: Number, default: 0, min: 0 }
    },
    atteinteCiblesInvestissement: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    atteinteCiblesEmploi: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    conformiteNormesSpecifiques: {
      conforme: { type: Boolean, default: true },
      niveauConformite: {
        type: Number,
        min: 1,
        max: 5,
        default: 5
      }
    }
  },

  // Informations de contact
  contact: {
    telephone: {
      type: String,
      required: false,
      trim: true,
      default: null,
      validate: {
        validator: function(v) {
          // Only validate format when a value is provided
          if (v === null || v === undefined || v === '') return true;
          return /^[0-9+\-\s()]+$/.test(v);
        },
        message: 'Veuillez entrer un numéro de téléphone valide'
      }
    },
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez entrer un email valide']
    },
    siteWeb: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v || v === '') return true;
          // Accepte les URLs avec ou sans http/https
          return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v) || /^www\..+/.test(v);
        },
        message: 'Veuillez entrer une URL valide'
      }
    },
    adresse: {
      rue: {
        type: String,
        trim: true,
        maxlength: [200, 'L\'adresse ne peut pas dépasser 200 caractères']
      },
      ville: {
        type: String,
        trim: true,
        maxlength: [100, 'La ville ne peut pas dépasser 100 caractères']
      },
      codePostal: {
        type: String,
        trim: true,
        maxlength: [10, 'Le code postal ne peut pas dépasser 10 caractères']
      },
      pays: {
        type: String,
        trim: true,
        maxlength: [50, 'Le pays ne peut pas dépasser 50 caractères'],
        default: 'Cameroun'
      }
    }
  },

  // Notes et métadonnées additionnelles
  notes: {
    type: String,
    trim: true,
    maxlength: [5000, 'Les notes ne peuvent pas dépasser 5000 caractères']
  },

  // Informations CRM
  crm: {
    contactPrincipal: {
      type: String,
      trim: true,
      maxlength: [200, 'Le nom du contact principal ne peut pas dépasser 200 caractères']
    },
    idContactPrincipal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dateDernierContact: {
      type: Date
    },
    prochainContact: {
      type: Date
    },
    sourceAcquisition: {
      type: String,
      trim: true,
      maxlength: [100, 'La source d\'acquisition ne peut pas dépasser 100 caractères'],
      enum: ['Web', 'Recommandation', 'Salon', 'Publicité', 'Autres', null]
    },
    campagneMarketing: {
      type: String,
      trim: true,
      maxlength: [200, 'La campagne marketing ne peut pas dépasser 200 caractères']
    },
    priorite: {
      type: String,
      enum: ['Haute', 'Moyenne', 'Basse', null]
    },
    etatProspect: {
      type: String,
      enum: ['Qualifié', 'Nouveau', 'En négociation', 'Client', 'Ancien client', null]
    },
    dateConversionClient: {
      type: Date
    },
    dateResiliationClient: {
      type: Date
    },
    raisonResiliation: {
      type: String,
      trim: true,
      maxlength: [500, 'La raison de résiliation ne peut pas dépasser 500 caractères']
    },
    utilisateurResponsable: {
      type: String,
      trim: true,
      maxlength: [200, 'Le nom de l\'utilisateur responsable ne peut pas dépasser 200 caractères']
    },
    idUtilisateurResponsable: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  // Informations de contrat
  contrat: {
    dateDebutContrat: {
      type: Date
    },
    dateFinContrat: {
      type: Date
    },
    montantContrat: {
      type: Number,
      min: [0, 'Le montant du contrat ne peut pas être négatif']
    },
    termesPaiement: {
      type: String,
      trim: true,
      maxlength: [100, 'Les termes de paiement ne peuvent pas dépasser 100 caractères'],
      enum: ['Net 30', 'Net 60', 'Net 90', 'Comptant', 'Autres', null]
    },
    frequenceFacturation: {
      type: String,
      enum: ['Mensuel', 'Trimestriel', 'Semestriel', 'Annuel', 'Unique', null]
    },
    produitsServicesAchetes: {
      type: String,
      trim: true,
      maxlength: [1000, 'La description des produits/services ne peut pas dépasser 1000 caractères']
    },
    licencesLogiciel: {
      type: String,
      enum: ['Oui', 'Non', null]
    },
    nombreLicences: {
      type: Number,
      min: [0, 'Le nombre de licences ne peut pas être négatif']
    },
    dateExpirationLicence: {
      type: Date
    }
  },

  // Informations de support
  support: {
    supportTechnique: {
      type: String,
      enum: ['Oui', 'Non', null]
    },
    niveauSupport: {
      type: String,
      enum: ['Basique', 'Standard', 'Premium', 'Entreprise', null]
    },
    dateDebutSupport: {
      type: Date
    },
    dateFinSupport: {
      type: Date
    },
    feedbackClient: {
      type: String,
      trim: true,
      maxlength: [2000, 'Le feedback client ne peut pas dépasser 2000 caractères']
    },
    scoreSatisfaction: {
      type: Number,
      min: [0, 'Le score de satisfaction doit être entre 0 et 10'],
      max: [10, 'Le score de satisfaction doit être entre 0 et 10']
    },
    dateDernierFeedback: {
      type: Date
    }
  },

  // Informations financières additionnelles
  finances: {
    historiqueCommandes: {
      type: String,
      trim: true,
      maxlength: [5000, 'L\'historique des commandes ne peut pas dépasser 5000 caractères']
    },
    montantTotalCommandes: {
      type: Number,
      min: [0, 'Le montant total des commandes ne peut pas être négatif']
    },
    nombreCommandes: {
      type: Number,
      min: [0, 'Le nombre de commandes ne peut pas être négatif']
    },
    dateDerniereCommande: {
      type: Date
    },
    prochaineCommandePrevue: {
      type: Date
    },
    budgetAnnuel: {
      type: Number,
      min: [0, 'Le budget annuel ne peut pas être négatif']
    }
  },

  // Informations stratégiques
  strategie: {
    objectifsClient: {
      type: String,
      trim: true,
      maxlength: [2000, 'Les objectifs client ne peuvent pas dépasser 2000 caractères']
    },
    defisClient: {
      type: String,
      trim: true,
      maxlength: [2000, 'Les défis client ne peuvent pas dépasser 2000 caractères']
    },
    concurrentsPrincipaux: {
      type: String,
      trim: true,
      maxlength: [1000, 'Les concurrents principaux ne peuvent pas dépasser 1000 caractères']
    },
    partenairesStrategiques: {
      type: String,
      trim: true,
      maxlength: [1000, 'Les partenaires stratégiques ne peuvent pas dépasser 1000 caractères']
    }
  },

  // Informations diverses
  divers: {
    documentsLies: {
      type: [String],
      description: 'Liste des URLs ou chemins vers les documents liés'
    },
    liensUtiles: {
      type: [String],
      description: 'Liste des liens utiles'
    },
    tags: {
      type: [String],
      description: 'Tags pour catégoriser l\'entreprise'
    }
  },

  // Champs personnalisés (1 à 10)
  champsPersonnalises: {
    champ1: { type: String, trim: true, maxlength: [500] },
    champ2: { type: String, trim: true, maxlength: [500] },
    champ3: { type: String, trim: true, maxlength: [500] },
    champ4: { type: String, trim: true, maxlength: [500] },
    champ5: { type: String, trim: true, maxlength: [500] },
    champ6: { type: String, trim: true, maxlength: [500] },
    champ7: { type: String, trim: true, maxlength: [500] },
    champ8: { type: String, trim: true, maxlength: [500] },
    champ9: { type: String, trim: true, maxlength: [500] },
    champ10: { type: String, trim: true, maxlength: [500] }
  },

  // Données annuelles (2021-2050)
  donneesAnnuelles: {
    type: Map,
    of: {
      type: Number,
      description: 'Valeurs numériques pour chaque année (2021-2050)'
    }
  },

  // Statut et métadonnées
  statut: {
    type: String,
    enum: ['En attente', 'Actif', 'Inactif', 'Suspendu'],
    default: 'En attente'
  },
  conformite: {
    type: String,
    enum: ['Conforme', 'Non conforme', 'En cours de vérification', 'Non vérifié'],
    default: 'Non vérifié',
    description: 'Statut de conformité défini manuellement par l\'administrateur'
  },
  commentaireConformite: {
    type: String,
    trim: true,
    maxlength: [500, 'Le commentaire ne peut pas dépasser 500 caractères']
  },
  derniereVerificationConformite: {
    type: Date
  },
  verifiePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  informationsCompletes: {
    type: Boolean,
    default: false
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  dateModification: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  logo: {
    type: String,
    trim: true,
    default: null,
    description: 'URL du logo de l\'entreprise'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual properties or methods here if needed
entrepriseSchema.virtual('conventionsActives', {
  ref: 'Convention',
  localField: '_id',
  foreignField: 'enterpriseId',
  match: { status: 'ACTIVE' }
});

module.exports = mongoose.model('Entreprise', entrepriseSchema);
