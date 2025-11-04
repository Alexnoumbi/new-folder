const mongoose = require('mongoose');
const Entreprise = require('../models/Entreprise');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Fonction pour parser un CSV simple
function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 3) return [];
  
  const headers = lines[0].split(',');
  const dataRows = lines.slice(2); // Ignorer la ligne d'en-tête et la ligne de sous-en-têtes
  
  const entreprises = [];
  
  dataRows.forEach((row, index) => {
    if (!row.trim()) return;
    
    // Parser la ligne en tenant compte des virgules dans les guillemets
    const values = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim()); // Ajouter la dernière valeur
    
    if (values.length < 3) return; // Ignorer les lignes vides ou incomplètes
    
    // Extraire les données selon les colonnes
    const entreprise = {
      raisonSociale: values[0] || '',
      numeroContribuable: values[1] || '',
      adresse: values[2] || '',
      contact: values[3] || '',
      nomPromotteur: values[4] || '',
      formeJuridique: values[5] || '',
      lieuImplantation: values[6] || '',
      numeroConvention: values[7] || '',
      descriptionProjet: values[8] || '',
      typeEntreprise: values[9] || '',
      dateSignature: values[10] || '',
      montantInvestissement: values[13] || '',
      nombreEmploisProjetes: values[14] || '',
      secteurActivite: values[25] || '',
      lieuSiege: values[26] || '',
      capitalSocial: values[28] || '',
      // Chiffre d'affaires (années 1-5)
      chiffreAffairesAnnee1: values[51] || '',
      chiffreAffairesAnnee2: values[52] || '',
      chiffreAffairesAnnee3: values[53] || '',
      chiffreAffairesAnnee4: values[54] || '',
      chiffreAffairesAnnee5: values[55] || '',
      // Valeur ajoutée (années 1-5)
      valeurAjouteeAnnee1: values[56] || '',
      valeurAjouteeAnnee2: values[57] || '',
      valeurAjouteeAnnee3: values[58] || '',
      valeurAjouteeAnnee4: values[59] || '',
      valeurAjouteeAnnee5: values[60] || '',
      // Effectifs
      effectifTotal: values[19] || '',
      reponduQuestionnaire: values[62] || ''
    };
    
    if (entreprise.raisonSociale && entreprise.numeroContribuable) {
      entreprises.push(entreprise);
    }
  });
  
  return entreprises;
}

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

// Fonction pour nettoyer un nombre (enlever les virgules et espaces)
function cleanNumber(numStr) {
  if (!numStr) return 0;
  return parseFloat(numStr.toString().replace(/,/g, '').replace(/\s/g, '')) || 0;
}

// Fonction pour mapper le secteur d'activité
function mapSecteurActivite(secteur) {
  if (!secteur) return 'Tertiaire';
  const secteurLower = secteur.toLowerCase();
  if (secteurLower.includes('pharma') || secteurLower.includes('chimique') || secteurLower.includes('alimentaire') || secteurLower.includes('manufacture')) {
    return 'Secondaire';
  }
  if (secteurLower.includes('construction') || secteurLower.includes('immobilier') || secteurLower.includes('bâtiment')) {
    return 'Secondaire';
  }
  return 'Tertiaire';
}

// Fonction pour mapper le sous-secteur
function mapSousSecteur(secteur) {
  if (!secteur) return 'Autres';
  const secteurLower = secteur.toLowerCase();
  if (secteurLower.includes('pharma')) return 'Industrie manufacturière';
  if (secteurLower.includes('construction') || secteurLower.includes('immobilier') || secteurLower.includes('bâtiment')) return 'BTP';
  if (secteurLower.includes('alimentaire') || secteurLower.includes('agro')) return 'Agro-industriel';
  if (secteurLower.includes('chimique')) return 'Industrie manufacturière';
  return 'Autres';
}

