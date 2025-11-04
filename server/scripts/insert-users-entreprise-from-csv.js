const mongoose = require('mongoose');
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
async function createUserEntreprise(userData) {
  try {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log(`⚠️  Utilisateur avec l'email ${userData.email} existe déjà`);
      return existingUser;
    }

    const user = await User.create(userData);
    console.log(`✅ Utilisateur créé : ${userData.email} (${userData.nom} ${userData.prenom})`);
    return user;
  } catch (error) {
    console.error(`❌ Erreur lors de la création de l'utilisateur ${userData.email}:`, error.message);
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

    // Générer les identifiants
    let emailCounter = 111;
    const credentials = [];
    const usersToCreate = [];

    entreprisesCSV.forEach((entrepriseCSV, index) => {
      const email = `ent${emailCounter}@gmail.com`;
      const password = 'Aa123456';
      
      // Extraire nom et prénom du promoteur
      const nomPromotteur = entrepriseCSV.nomPromotteur || entrepriseCSV.raisonSociale || 'Contact';
      const [prenom, ...nomParts] = nomPromotteur.split(' ');
      const nom = nomParts.join(' ') || entrepriseCSV.raisonSociale || 'Entreprise';

      credentials.push({
        numero: index + 1,
        entreprise: entrepriseCSV.raisonSociale,
        email: email,
        motDePasse: password,
        nom: nom.substring(0, 50),
        prenom: prenom.substring(0, 50) || 'Contact'
      });

      // Déterminer la ville et région
      const lieuImplantation = entrepriseCSV.lieuImplantation || entrepriseCSV.lieuSiege || '';
      const ville = lieuImplantation.split(',')[0].trim() || 'Douala';
      
      // Créer la description avec toutes les données
      const description = `
RAISON SOCIALE: ${entrepriseCSV.raisonSociale}
NUMERO DE CONTRIBUABLE: ${entrepriseCSV.numeroContribuable}
ADRESSE: ${entrepriseCSV.adresse}
FORME JURIDIQUE: ${entrepriseCSV.formeJuridique}
LIEU D'IMPLANTATION: ${lieuImplantation}
NUMERO DE CONVENTION: ${entrepriseCSV.numeroConvention}
DESCRIPTION DU PROJET: ${entrepriseCSV.descriptionProjet || 'Non renseigné'}
TYPE D'ENTREPRISE: ${entrepriseCSV.typeEntreprise}
DATE DE SIGNATURE: ${entrepriseCSV.dateSignature}
MONTANT INVESTISSEMENT: ${entrepriseCSV.montantInvestissement}
NOMBRE EMPLOIS PROJETES: ${entrepriseCSV.nombreEmploisProjetes}
EFFECTIF TOTAL: ${entrepriseCSV.effectifTotal}
SECTEUR D'ACTIVITE: ${entrepriseCSV.secteurActivite}
LIEU SIEGE: ${entrepriseCSV.lieuSiege}
CAPITAL SOCIAL: ${entrepriseCSV.capitalSocial}
CHIFFRE D'AFFAIRES ANNEE 1: ${entrepriseCSV.chiffreAffairesAnnee1}
CHIFFRE D'AFFAIRES ANNEE 2: ${entrepriseCSV.chiffreAffairesAnnee2}
CHIFFRE D'AFFAIRES ANNEE 3: ${entrepriseCSV.chiffreAffairesAnnee3}
CHIFFRE D'AFFAIRES ANNEE 4: ${entrepriseCSV.chiffreAffairesAnnee4}
CHIFFRE D'AFFAIRES ANNEE 5: ${entrepriseCSV.chiffreAffairesAnnee5}
VALEUR AJOUTEE ANNEE 1: ${entrepriseCSV.valeurAjouteeAnnee1}
VALEUR AJOUTEE ANNEE 2: ${entrepriseCSV.valeurAjouteeAnnee2}
VALEUR AJOUTEE ANNEE 3: ${entrepriseCSV.valeurAjouteeAnnee3}
VALEUR AJOUTEE ANNEE 4: ${entrepriseCSV.valeurAjouteeAnnee4}
VALEUR AJOUTEE ANNEE 5: ${entrepriseCSV.valeurAjouteeAnnee5}
REPONDU AU QUESTIONNAIRE 2024: ${entrepriseCSV.reponduQuestionnaire || 'Non'}
`.trim();

      const userData = {
        nom: nom.substring(0, 50),
        prenom: prenom.substring(0, 50) || 'Contact',
        email: email.toLowerCase(),
        motDePasse: password,
        typeCompte: 'entreprise',
        role: 'user',
        telephone: cleanTelephone(entrepriseCSV.contact),
        adresse: entrepriseCSV.adresse || ville,
        description: description.substring(0, 1000) // Limiter à 1000 caractères si nécessaire
      };

      usersToCreate.push(userData);
      emailCounter++;
    });

    // Afficher et sauvegarder les identifiants
    console.log('\n📧 LISTE DES IDENTIFIANTS DES UTILISATEURS ENTREPRISE :');
    console.log('='.repeat(80));
    console.log('Mot de passe commun pour tous les utilisateurs : Aa123456\n');
    
    credentials.forEach(cred => {
      console.log(`${cred.numero}. ${cred.entreprise}`);
      console.log(`   📧 Email : ${cred.email}`);
      console.log(`   🔑 Mot de passe : ${cred.motDePasse}`);
      console.log(`   👤 Nom : ${cred.nom} ${cred.prenom}`);
      console.log('-'.repeat(80));
    });

    // Sauvegarder les identifiants
    const credentialsPath = path.join(__dirname, 'users-entreprise-credentials.txt');
    const credentialsJSONPath = path.join(__dirname, 'users-entreprise-credentials.json');
    
    let credentialsContent = '='.repeat(80) + '\n';
    credentialsContent += 'IDENTIFIANTS DES UTILISATEURS ENTREPRISE (DEPUIS CSV)\n';
    credentialsContent += '='.repeat(80) + '\n\n';
    credentialsContent += 'Mot de passe commun pour tous les utilisateurs : Aa123456\n\n';
    
    credentials.forEach(cred => {
      credentialsContent += `${cred.numero}. ${cred.entreprise}\n`;
      credentialsContent += `   Email : ${cred.email}\n`;
      credentialsContent += `   Mot de passe : ${cred.motDePasse}\n`;
      credentialsContent += `   Nom complet : ${cred.prenom} ${cred.nom}\n`;
      credentialsContent += '-'.repeat(80) + '\n';
    });
    
    fs.writeFileSync(credentialsPath, credentialsContent, 'utf8');
    fs.writeFileSync(credentialsJSONPath, JSON.stringify(credentials, null, 2), 'utf8');
    
    console.log(`\n✅ Fichiers d'identifiants sauvegardés :`);
    console.log(`   - ${credentialsPath}`);
    console.log(`   - ${credentialsJSONPath}\n`);

    // Créer les utilisateurs
    console.log(`\n📝 Création de ${usersToCreate.length} utilisateur(s) entreprise...\n`);
    
    const createdUsers = [];
    const errors = [];

    for (const userData of usersToCreate) {
      try {
        const user = await createUserEntreprise(userData);
        createdUsers.push(user);
      } catch (error) {
        errors.push({
          email: userData.email,
          error: error.message
        });
      }
    }

    console.log(`\n✅ ${createdUsers.length} utilisateur(s) créé(s) avec succès !`);
    
    if (errors.length > 0) {
      console.log(`\n⚠️  ${errors.length} erreur(s) lors de la création :`);
      errors.forEach((err, index) => {
        console.log(`  ${index + 1}. ${err.email}: ${err.error}`);
      });
    }

    // Résumé final
    console.log('\n' + '='.repeat(80));
    console.log('📋 RÉSUMÉ FINAL - EMAILS, MOTS DE PASSE ET NOMS D\'UTILISATEURS');
    console.log('='.repeat(80));
    console.log('\nMot de passe commun pour tous les utilisateurs : Aa123456\n');
    
    createdUsers.forEach((user, index) => {
      const credential = credentials[index];
      console.log(`${index + 1}. ${user.prenom} ${user.nom}`);
      console.log(`   📧 Email : ${user.email}`);
      console.log(`   🔑 Mot de passe : ${credential?.motDePasse || 'Aa123456'}`);
      console.log(`   🏢 Entreprise : ${credential?.entreprise || 'N/A'}`);
      console.log(`   📞 Téléphone : ${user.telephone || 'Non renseigné'}`);
      console.log(`   🆔 ID Utilisateur : ${user._id}`);
      console.log('-'.repeat(80));
    });

    console.log(`\n💾 Total : ${createdUsers.length} utilisateur(s) créé(s)`);
    console.log(`📄 Les identifiants complets ont été sauvegardés dans :`);
    console.log(`   - server/scripts/users-entreprise-credentials.txt`);
    console.log(`   - server/scripts/users-entreprise-credentials.json`);

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

module.exports = { parseCSV, createUserEntreprise };

