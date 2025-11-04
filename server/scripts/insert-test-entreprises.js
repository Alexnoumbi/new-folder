const mongoose = require('mongoose');
const Entreprise = require('../models/Entreprise');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Fonction pour convertir une date au format DD/MM/YYYY ou YYYY-MM-DD en Date
function parseDate(dateStr) {
  if (!dateStr) return null;
  if (typeof dateStr === 'string') {
    // Format DD/MM/YYYY
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    }
    // Format YYYY-MM-DD
    if (dateStr.includes('-')) {
      return new Date(dateStr);
    }
  }
  return dateStr instanceof Date ? dateStr : new Date(dateStr);
}

// Fonction pour mapper le secteur d'activité du tableur aux valeurs enum du modèle
function mapSecteurActivite(secteur) {
  const mapping = {
    'Technologie': 'Tertiaire',
    'Services Financiers': 'Tertiaire',
    'Marketing Digital': 'Tertiaire',
    'Construction': 'Secondaire',
    'Logiciels': 'Tertiaire',
    'Conseil': 'Tertiaire',
    'Éducation': 'Tertiaire',
    'Logistique': 'Tertiaire',
    'Médias': 'Tertiaire'
  };
  return mapping[secteur] || 'Tertiaire';
}

// Fonction pour mapper le sous-secteur
function mapSousSecteur(secteur) {
  const mapping = {
    'Technologie': 'Télécommunications',
    'Services Financiers': 'Banque-Assurance',
    'Marketing Digital': 'Autres',
    'Construction': 'BTP',
    'Logiciels': 'Télécommunications',
    'Conseil': 'Autres',
    'Éducation': 'Éducation',
    'Logistique': 'Transport',
    'Médias': 'Autres'
  };
  return mapping[secteur] || 'Autres';
}

// Fonction pour mapper le statut juridique
function mapFormeJuridique(statut) {
  const mapping = {
    'SARL': 'SARL',
    'SA': 'SA',
    'EURL': 'EURL',
    'SAS': 'SAS',
    'Ltd': 'Autres',
    'Inc': 'Autres'
  };
  return mapping[statut] || 'SARL';
}

// Fonction pour mapper le niveau de service
function mapNiveauSupport(niveau) {
  const mapping = {
    'Gold': 'Premium',
    'Silver': 'Standard',
    'Bronze': 'Basique',
    'Platinum': 'Entreprise'
  };
  return mapping[niveau] || 'Standard';
}

// Fonction pour mapper la fréquence de facturation
function mapFrequenceFacturation(freq) {
  const mapping = {
    'Annuelle': 'Annuel',
    'Trimestrielle': 'Trimestriel',
    'Mensuelle': 'Mensuel',
    'Semestrielle': 'Semestriel'
  };
  return mapping[freq] || 'Annuel';
}

// Fonction pour insérer une entreprise de test
async function insertTestEntreprise(data) {
  try {
    // Vérifier si l'entreprise existe déjà (par numéro contribuable ou SIRET)
    const existing = await Entreprise.findOne({
      $or: [
        { 'identification.numeroContribuable': data.identification.numeroContribuable },
        ...(data.identification.siret ? [{ 'identification.siret': data.identification.siret }] : [])
      ]
    });

    if (existing) {
      console.log(`⚠️  Entreprise "${data.identification?.nomEntreprise}" existe déjà (ID: ${existing._id})`);
      return existing;
    }

    const entreprise = new Entreprise(data);
    await entreprise.save();
    console.log(`✅ Entreprise "${data.identification?.nomEntreprise}" créée avec succès (ID: ${entreprise._id})`);
    return entreprise;
  } catch (error) {
    console.error(`❌ Erreur lors de la création de l'entreprise "${data.identification?.nomEntreprise}":`, error.message);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`   - ${key}: ${error.errors[key].message}`);
      });
    }
    throw error;
  }
}