// Fonction pour mapper la forme juridique
function mapFormeJuridique(forme) {
  if (!forme) return 'SARL';
  const formeUpper = forme.toUpperCase();
  if (formeUpper.includes('SA')) return 'SA';
  if (formeUpper.includes('SARL')) return 'SARL';
  if (formeUpper.includes('SCI')) return 'Autres';
  if (formeUpper.includes('EURL')) return 'EURL';
  if (formeUpper.includes('SAS')) return 'SAS';
  return 'SARL';
}

// Fonction pour déterminer la région depuis la ville
function mapRegion(ville) {
  if (!ville) return 'Centre';
  const villeUpper = ville.toUpperCase();
  if (villeUpper.includes('DOUALA')) return 'Littoral';
  if (villeUpper.includes('YAOUNDE') || villeUpper.includes('YAOUNDÉ')) return 'Centre';
  if (villeUpper.includes('NGAOUNDERE') || villeUpper.includes('NGAOUNDÉRÉ')) return 'Adamaoua';
  return 'Littoral'; // Par défaut
}

// Fonction pour nettoyer un numéro de téléphone
function cleanTelephone(telStr) {
  if (!telStr) return null;
  // Enlever les virgules et espaces, garder seulement les chiffres et le +
  const cleaned = telStr.toString().replace(/,/g, '').replace(/\s/g, '').trim();
  // Si le numéro commence par des chiffres, ajouter le préfixe +237
  if (cleaned && /^\d/.test(cleaned) && cleaned.length >= 9) {
    return `+237 ${cleaned}`;
  }
  return cleaned || null;
}

// Fonction pour créer un utilisateur entreprise
async function createEntrepriseUser(entrepriseData, email, password, telephone) {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`⚠️  Utilisateur avec l'email ${email} existe déjà`);
      return existingUser;
    }

    const nomPromotteur = entrepriseData.nomPromotteur || 'Contact';
    const [prenom, ...nomParts] = nomPromotteur.split(' ');
    const nom = nomParts.join(' ') || entrepriseData.raisonSociale || 'Entreprise';

    const user = await User.create({
      nom: nom.substring(0, 50),
      prenom: prenom.substring(0, 50) || 'Contact',
      email: email.toLowerCase(),
      motDePasse: password,
      typeCompte: 'entreprise',
      role: 'user',
      telephone: cleanTelephone(telephone)
    });

    console.log(`✅ Utilisateur créé : ${email}`);
    return user;
  } catch (error) {
    console.error(`❌ Erreur lors de la création de l'utilisateur ${email}:`, error.message);
    throw error;
  }
}

