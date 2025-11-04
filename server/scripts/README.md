# Scripts d'insertion de données de test

## Insertion d'entreprises de test

Ce script permet d'insérer des entreprises de test dans la base de données MongoDB à partir des données du tableur.

### Utilisation

```bash
# Depuis le dossier server
node scripts/insert-test-entreprises.js
```

### Prérequis

- MongoDB doit être accessible (variable d'environnement `MONGODB_URI` configurée)
- Un utilisateur admin doit exister dans la base de données (pour les références CRM)

### Données insérées

Le script insère **9 entreprises de test** avec toutes les informations suivantes :

- **Identification** : nom, raison sociale, région, ville, date de création, secteur d'activité, forme juridique, SIRET, CODE APE, TVA intracommunautaire
- **Contact** : adresse complète, téléphone, email, site web
- **Performance économique** : chiffre d'affaires
- **Investissement et emploi** : effectifs employés
- **CRM** : contact principal, dates de contact, source d'acquisition, utilisateur responsable
- **Contrat** : dates, montant, fréquence de facturation, produits/services
- **Support** : niveau de support technique
- **Données annuelles** : indicateurs pour les années 2019-2024
- **Notes** et métadonnées diverses

### Fonctionnalités

- **Détection de doublons** : Vérifie si une entreprise existe déjà (par numéro contribuable ou SIRET)
- **Génération automatique** : Crée des numéros de contribuable uniques automatiquement
- **Mapping intelligent** : Convertit automatiquement les valeurs du tableur vers les formats attendus par le modèle
- **Gestion des erreurs** : Continue l'insertion même en cas d'erreur sur une entreprise spécifique

### Format des données

Chaque entreprise doit avoir au minimum :

```javascript
{
  identification: {
    codeEntreprise: 'ENT1',
    nomEntreprise: 'Nom de l\'entreprise',
    raisonSociale: 'Raison sociale',
    region: 'Centre', // ou 'Littoral', 'Nord', etc.
    ville: 'Yaoundé',
    dateCreation: new Date('2020-01-15'),
    secteurActivite: 'Tertiaire', // ou 'Primaire', 'Secondaire'
    sousSecteur: 'Commerce', // voir la liste dans le modèle
    formeJuridique: 'SARL', // ou 'SA', 'EI', 'EURL', etc.
    numeroContribuable: 'M1234567890123' // Doit être unique
  },
  contact: {
    email: 'contact@entreprise.com',
    telephone: '+237 6 12 34 56 78',
    adresse: {
      rue: '123 Rue Principale',
      ville: 'Yaoundé',
      pays: 'Cameroun'
    }
  },
  investissementEmploi: {
    effectifsEmployes: 50
  },
  statut: 'Actif', // ou 'En attente', 'Inactif', 'Suspendu'
  conformite: 'Conforme' // ou 'Non conforme', 'En cours de vérification', 'Non vérifié'
}
```

### Personnalisation

Pour ajouter vos propres entreprises de test, modifiez le fichier `insert-test-entreprises.js` et ajoutez vos données dans le tableau `entreprisesTest`.

### Exemple d'utilisation avec données personnalisées

Vous pouvez aussi créer un fichier JSON séparé et modifier le script pour le lire :

```javascript
const fs = require('fs');
const entreprisesData = JSON.parse(fs.readFileSync('mes-entreprises.json', 'utf8'));
// ... puis utiliser entreprisesData au lieu de entreprisesTest
```

### Résultat attendu

Après l'exécution, vous devriez voir :

```
✅ 9 entreprise(s) créée(s) avec succès !
📋 Résumé des entreprises créées :
  1. Entreprise Alpha (ENT1) - ID: ...
  2. Beta Solutions (ENT2) - ID: ...
  ...
```