// Fonction pour créer un utilisateur entreprise
async function createEntrepriseUser(entrepriseData, email, password) {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`⚠️  Utilisateur avec l'email ${email} existe déjà`);
      return existingUser;
    }

    // Extraire le nom et prénom du contact principal ou utiliser des valeurs par défaut
    const contactPrincipal = entrepriseData.crm?.contactPrincipal || 'Contact';
    const [prenom, ...nomParts] = contactPrincipal.split(' ');
    const nom = nomParts.join(' ') || entrepriseData.identification?.nomEntreprise || 'Entreprise';

    const user = await User.create({
      nom: nom.substring(0, 50),
      prenom: prenom.substring(0, 50) || 'Contact',
      email: email.toLowerCase(),
      motDePasse: password,
      typeCompte: 'entreprise',
      role: 'user',
      telephone: entrepriseData.contact?.telephone || null
    });

    console.log(`✅ Utilisateur créé : ${email}`);
    return user;
  } catch (error) {
    console.error(`❌ Erreur lors de la création de l'utilisateur ${email}:`, error.message);
    throw error;
  }
}

// Fonction pour générer la liste des identifiants
function generateCredentialsList(entreprisesTest) {
  const credentials = [];
  let counter = 111; // Commence à ent111@gmail.com

  entreprisesTest.forEach((entreprise, index) => {
    const email = `ent${counter}@gmail.com`;
    const password = 'Aa123456';
    const nomEntreprise = entreprise.identification?.nomEntreprise || `Entreprise ${index + 1}`;
    
    credentials.push({
      numero: index + 1,
      entreprise: nomEntreprise,
      email: email,
      motDePasse: password
    });
    
    counter++;
  });

  return credentials;
}

// Fonction pour sauvegarder les identifiants dans un fichier
function saveCredentialsToFile(credentials) {
  const filePath = path.join(__dirname, 'entreprises-credentials.txt');
  const jsonPath = path.join(__dirname, 'entreprises-credentials.json');
  
  // Fichier texte lisible
  let content = '='.repeat(80) + '\n';
  content += 'IDENTIFIANTS DES ENTREPRISES DE TEST\n';
  content += '='.repeat(80) + '\n\n';
  content += 'Mot de passe commun pour toutes les entreprises : Aa123456\n\n';
  content += '-'.repeat(80) + '\n';
  
  credentials.forEach(cred => {
    content += `\n${cred.numero}. ${cred.entreprise}\n`;
    content += `   Email : ${cred.email}\n`;
    content += `   Mot de passe : ${cred.motDePasse}\n`;
    content += '-'.repeat(80) + '\n';
  });
  
  content += `\n\nTotal : ${credentials.length} entreprises\n`;
  content += `\nDate de génération : ${new Date().toLocaleString('fr-FR')}\n`;
  
  fs.writeFileSync(filePath, content, 'utf8');
  fs.writeFileSync(jsonPath, JSON.stringify(credentials, null, 2), 'utf8');
  
  console.log(`\n📄 Fichiers d'identifiants créés :`);
  console.log(`   - ${filePath}`);
  console.log(`   - ${jsonPath}\n`);
  
  return { filePath, jsonPath };
}