// Fonction pour insérer une entreprise
async function insertTestEntreprise(data) {
  try {
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

// Fonction principale
async function main() {
  try {
    // Lire le fichier CSV
    const csvPath = path.join(__dirname, '../../donnees tests.csv');
    console.log(`📖 Lecture du fichier CSV : ${csvPath}`);
    
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ Fichier CSV non trouvé : ${csvPath}`);
      process.exit(1);
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const entreprisesCSV = parseCSV(csvContent);
    
    console.log(`✅ ${entreprisesCSV.length} entreprise(s) trouvée(s) dans le CSV\n`);

    // Connexion à MongoDB
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver l'utilisateur admin
    const adminUser = await User.findOne({ role: 'admin' }).select('_id');
    const adminUserId = adminUser ? adminUser._id : null;
    if (adminUserId) {
      console.log(`👤 Utilisateur admin trouvé (ID: ${adminUserId})`);
    } else {
      console.log('⚠️  Aucun utilisateur admin trouvé');
    }

    // Générer les identifiants
    let emailCounter = 111;
    const credentials = [];
    const entreprisesToInsert = [];

    entreprisesCSV.forEach((entrepriseCSV, index) => {
      const email = `ent${emailCounter}@gmail.com`;
      const password = 'Aa123456';
      
      credentials.push({
        numero: index + 1,
        entreprise: entrepriseCSV.raisonSociale,
        email: email,
        motDePasse: password
      });

      // Déterminer la ville et région
      const lieuImplantation = entrepriseCSV.lieuImplantation || entrepriseCSV.lieuSiege || '';
      const ville = lieuImplantation.split(',')[0].trim() || 'Douala';
      const region = mapRegion(ville);

      // Calculer le chiffre d'affaires moyen (pour les 5 années)
      const caAnnee1 = cleanNumber(entrepriseCSV.chiffreAffairesAnnee1);
      const caAnnee2 = cleanNumber(entrepriseCSV.chiffreAffairesAnnee2);
      const caAnnee3 = cleanNumber(entrepriseCSV.chiffreAffairesAnnee3);
      const caAnnee4 = cleanNumber(entrepriseCSV.chiffreAffairesAnnee4);
      const caAnnee5 = cleanNumber(entrepriseCSV.chiffreAffairesAnnee5);
      const chiffreAffairesMoyen = (caAnnee1 + caAnnee2 + caAnnee3 + caAnnee4 + caAnnee5) / 5 || caAnnee5 || 0;

      // Effectifs
      const effectifs = parseInt(entrepriseCSV.effectifTotal) || parseInt(entrepriseCSV.nombreEmploisProjetes) || 0;

      // Date de création (utiliser la date de signature ou date par défaut)
      const dateCreation = parseDate(entrepriseCSV.dateSignature) || parseDate('2014-01-01');

      // Préparer les données annuelles
      const donneesAnnuelles = {};
      if (caAnnee1) donneesAnnuelles['2019'] = caAnnee1;
      if (caAnnee2) donneesAnnuelles['2020'] = caAnnee2;
      if (caAnnee3) donneesAnnuelles['2021'] = caAnnee3;
      if (caAnnee4) donneesAnnuelles['2022'] = caAnnee4;
      if (caAnnee5) donneesAnnuelles['2023'] = caAnnee5;

      const entrepriseData = {
        identification: {
          codeEntreprise: `ENT${emailCounter}`,
          nomEntreprise: entrepriseCSV.raisonSociale,
          raisonSociale: entrepriseCSV.raisonSociale,
          region: region,
          ville: ville,
          dateCreation: dateCreation,
          secteurActivite: mapSecteurActivite(entrepriseCSV.secteurActivite),
          sousSecteur: mapSousSecteur(entrepriseCSV.secteurActivite),
          formeJuridique: mapFormeJuridique(entrepriseCSV.formeJuridique),
          numeroContribuable: entrepriseCSV.numeroContribuable,
          typeEntreprise: entrepriseCSV.typeEntreprise || 'NOUVELLE'
        },
        performanceEconomique: {
          chiffreAffaires: {
            montant: chiffreAffairesMoyen,
            devise: 'FCFA',
            periode: 'Année complète'
          }
        },
        investissementEmploi: {
          effectifsEmployes: effectifs
        },
        contact: {
          adresse: {
            rue: entrepriseCSV.adresse || '',
            ville: ville,
            pays: 'Cameroun'
          },
          telephone: cleanTelephone(entrepriseCSV.contact),
          email: email,
          siteWeb: null
        },
        notes: entrepriseCSV.descriptionProjet || '',
        crm: {
          contactPrincipal: entrepriseCSV.nomPromotteur || '',
          idContactPrincipal: null, // Sera mis à jour après création de l'utilisateur
          sourceAcquisition: 'Convention',
          utilisateurResponsable: 'admin',
          idUtilisateurResponsable: adminUserId
        },
        donneesAnnuelles: donneesAnnuelles,
        statut: 'Actif',
        conformite: entrepriseCSV.reponduQuestionnaire === 'OUI' ? 'Conforme' : 'Non vérifié',
        informationsCompletes: entrepriseCSV.reponduQuestionnaire === 'OUI',
        dateModification: new Date()
      };

      entreprisesToInsert.push({ 
        entrepriseData, 
        email, 
        password, 
        telephone: entrepriseCSV.contact || null 
      });
      emailCounter++;
    });

    // Afficher et sauvegarder les identifiants
    console.log('\n📧 LISTE DES IDENTIFIANTS DES ENTREPRISES :');
    console.log('='.repeat(80));
    console.log('Mot de passe commun pour toutes les entreprises : Aa123456\n');
    
    credentials.forEach(cred => {
      console.log(`${cred.numero}. ${cred.entreprise}`);
      console.log(`   📧 Email : ${cred.email}`);
      console.log(`   🔑 Mot de passe : ${cred.motDePasse}`);
      console.log('-'.repeat(80));
    });

    // Sauvegarder les identifiants
    const credentialsPath = path.join(__dirname, 'entreprises-credentials-csv.txt');
    const credentialsJSONPath = path.join(__dirname, 'entreprises-credentials-csv.json');
    
    let credentialsContent = '='.repeat(80) + '\n';
    credentialsContent += 'IDENTIFIANTS DES ENTREPRISES DE TEST (DEPUIS CSV)\n';
    credentialsContent += '='.repeat(80) + '\n\n';
    credentialsContent += 'Mot de passe commun pour toutes les entreprises : Aa123456\n\n';
    
    credentials.forEach(cred => {
      credentialsContent += `${cred.numero}. ${cred.entreprise}\n`;
      credentialsContent += `   Email : ${cred.email}\n`;
      credentialsContent += `   Mot de passe : ${cred.motDePasse}\n`;
      credentialsContent += '-'.repeat(80) + '\n';
    });
    
    fs.writeFileSync(credentialsPath, credentialsContent, 'utf8');
    fs.writeFileSync(credentialsJSONPath, JSON.stringify(credentials, null, 2), 'utf8');
    
    console.log(`\n✅ Fichiers d'identifiants sauvegardés :`);
    console.log(`   - ${credentialsPath}`);
    console.log(`   - ${credentialsJSONPath}\n`);

    // Insérer les entreprises
    console.log(`\n📝 Insertion de ${entreprisesToInsert.length} entreprise(s)...\n`);
    
    const createdEntreprises = [];
    const createdUsers = [];
    const errors = [];

    for (const { entrepriseData, email, password, telephone } of entreprisesToInsert) {
      try {
        // Créer l'utilisateur
        const user = await createEntrepriseUser(entrepriseData, email, password, telephone);
        createdUsers.push(user);

        // Mettre à jour les références CRM
        entrepriseData.crm.idContactPrincipal = user._id;
        
        // Créer l'entreprise
        const entreprise = await insertTestEntreprise(entrepriseData);
        
        // Lier l'utilisateur à l'entreprise
        user.entrepriseId = entreprise._id;
        await user.save();
        
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

    // Résumé final
    console.log('\n' + '='.repeat(80));
    console.log('📋 RÉSUMÉ FINAL - EMAILS, MOTS DE PASSE ET NOMS D\'ENTREPRISES');
    console.log('='.repeat(80));
    console.log('\nMot de passe commun pour toutes les entreprises : Aa123456\n');
    
    createdEntreprises.forEach((ent, index) => {
      const credential = credentials[index];
      console.log(`${index + 1}. ${ent.identification?.nomEntreprise || credential?.entreprise}`);
      console.log(`   📧 Email : ${credential?.email || 'N/A'}`);
      console.log(`   🔑 Mot de passe : ${credential?.motDePasse || 'Aa123456'}`);
      console.log(`   🆔 Numéro contribuable : ${ent.identification?.numeroContribuable || 'N/A'}`);
      console.log(`   📍 Ville : ${ent.identification?.ville || 'N/A'}`);
      console.log('-'.repeat(80));
    });

    console.log(`\n💾 Total : ${createdEntreprises.length} entreprise(s) créée(s)`);
    console.log(`📄 Les identifiants complets ont été sauvegardés dans :`);
    console.log(`   - server/scripts/entreprises-credentials-csv.txt`);
    console.log(`   - server/scripts/entreprises-credentials-csv.json`);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion MongoDB fermée');
    process.exit(0);
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { parseCSV, insertTestEntreprise };

