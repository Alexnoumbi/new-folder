const mongoose = require('mongoose');
const Entreprise = require('../models/Entreprise');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Fonction pour parser une ligne CSV en tenant compte des guillemets
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Fonction pour parser le fichier CSV
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = parseCSVLine(lines[0]);
  
  const data = [];
  for (let i = 2; i < lines.length; i++) { // Skip header and sub-header
    const values = parseCSVLine(lines[i]);
    if (values.length > 0 && values[0]) { // Skip empty lines
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
  }
  
  return data;
}

// Fonction pour convertir une date au format DD/MM/YYYY
function parseDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return new Date();
  if (dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  return new Date(dateStr);
}

// Fonction pour convertir un nombre avec virgules
function parseNumber(numStr) {
  if (!numStr || numStr.trim() === '') return 0;
  return parseFloat(numStr.replace(/,/g, '').replace(/"/g, '')) || 0;
}

// Fonction pour déterminer la région à partir de la ville
function getRegionFromVille(ville) {
  const villeUpper = ville.toUpperCase();
  const regionMap = {
    'DOUALA': 'Littoral',
    'YAOUNDE': 'Centre',
    'YAOUNDÉ': 'Centre',
    'NGAOUNDERE': 'Adamaoua',
    'NGAOUNDÉRÉ': 'Adamaoua',
    'GAROUA': 'Nord',
    'BUEA': 'Sud-Ouest',
    'BAMENDA': 'Nord-Ouest',
    'BAFOUSSAM': 'Ouest',
    'MAROUA': 'Extrême-Nord',
    'EBOLOWA': 'Sud',
    'BERTOUA': 'Est'
  };
  
  for (const [key, region] of Object.entries(regionMap)) {
    if (villeUpper.includes(key)) {
      return region;
    }
  }
  return 'Centre'; // Par défaut
}

// Fonction pour mapper le secteur d'activité
function mapSecteurActivite(description) {
  if (!description) return 'Tertiaire';
  
  const descUpper = description.toUpperCase();
  if (descUpper.includes('PHARMACEUTIQUE') || descUpper.includes('SANTE')) {
    return 'Secondaire';
  }
  if (descUpper.includes('BATIMENT') || descUpper.includes('TRAVAUX') || descUpper.includes('CONSTRUCTION')) {
    return 'Secondaire';
  }
  if (descUpper.includes('AGROALIMENTAIRE') || descUpper.includes('ALIMENTAIRE') || descUpper.includes('HUILE')) {
    return 'Secondaire';
  }
  if (descUpper.includes('SIDERURGIQUE') || descUpper.includes('METALLURGIQUE') || descUpper.includes('CIMENT')) {
    return 'Secondaire';
  }
  if (descUpper.includes('CHIMIQUE')) {
    return 'Secondaire';
  }
  if (descUpper.includes('IMMOBILIERE') || descUpper.includes('IMMOBILIER')) {
    return 'Tertiaire';
  }
  return 'Tertiaire';
}

// Fonction pour mapper le sous-secteur
function mapSousSecteur(description) {
  if (!description) return 'Autres';
  
  const descUpper = description.toUpperCase();
  if (descUpper.includes('PHARMACEUTIQUE') || descUpper.includes('SANTE')) {
    return 'Santé';
  }
  if (descUpper.includes('BATIMENT') || descUpper.includes('TRAVAUX') || descUpper.includes('CONSTRUCTION')) {
    return 'BTP';
  }
  if (descUpper.includes('AGROALIMENTAIRE') || descUpper.includes('ALIMENTAIRE') || descUpper.includes('HUILE')) {
    return 'Agro-industriel';
  }
  if (descUpper.includes('SIDERURGIQUE') || descUpper.includes('METALLURGIQUE') || descUpper.includes('CIMENT')) {
    return 'Industrie manufacturière';
  }
  if (descUpper.includes('CHIMIQUE')) {
    return 'Industrie manufacturière';
  }
  if (descUpper.includes('IMMOBILIERE') || descUpper.includes('IMMOBILIER')) {
    return 'Autres';
  }
  return 'Autres';
}

// Fonction pour nettoyer le numéro de contribuable (enlever les tirets)
function cleanNumeroContribuable(numero) {
  if (!numero) return null;
  return numero.replace(/-/g, '').toUpperCase();
}

// Fonction pour extraire nom et prénom du promoteur
function parsePromoteur(nomPromoteur) {
  if (!nomPromoteur || nomPromoteur.trim() === '') {
    return { nom: '', prenom: '' };
  }
  
  const parts = nomPromoteur.trim().split(/\s+/);
  if (parts.length === 1) {
    return { nom: parts[0], prenom: '' };
  }
  if (parts.length === 2) {
    return { prenom: parts[0], nom: parts[1] };
  }
  // Si plus de 2 parties, prendre la première comme prénom et le reste comme nom
  return { prenom: parts[0], nom: parts.slice(1).join(' ') };
}

// Fonction pour générer un email à partir du nom de l'entreprise
function generateEmail(raisonSociale, numeroContribuable) {
  if (!raisonSociale || raisonSociale.trim() === '') {
    return `entreprise${numeroContribuable}@example.com`;
  }
  
  // Nettoyer le nom pour créer un email valide
  const clean = raisonSociale
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .substring(0, 30);
  
  // S'assurer qu'on a au moins quelque chose
  if (clean.length === 0) {
    return `entreprise${numeroContribuable}@example.com`;
  }
  
  return `${clean}@example.com`;
}

// Fonction principale d'import
async function importEntreprises() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion-entreprises');
    console.log('✅ Connecté à MongoDB');

    // Chemin du fichier CSV
    const csvPath = path.join(__dirname, '../../donnees tests.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ Fichier CSV non trouvé:', csvPath);
      process.exit(1);
    }

    console.log('📖 Lecture du fichier CSV...');
    const csvData = parseCSV(csvPath);
    console.log(`📊 ${csvData.length} entreprises trouvées dans le CSV`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      
      try {
        const raisonSociale = row["RAISON SOCIALE DE L'ENTREPRISE"] || '';
        const numeroContribuableRaw = row['NUMERO DE CONTRIBUABLE'] || '';
        const numeroContribuable = cleanNumeroContribuable(numeroContribuableRaw);
        
        if (!numeroContribuable) {
          console.log(`⚠️  Ligne ${i + 3}: Numéro de contribuable manquant, ignorée`);
          errorCount++;
          continue;
        }

        // Vérifier si l'entreprise existe déjà
        const existingEntreprise = await Entreprise.findOne({
          'identification.numeroContribuable': numeroContribuable
        });

        if (existingEntreprise) {
          console.log(`⚠️  Entreprise ${numeroContribuable} existe déjà, ignorée`);
          // Mettre à jour l'utilisateur si nécessaire
          const existingUser = await User.findOne({ email: generateEmail(raisonSociale, numeroContribuable) });
          if (!existingUser && existingEntreprise) {
            const { nom: nomPromoteurValue, prenom: prenomPromoteurValue } = parsePromoteur(nomPromoteur);
            const email = generateEmail(raisonSociale, numeroContribuable);
            const user = await User.create({
              email,
              motDePasse: 'Password123!',
              nom: nomPromoteurValue || raisonSociale.substring(0, 50) || 'Entreprise',
              prenom: prenomPromoteurValue || '',
              role: 'user',
              typeCompte: 'entreprise',
              telephone: contact.replace(/,/g, '').replace(/"/g, '').trim() || '',
              status: 'active',
              entrepriseId: existingEntreprise._id
            });
            console.log(`👤 Utilisateur créé pour entreprise existante: ${email}`);
          }
          continue;
        }

        const adresse = row["ADRESSE DE L'ENTREPRISE"] || '';
        const contact = row['CONTACT'] || '';
        const nomPromoteur = row['NOM DU PROMOTTEUR'] || '';
        const formeJuridique = row['FORME JURIDIQUE'] || 'SA';
        const lieuImplantation = row["LIEU D'IMPLATATION DU PROJET"] || row["LIEU D'IMPLANTATION DU SIEGE"] || '';
        const numeroConvention = row['NUMERO DE CONVENTION'] || '';
        const descriptionProjet = row["DESCRIPTION DU PROJET D'INVESTISSEMENT"] || '';
        const typeEntreprise = row["TYPE D'ENTREPRISE"] || '';
        const dateSignature = row['DATE DE SIGNATURE'] || '';
        const montantInvestissement = row['MONTANT INITIAL D\'INVESTISSEMENTS PROJETES'] || '';
        const nombreEmplois = row['NOMBRE INITIAL D\'EMPLOIS PROJETES'] || '';
        const secteurActivite = row['SECTEUR D\'ACTIVITE'] || '';
        const capitalSocial = row['CAPITAL SOCIAL'] || '';
        const effectifTotal = row['EFFECTIF TOTAL'] || nombreEmplois;

        // Extraire les informations du promoteur
        const { nom: nomPromoteurValue, prenom: prenomPromoteurValue } = parsePromoteur(nomPromoteur);

        // Générer l'email
        const email = generateEmail(raisonSociale, numeroContribuable);

        // Vérifier si l'utilisateur existe déjà
        let user = await User.findOne({ email });
        
        if (!user) {
          // Créer l'utilisateur
          const nomValue = nomPromoteurValue || raisonSociale.substring(0, 50) || 'Entreprise';
          const prenomValue = prenomPromoteurValue || '';
          const telephoneValue = contact.replace(/,/g, '').replace(/"/g, '').trim() || '';
          
          user = await User.create({
            email,
            motDePasse: 'Password123!', // Mot de passe par défaut
            nom: nomValue,
            prenom: prenomValue,
            role: 'user',
            typeCompte: 'entreprise',
            telephone: telephoneValue,
            status: 'active'
          });
          console.log(`👤 Utilisateur créé: ${email}`);
        } else {
          console.log(`⚠️  Utilisateur existe déjà: ${email}`);
        }

        // Préparer les données de l'entreprise
        const ville = lieuImplantation || 'Yaoundé';
        const region = getRegionFromVille(ville);
        const secteur = secteurActivite ? mapSecteurActivite(secteurActivite) : mapSecteurActivite(descriptionProjet);
        const sousSecteur = secteurActivite ? mapSousSecteur(secteurActivite) : mapSousSecteur(descriptionProjet);
        
        // Créer l'entreprise
        const entrepriseData = {
          identification: {
            nomEntreprise: raisonSociale || `Entreprise ${numeroContribuable}`,
            raisonSociale: raisonSociale,
            region: region,
            ville: ville,
            dateCreation: parseDate(dateSignature),
            secteurActivite: secteur,
            sousSecteur: sousSecteur,
            filiereProduction: descriptionProjet.substring(0, 100) || '',
            formeJuridique: formeJuridique.toUpperCase() === 'SA' ? 'SA' : 
                           formeJuridique.toUpperCase() === 'SARL' ? 'SARL' :
                           formeJuridique.toUpperCase() === 'SCI' ? 'Autres' :
                           formeJuridique.toUpperCase() === 'E' ? 'SA' : 'SA',
            typeEntreprise: typeEntreprise || '',
            numeroContribuable: numeroContribuable
          },
          contact: {
            telephone: contact.replace(/,/g, '').replace(/"/g, '') || null,
            email: email,
            adresse: {
              rue: adresse || '',
              ville: ville,
              pays: 'Cameroun'
            }
          },
          investissementEmploi: {
            effectifsEmployes: parseInt(effectifTotal) || parseInt(nombreEmplois) || 0
          },
          statut: 'En attente',
          description: descriptionProjet || '',
          notes: `Numéro de convention: ${numeroConvention}\n` +
                 `Date de signature: ${dateSignature}\n` +
                 `Montant initial d'investissement: ${montantInvestissement}\n` +
                 `Capital social: ${capitalSocial}`.substring(0, 5000)
        };

        // Ajouter les informations financières si disponibles
        if (montantInvestissement) {
          entrepriseData.performanceEconomique = {
            chiffreAffaires: {
              montant: parseNumber(montantInvestissement),
              devise: 'FCFA'
            }
          };
        }

        // Ajouter le capital social
        if (capitalSocial) {
          entrepriseData.finances = {
            budgetAnnuel: parseNumber(capitalSocial)
          };
        }

        const entreprise = await Entreprise.create(entrepriseData);

        // Associer l'utilisateur à l'entreprise
        user.entrepriseId = entreprise._id;
        await user.save();

        successCount++;
        console.log(`✅ ${i + 1}/${csvData.length} - Entreprise créée: ${raisonSociale} (${numeroContribuable})`);

      } catch (error) {
        errorCount++;
        const errorMsg = `Ligne ${i + 3}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
        console.error(error.stack);
      }
    }

    console.log('\n📊 Résumé de l\'import:');
    console.log(`✅ Succès: ${successCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Erreurs détaillées:');
      errors.forEach(err => console.log(`  - ${err}`));
    }

    await mongoose.connection.close();
    console.log('\n✅ Import terminé');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  importEntreprises();
}

module.exports = { importEntreprises };