// Fonction principale
async function main() {
  try {
    // Connexion à MongoDB
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver l'utilisateur admin pour les références
    const adminUser = await User.findOne({ role: 'admin' }).select('_id');
    const adminUserId = adminUser ? adminUser._id : null;
    if (adminUserId) {
      console.log(`👤 Utilisateur admin trouvé (ID: ${adminUserId})`);
    } else {
      console.log('⚠️  Aucun utilisateur admin trouvé, les références utilisateur seront nulles');
    }

    // Fonction pour générer un numéro de contribuable unique
    let contribuableCounter = 1;
    function generateNumeroContribuable() {
      const timestamp = Date.now();
      const counter = contribuableCounter++;
      return `M${timestamp}${counter.toString().padStart(4, '0')}`;
    }

    // Données des entreprises depuis le tableur
    const entreprisesTest = [
      {
        identification: {
          codeEntreprise: 'ENT1',
          nomEntreprise: 'Entreprise Alpha',
          raisonSociale: 'Alpha Corp SARL',
          region: 'Centre',
          ville: 'Yaoundé',
          dateCreation: parseDate('2010-01-15'),
          secteurActivite: mapSecteurActivite('Technologie'),
          sousSecteur: mapSousSecteur('Technologie'),
          formeJuridique: mapFormeJuridique('SARL'),
          numeroContribuable: generateNumeroContribuable(),
          siret: '12345678900012',
          codeAPE: '6201Z',
          tvaIntracommunautaire: 'FR123456789'
        },
        performanceEconomique: {
          chiffreAffaires: {
            montant: 150000000,
            devise: 'FCFA',
            periode: 'Année complète'
          }
        },
        investissementEmploi: {
          effectifsEmployes: 50
        },
        contact: {
          adresse: {
            rue: '123 Rue Principale',
            ville: 'Yaoundé',
            pays: 'Cameroun'
          },
          telephone: '+237 699 123 456',
          email: 'contact@alphacorp.com',
          siteWeb: 'www.alphacorp.com'
        },
        notes: 'Client stratégique',
        crm: {
          contactPrincipal: 'Jean Dupont',
          idContactPrincipal: adminUserId,
          dateDernierContact: parseDate('2023-10-20'),
          prochainContact: parseDate('2024-01-15'),
          sourceAcquisition: 'Web',
          utilisateurResponsable: 'admin',
          idUtilisateurResponsable: adminUserId
        },
        contrat: {
          dateDebutContrat: parseDate('2023-01-01'),
          dateFinContrat: parseDate('2024-12-31'),
          montantContrat: 1200000,
          frequenceFacturation: mapFrequenceFacturation('Annuelle'),
          produitsServicesAchetes: 'Développement logiciel, Conseil'
        },
        support: {
          supportTechnique: 'Oui',
          niveauSupport: mapNiveauSupport('Gold')
        },
        donneesAnnuelles: {
          '2019': 100000000,
          '2020': 110000000,
          '2021': 120000000,
          '2022': 135000000,
          '2023': 150000000,
          '2024': 165000000
        },
        statut: 'Actif',
        conformite: 'Conforme',
        informationsCompletes: true,
        dateModification: parseDate('2023-11-01')
      },
      {
        identification: {
          codeEntreprise: 'ENT2',
          nomEntreprise: 'Beta Solutions',
          raisonSociale: 'Beta Solutions SA',
          region: 'Littoral',
          ville: 'Douala',
          dateCreation: parseDate('2015-03-20'),
          secteurActivite: mapSecteurActivite('Services Financiers'),
          sousSecteur: mapSousSecteur('Services Financiers'),
          formeJuridique: mapFormeJuridique('SA'),
          numeroContribuable: generateNumeroContribuable(),
          siret: '98765432100034',
          codeAPE: '6419Z',
          tvaIntracommunautaire: 'FR987654321'
        },
        performanceEconomique: {
          chiffreAffaires: {
            montant: 250000000,
            devise: 'FCFA',
            periode: 'Année complète'
          }
        },
        investissementEmploi: {
          effectifsEmployes: 120
        },
        contact: {
          adresse: {
            rue: '456 Avenue de la Liberté',
            ville: 'Douala',
            pays: 'Cameroun'
          },
          telephone: '+237 677 987 654',
          email: 'info@betasolutions.com',
          siteWeb: 'www.betasolutions.com'
        },
        notes: 'Partenaire clé',
        crm: {
          contactPrincipal: 'Marie Claire',
          idContactPrincipal: adminUserId,
          dateDernierContact: parseDate('2023-11-05'),
          prochainContact: parseDate('2024-02-01'),
          sourceAcquisition: 'Recommandation',
          utilisateurResponsable: 'admin',
          idUtilisateurResponsable: adminUserId
        },
        contrat: {
          dateDebutContrat: parseDate('2023-03-01'),
          dateFinContrat: parseDate('2025-02-28'),
          montantContrat: 800000,
          frequenceFacturation: mapFrequenceFacturation('Trimestrielle'),
          produitsServicesAchetes: 'Audit, Conseil'
        },
        support: {
          supportTechnique: 'Oui',
          niveauSupport: mapNiveauSupport('Silver')
        },
        donneesAnnuelles: {
          '2019': 200000000,
          '2020': 220000000,
          '2021': 230000000,
          '2022': 245000000,
          '2023': 250000000,
          '2024': 260000000
        },
        statut: 'Actif',
        conformite: 'Conforme',
        informationsCompletes: true,
        dateModification: parseDate('2023-11-10')
      },
      {
        identification: {
          codeEntreprise: 'ENT3',
          nomEntreprise: 'Gamma Services',
          raisonSociale: 'Gamma Services EURL',
          region: 'Ouest',
          ville: 'Bafoussam',
          dateCreation: parseDate('2018-07-01'),
          secteurActivite: mapSecteurActivite('Marketing Digital'),
          sousSecteur: mapSousSecteur('Marketing Digital'),
          formeJuridique: mapFormeJuridique('EURL'),
          numeroContribuable: generateNumeroContribuable(),
          siret: '11223344550056',
          codeAPE: '7311Z',
          tvaIntracommunautaire: 'FR112233445'
        },
        performanceEconomique: {
          chiffreAffaires: {
            montant: 80000000,
            devise: 'FCFA',
            periode: 'Année complète'
          }
        },
        investissementEmploi: {
          effectifsEmployes: 30
        },
        contact: {
          adresse: {
            rue: '789 Boulevard des Fleurs',
            ville: 'Bafoussam',
            pays: 'Cameroun'
          },
          telephone: '+237 688 112 233',
          email: 'support@gammaservices.net',
          siteWeb: 'www.gammaservices.net'
        },
        notes: 'Potentiel de croissance',
        crm: {
          contactPrincipal: 'Pierre Martin',
          idContactPrincipal: adminUserId,
          dateDernierContact: parseDate('2023-09-10'),
          prochainContact: parseDate('2024-01-20'),
          sourceAcquisition: 'Salon',
          utilisateurResponsable: 'admin',
          idUtilisateurResponsable: adminUserId
        },
        contrat: {
          dateDebutContrat: parseDate('2023-07-01'),
          dateFinContrat: parseDate('2024-06-30'),
          montantContrat: 300000,
          frequenceFacturation: mapFrequenceFacturation('Mensuelle'),
          produitsServicesAchetes: 'SEO, Réseaux sociaux'
        },
        support: {
          supportTechnique: 'Oui',
          niveauSupport: mapNiveauSupport('Bronze')
        },
        donneesAnnuelles: {
          '2019': 60000000,
          '2020': 65000000,
          '2021': 70000000,
          '2022': 75000000,
          '2023': 80000000,
          '2024': 85000000
        },
        statut: 'Actif',
        conformite: 'Conforme',
        informationsCompletes: true,
        dateModification: parseDate('2023-10-05')
      },
      {
        identification: {
          codeEntreprise: 'ENT4',
          nomEntreprise: 'Delta Corp',
          raisonSociale: 'Delta Corp Ltd',
          region: 'Est',
          ville: 'Bertoua',
          dateCreation: parseDate('2005-11-01'),
          secteurActivite: mapSecteurActivite('Construction'),
          sousSecteur: mapSousSecteur('Construction'),
          formeJuridique: mapFormeJuridique('Ltd'),
          numeroContribuable: generateNumeroContribuable(),
          siret: '55667788990078',
          codeAPE: '4120A',
          tvaIntracommunautaire: 'FR556677889'
        },
        performanceEconomique: {
          chiffreAffaires: {
            montant: 300000000,
            devise: 'FCFA',
            periode: 'Année complète'
          }
        },
        investissementEmploi: {
          effectifsEmployes: 200
        },
        contact: {
          adresse: {
            rue: '101 Route Nationale',
            ville: 'Bertoua',
            pays: 'Cameroun'
          },
          telephone: '+237 655 443 322',
          email: 'contact@deltacorp.com',
          siteWeb: 'www.deltacorp.com'
        },
        notes: 'Grand compte',
        crm: {
          contactPrincipal: 'Sophie Dubois',
          idContactPrincipal: adminUserId,
          dateDernierContact: parseDate('2023-10-15'),
          prochainContact: parseDate('2024-03-01'),
          sourceAcquisition: 'Web',
          utilisateurResponsable: 'admin',
          idUtilisateurResponsable: adminUserId
        },
        contrat: {
          dateDebutContrat: parseDate('2023-01-01'),
          dateFinContrat: parseDate('2025-12-31'),
          montantContrat: 2000000,
          frequenceFacturation: mapFrequenceFacturation('Semestrielle'),
          produitsServicesAchetes: 'Gestion de projet, Ingénierie'
        },
        support: {
          supportTechnique: 'Oui',
          niveauSupport: mapNiveauSupport('Platinum')
        },
        donneesAnnuelles: {
          '2019': 250000000,
          '2020': 260000000,
          '2021': 275000000,
          '2022': 290000000,
          '2023': 300000000,
          '2024': 310000000
        },
        statut: 'Actif',
        conformite: 'Conforme',
        informationsCompletes: true,
        dateModification: parseDate('2023-11-05')
      },
      {
        identification: {
          codeEntreprise: 'ENT5',
          nomEntreprise: 'Epsilon Tech',
          raisonSociale: 'Epsilon Tech SAS',
          region: 'Nord',
          ville: 'Garoua',
          dateCreation: parseDate('2012-04-10'),
          secteurActivite: mapSecteurActivite('Logiciels'),
          sousSecteur: mapSousSecteur('Logiciels'),
          formeJuridique: mapFormeJuridique('SAS'),
          numeroContribuable: generateNumeroContribuable(),
          siret: '99887766550090',
          codeAPE: '6202A',
          tvaIntracommunautaire: 'FR998877665'
        },
        performanceEconomique: {
          chiffreAffaires: {
            montant: 180000000,
            devise: 'FCFA',
            periode: 'Année complète'
          }
        },
        investissementEmploi: {
          effectifsEmployes: 80
        },
        contact: {
          adresse: {
            rue: '22 Rue des Innovateurs',
            ville: 'Garoua',
            pays: 'Cameroun'
          },
          telephone: '+237 666 778 899',
          email: 'sales@epsilontech.com',
          siteWeb: 'www.epsilontech.com'
        },
        notes: 'Forte croissance',
        crm: {
          contactPrincipal: 'Marc Lefevre',
          idContactPrincipal: adminUserId,
          dateDernierContact: parseDate('2023-11-01'),
          prochainContact: parseDate('2024-02-10'),
          sourceAcquisition: 'Salon',
          utilisateurResponsable: 'admin',
          idUtilisateurResponsable: adminUserId
        },
        contrat: {
          dateDebutContrat: parseDate('2023-04-01'),
          dateFinContrat: parseDate('2025-03-31'),
          montantContrat: 950000,
          frequenceFacturation: mapFrequenceFacturation('Annuelle'),
          produitsServicesAchetes: 'Développement sur mesure, Maintenance'
        },
        support: {
          supportTechnique: 'Oui',
          niveauSupport: mapNiveauSupport('Gold')
        },
        donneesAnnuelles: {
          '2019': 140000000,
          '2020': 150000000,
          '2021': 160000000,
          '2022': 170000000,
          '2023': 180000000,
          '2024': 190000000
        },
        statut: 'Actif',
        conformite: 'Conforme',
        informationsCompletes: true,
        dateModification: parseDate('2023-11-15')
      },
      {
        identification: {
          codeEntreprise: 'ENT6',
          nomEntreprise: 'Zeta Consulting',
          raisonSociale: 'Zeta Consulting SARL',
          region: 'Sud',
          ville: 'Ebolowa',
          dateCreation: parseDate('2017-09-05'),
          secteurActivite: mapSecteurActivite('Conseil'),
          sousSecteur: mapSousSecteur('Conseil'),
          formeJuridique: mapFormeJuridique('SARL'),
          numeroContribuable: generateNumeroContribuable(),
          siret: '10293847560011',
          codeAPE: '7022Z',
          tvaIntracommunautaire: 'FR102938475'
        },
        performanceEconomique: {
          chiffreAffaires: {
            montant: 90000000,
            devise: 'FCFA',
            periode: 'Année complète'
          }
        },
        investissementEmploi: {
          effectifsEmployes: 40
        },
        contact: {
          adresse: {
            rue: '33 Rue des Experts',
            ville: 'Ebolowa',
            pays: 'Cameroun'
          },
          telephone: '+237 690 123 456',
          email: 'info@zetaconsulting.com',
          siteWeb: 'www.zetaconsulting.com'
        },
        notes: 'Client fidèle',
        crm: {
          contactPrincipal: 'Fatima Diallo',
          idContactPrincipal: adminUserId,
          dateDernierContact: parseDate('2023-10-25'),
          prochainContact: parseDate('2024-01-25'),
          sourceAcquisition: 'Recommandation',
          utilisateurResponsable: 'admin',
          idUtilisateurResponsable: adminUserId
        },
        contrat: {
          dateDebutContrat: parseDate('2023-09-01'),
          dateFinContrat: parseDate('2024-08-31'),
          montantContrat: 400000,
          frequenceFacturation: mapFrequenceFacturation('Trimestrielle'),
          produitsServicesAchetes: 'Audit, Formation'
        },
        support: {
          supportTechnique: 'Oui',
          niveauSupport: mapNiveauSupport('Bronze')
        },
        donneesAnnuelles: {
          '2019': 70000000,
          '2020': 75000000,
          '2021': 80000000,
          '2022': 85000000,
          '2023': 90000000,
          '2024': 95000000
        },
        statut: 'Actif',
        conformite: 'Conforme',
        informationsCompletes: true,
        dateModification: parseDate('2023-11-01')
      },
      {
        identification: {
          codeEntreprise: 'ENT7',
          nomEntreprise: 'Eta Solutions',
          raisonSociale: 'Eta Solutions Inc',
          region: 'Nord-Ouest',
          ville: 'Bamenda',
          dateCreation: parseDate('2014-02-14'),
          secteurActivite: mapSecteurActivite('Éducation'),
          sousSecteur: mapSousSecteur('Éducation'),
          formeJuridique: mapFormeJuridique('Inc'),
          numeroContribuable: generateNumeroContribuable(),
          siret: '23456789010022',
          codeAPE: '8559B',
          tvaIntracommunautaire: 'FR234567890'
        },
        performanceEconomique: {
          chiffreAffaires: {
            montant: 110000000,
            devise: 'FCFA',
            periode: 'Année complète'
          }
        },
        investissementEmploi: {
          effectifsEmployes: 60
        },
        contact: {
          adresse: {
            rue: '44 Rue des Savoirs',
            ville: 'Bamenda',
            pays: 'Cameroun'
          },
          telephone: '+237 670 987 654',
          email: 'contact@etasolutions.org',
          siteWeb: 'www.etasolutions.org'
        },
        notes: 'Partenariat académique',
        crm: {
          contactPrincipal: 'Pauline Ndi',
          idContactPrincipal: adminUserId,
          dateDernierContact: parseDate('2023-11-10'),
          prochainContact: parseDate('2024-03-10'),
          sourceAcquisition: 'Web',
          utilisateurResponsable: 'admin',
          idUtilisateurResponsable: adminUserId
        },
        contrat: {
          dateDebutContrat: parseDate('2023-02-01'),
          dateFinContrat: parseDate('2025-01-31'),
          montantContrat: 600000,
          frequenceFacturation: mapFrequenceFacturation('Annuelle'),
          produitsServicesAchetes: 'Plateforme e-learning, Support pédagogique'
        },
        support: {
          supportTechnique: 'Oui',
          niveauSupport: mapNiveauSupport('Silver')
        },
        donneesAnnuelles: {
          '2019': 90000000,
          '2020': 95000000,
          '2021': 100000000,
          '2022': 105000000,
          '2023': 110000000,
          '2024': 115000000
        },
        statut: 'Actif',
        conformite: 'Conforme',
        informationsCompletes: true,
        dateModification: parseDate('2023-11-20')
      },
      {
        identification: {
          codeEntreprise: 'ENT8',
          nomEntreprise: 'Theta Logistics',
          raisonSociale: 'Theta Logistics SA',
          region: 'Sud-Ouest',
          ville: 'Buea',
          dateCreation: parseDate('2008-06-25'),
          secteurActivite: mapSecteurActivite('Logistique'),
          sousSecteur: mapSousSecteur('Logistique'),
          formeJuridique: mapFormeJuridique('SA'),
          numeroContribuable: generateNumeroContribuable(),
          siret: '34567890120033',
          codeAPE: '5229B',
          tvaIntracommunautaire: 'FR345678901'
        },
        performanceEconomique: {
          chiffreAffaires: {
            montant: 220000000,
            devise: 'FCFA',
            periode: 'Année complète'
          }
        },
        investissementEmploi: {
          effectifsEmployes: 150
        },
        contact: {
          adresse: {
            rue: '55 Zone Industrielle',
            ville: 'Buea',
            pays: 'Cameroun'
          },
          telephone: '+237 680 112 233',
          email: 'operations@thetalogistics.com',
          siteWeb: 'www.thetalogistics.com'
        },
        notes: 'Optimisation des coûts',
        crm: {
          contactPrincipal: 'David Eko',
          idContactPrincipal: adminUserId,
          dateDernierContact: parseDate('2023-10-01'),
          prochainContact: parseDate('2024-01-10'),
          sourceAcquisition: 'Recommandation',
          utilisateurResponsable: 'admin',
          idUtilisateurResponsable: adminUserId
        },
        contrat: {
          dateDebutContrat: parseDate('2023-06-01'),
          dateFinContrat: parseDate('2025-05-31'),
          montantContrat: 1500000,
          frequenceFacturation: mapFrequenceFacturation('Trimestrielle'),
          produitsServicesAchetes: 'Transport, Entreposage, Douane'
        },
        support: {
          supportTechnique: 'Oui',
          niveauSupport: mapNiveauSupport('Gold')
        },
        donneesAnnuelles: {
          '2019': 180000000,
          '2020': 195000000,
          '2021': 205000000,
          '2022': 215000000,
          '2023': 220000000,
          '2024': 230000000
        },
        statut: 'Actif',
        conformite: 'Conforme',
        informationsCompletes: true,
        dateModification: parseDate('2023-11-08')
      },
      {
        identification: {
          codeEntreprise: 'ENT9',
          nomEntreprise: 'Iota Media',
          raisonSociale: 'Iota Media SARL',
          region: 'Adamaoua',
          ville: 'Ngaoundéré',
          dateCreation: parseDate('2016-08-12'),
          secteurActivite: mapSecteurActivite('Médias'),
          sousSecteur: mapSousSecteur('Médias'),
          formeJuridique: mapFormeJuridique('SARL'),
          numeroContribuable: generateNumeroContribuable(),
          siret: '45678901230044',
          codeAPE: '5911A',
          tvaIntracommunautaire: 'FR456789012'
        },
        performanceEconomique: {
          chiffreAffaires: {
            montant: 130000000,
            devise: 'FCFA',
            periode: 'Année complète'
          }
        },
        investissementEmploi: {
          effectifsEmployes: 70
        },
        contact: {
          adresse: {
            rue: '66 Avenue des Arts',
            ville: 'Ngaoundéré',
            pays: 'Cameroun'
          },
          telephone: '+237 691 234 567',
          email: 'redaction@iotamedia.com',
          siteWeb: 'www.iotamedia.com'
        },
        notes: 'Campagnes publicitaires',
        crm: {
          contactPrincipal: 'Chantal Mvondo',
          idContactPrincipal: adminUserId,
          dateDernierContact: parseDate('2023-09-20'),
          prochainContact: parseDate('2024-02-20'),
          sourceAcquisition: 'Salon',
          utilisateurResponsable: 'admin',
          idUtilisateurResponsable: adminUserId
        },
        contrat: {
          dateDebutContrat: parseDate('2023-08-01'),
          dateFinContrat: parseDate('2024-07-31'),
          montantContrat: 500000,
          frequenceFacturation: mapFrequenceFacturation('Mensuelle'),
          produitsServicesAchetes: 'Publicité digitale, Production vidéo'
        },
        support: {
          supportTechnique: 'Oui',
          niveauSupport: mapNiveauSupport('Bronze')
        },
        donneesAnnuelles: {
          '2019': 100000000,
          '2020': 110000000,
          '2021': 115000000,
          '2022': 125000000,
          '2023': 130000000,
          '2024': 135000000
        },
        statut: 'Actif',
        conformite: 'Conforme',
        informationsCompletes: true,
        dateModification: parseDate('2023-10-12')
      }
    ];

    // Générer la liste des identifiants
    console.log('\n📋 Génération de la liste des identifiants...');
    const credentials = generateCredentialsList(entreprisesTest);
    
    // Sauvegarder les identifiants dans des fichiers
    saveCredentialsToFile(credentials);
    
    // Afficher la liste des identifiants
    console.log('\n📧 LISTE DES IDENTIFIANTS DES ENTREPRISES :');
    console.log('='.repeat(80));
    console.log('Mot de passe commun pour toutes les entreprises : Aa123456\n');
    credentials.forEach(cred => {
      console.log(`${cred.numero}. ${cred.entreprise}`);
      console.log(`   📧 Email : ${cred.email}`);
      console.log(`   🔑 Mot de passe : ${cred.motDePasse}`);
      console.log('-'.repeat(80));
    });
    console.log(`\n✅ Fichiers sauvegardés dans server/scripts/\n`);

    console.log(`\n📝 Insertion de ${entreprisesTest.length} entreprise(s) de test...\n`);

    // Insérer les entreprises et créer les utilisateurs associés
    const createdEntreprises = [];
    const createdUsers = [];
    const errors = [];
    
    for (let i = 0; i < entreprisesTest.length; i++) {
      const entrepriseData = entreprisesTest[i];
      const credential = credentials[i];
      
      try {
        // Créer l'utilisateur pour l'entreprise
        const user = await createEntrepriseUser(entrepriseData, credential.email, credential.motDePasse);
        createdUsers.push(user);
        
        // Associer l'entreprise à l'utilisateur
        entrepriseData.contact.email = credential.email; // Mettre à jour l'email de contact
        
        // Créer l'entreprise
      const entreprise = await insertTestEntreprise(entrepriseData);
        
        // Lier l'utilisateur à l'entreprise
        user.entrepriseId = entreprise._id;
        await user.save();
        
        // Mettre à jour les références CRM avec l'utilisateur créé
        if (entreprise.crm) {
          entreprise.crm.idContactPrincipal = user._id;
          await entreprise.save();
        }
        
      createdEntreprises.push(entreprise);
      } catch (error) {
        errors.push({
          entreprise: entrepriseData.identification?.nomEntreprise,
          error: error.message
        });
      }
    }

    console.log(`\n✅ ${createdEntreprises.length} entreprise(s) créée(s) avec succès !`);
    console.log(`✅ ${createdUsers.length} utilisateur(s) créé(s) avec succès !`);
    
    if (errors.length > 0) {
      console.log(`\n⚠️  ${errors.length} erreur(s) lors de l'insertion :`);
      errors.forEach((err, index) => {
        console.log(`  ${index + 1}. ${err.entreprise}: ${err.error}`);
      });
    }

    console.log('\n📋 Résumé des entreprises créées :');
    createdEntreprises.forEach((ent, index) => {
      const credential = credentials[index];
      console.log(`  ${index + 1}. ${ent.identification?.nomEntreprise} (${ent.identification?.codeEntreprise || 'N/A'})`);
      console.log(`     📧 Email : ${credential?.email || 'N/A'}`);
      console.log(`     🆔 ID Entreprise : ${ent._id}`);
    });
    
    console.log('\n💾 Les identifiants complets ont été sauvegardés dans :');
    console.log('   - server/scripts/entreprises-credentials.txt');
    console.log('   - server/scripts/entreprises-credentials.json');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('\n🔌 Connexion MongoDB fermée');
    process.exit(0);
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { insertTestEntreprise };
