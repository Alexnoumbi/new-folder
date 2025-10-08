# Guide Utilisateur - TrackImpact Monitor

## Table des Matières
1. [Premiers Pas](#premiers-pas)
2. [Gestion de Projets](#gestion-de-projets)
3. [Cadres de Résultats](#cadres-de-résultats)
4. [Collecte de Données](#collecte-de-données)
5. [Portfolios](#portfolios)
6. [Collaboration](#collaboration)
7. [Rapports](#rapports)

---

## 1. Premiers Pas

### Création de Compte

1. Accédez à la page d'accueil de TrackImpact
2. Cliquez sur "Essai Gratuit" ou "S'inscrire"
3. Remplissez le formulaire d'inscription:
   - Nom et prénom
   - Email professionnel
   - Mot de passe (min. 8 caractères)
   - Organisation
   - Rôle
4. Validez votre email
5. Connectez-vous à votre compte

### Tableau de Bord

Le tableau de bord principal affiche:
- **Métriques clés**: Projets actifs, bénéficiaires, budget, indicateurs
- **Graphiques de performance**: Évolution des projets dans le temps
- **Activités récentes**: Dernières actions sur la plateforme
- **Tâches en attente**: Approbations et actions requises

---

## 2. Gestion de Projets

### Créer un Projet

1. Naviguez vers **Projets** > **Nouveau Projet**
2. Remplissez les informations d'identification:
   - Nom du projet
   - Région et localisation
   - Secteur d'activité
   - Dates de début et fin
3. Ajoutez les informations économiques:
   - Budget total
   - Sources de financement
   - Objectifs financiers
4. Définissez les indicateurs d'emploi:
   - Employés actuels
   - Objectifs de création d'emplois
5. Enregistrez le projet

### Gérer un Projet

#### Onglet Vue d'ensemble
- Visualisez toutes les informations du projet
- Consultez les indicateurs clés
- Vérifiez le statut de conformité

#### Onglet Indicateurs
- Ajoutez de nouveaux KPIs
- Suivez les valeurs actuelles vs cibles
- Visualisez les tendances

#### Onglet Documents
- Téléchargez des documents
- Organisez par catégories
- Utilisez l'OCR pour extraire des données

#### Onglet Visites
- Planifiez des visites de terrain
- Consultez l'historique des visites
- Générez des rapports de visite

---

## 3. Cadres de Résultats

### Créer un Cadre de Résultats

1. Accédez à **Cadres de Résultats** > **Nouveau Cadre**
2. Sélectionnez le type:
   - **Cadre Logique (Logframe)**
   - **Théorie du Changement**
   - **Chaîne de Résultats**
   - **Cartographie des Résultats**

3. Définissez l'impact:
   - Description de l'impact attendu
   - Indicateurs d'impact
   - Moyens de vérification
   - Hypothèses

### Ajouter des Résultats (Outcomes)

1. Cliquez sur **Ajouter un Outcome**
2. Remplissez:
   - Description du résultat
   - Indicateurs associés
   - Date cible
   - Responsable
   - Moyens de vérification
3. Définissez les hypothèses et risques

### Ajouter des Produits (Outputs)

1. Cliquez sur **Ajouter un Output**
2. Liez l'output à un outcome
3. Définissez les indicateurs
4. Assignez un responsable

### Ajouter des Activités

1. Cliquez sur **Ajouter une Activité**
2. Liez l'activité à un output
3. Définissez:
   - Description
   - Intrants nécessaires
   - Budget
   - Timeline (dates début/fin)
   - Responsable
4. Suivez la progression

### Théorie du Changement

1. Activez l'onglet **Théorie du Changement**
2. Définissez l'objectif ultime
3. Ajoutez les outcomes:
   - Long terme
   - Moyen terme
   - Court terme
4. Listez les hypothèses critiques
5. Identifiez les facteurs externes

---

## 4. Collecte de Données

### Créer un Formulaire

1. Naviguez vers **Formulaires** > **Nouveau Formulaire**
2. Configurez les paramètres de base:
   - Nom du formulaire
   - Description
   - Type (collecte, enquête, évaluation)
   - Projet associé

3. Créer des sections:
   - Ajoutez une section
   - Donnez-lui un titre
   - Définissez si elle est répétable

4. Ajouter des champs:

#### Types de Champs Disponibles
- **Texte**: Texte court, texte long
- **Numérique**: Nombre, devise, échelle
- **Date/Heure**: Date, heure, date-heure
- **Sélection**: Liste déroulante, choix multiples, radio
- **Fichiers**: Upload fichier, image
- **Spéciaux**: Localisation GPS, signature, rating

#### Configuration des Champs
```javascript
{
  label: "Nom du champ",
  type: "TEXT",
  required: true,
  validation: {
    minLength: 3,
    maxLength: 100
  },
  conditional: {
    dependsOn: "autre_champ",
    condition: "equals",
    value: "oui"
  }
}
```

### Lier aux Indicateurs

1. Sélectionnez un champ
2. Cliquez sur "Lier à un indicateur"
3. Choisissez l'indicateur
4. Définissez la règle de calcul

### Publier le Formulaire

1. Vérifiez tous les champs
2. Testez le formulaire
3. Cliquez sur **Publier**
4. Partagez le lien ou activez la collecte

### Gérer les Soumissions

1. Accédez à **Soumissions**
2. Visualisez les données collectées
3. Approuvez/Rejetez les soumissions
4. Exportez en Excel/CSV

---

## 5. Portfolios

### Créer un Portfolio

1. Allez dans **Portfolios** > **Nouveau Portfolio**
2. Renseignez:
   - Nom du portfolio
   - Code unique
   - Type (Programme, Thématique, Région, Bailleur)
   - Description
3. Définissez la période

### Ajouter des Projets

1. Ouvrez le portfolio
2. Cliquez sur **Ajouter des Projets**
3. Sélectionnez les projets à inclure
4. Validez

### Indicateurs Agrégés

1. Accédez à **Indicateurs Agrégés**
2. Créez un nouvel indicateur:
   - Nom de l'indicateur agrégé
   - Type d'agrégation:
     - **SOMME**: Addition des valeurs
     - **MOYENNE**: Moyenne simple
     - **MOYENNE PONDÉRÉE**: Avec coefficients
     - **POURCENTAGE**: Calcul de %
     - **COMPTAGE**: Nombre d'éléments
3. Sélectionnez les indicateurs sources
4. Définissez la cible
5. Sauvegardez

### Budget Consolidé

Le budget consolidé affiche automatiquement:
- Budget total alloué
- Budget dépensé (tous projets)
- Budget engagé
- Budget disponible
- Répartition par projet

### Analyse de Performance

1. Définissez les dimensions de performance:
   ```javascript
   {
     name: "Efficacité",
     weight: 25,
     score: 85
   }
   ```
2. Le score global est calculé automatiquement
3. Visualisez les tendances

### Gestion des Risques

1. Ajoutez un risque:
   - Description
   - Catégorie (Financier, Opérationnel, etc.)
   - Probabilité (Faible, Moyenne, Élevée, Critique)
   - Impact (Faible, Moyenne, Élevée, Critique)
   - Projets affectés
   - Stratégie de mitigation
2. Assignez un propriétaire
3. Suivez le statut

### Leçons Apprises

1. Documentez les leçons:
   - Titre
   - Description
   - Catégorie
   - Projet source
   - Recommandations
2. Partagez avec l'équipe
3. Appliquez aux nouveaux projets

---

## 6. Collaboration

### Discussions

#### Créer une Discussion

1. Accédez à **Collaboration** > **Discussions**
2. Cliquez sur **Nouvelle Discussion**
3. Configurez:
   - Titre
   - Description
   - Type d'entité (Projet, Indicateur, etc.)
   - Priorité
4. Ajoutez des participants
5. Créez la discussion

#### Participer à une Discussion

1. Ouvrez la discussion
2. Ajoutez un message
3. Mentionnez des utilisateurs avec @nom
4. Joignez des fichiers
5. Ajoutez des réactions (emoji)

#### Créer des Tâches

1. Dans une discussion, cliquez **Nouvelle Tâche**
2. Définissez:
   - Description
   - Assigné à
   - Date d'échéance
   - Priorité
3. Suivez le statut (À faire, En cours, Terminé)

### Workflows d'Approbation

#### Créer un Workflow

1. Naviguez vers **Workflows** > **Nouveau Workflow**
2. Définissez:
   - Nom du workflow
   - Type applicable (Soumission formulaire, Rapport, etc.)

3. Configurez les étapes:

**Étape 1: Validation Terrain**
```javascript
{
  order: 1,
  name: "Validation Terrain",
  approvers: {
    type: "ROLE",
    role: "Coordinateur Terrain"
  },
  requiresAllApprovers: false,
  slaHours: 24,
  allowedActions: ["APPROVE", "REJECT", "REQUEST_CHANGES"]
}
```

**Étape 2: Validation M&E**
```javascript
{
  order: 2,
  name: "Validation M&E",
  approvers: {
    type: "SPECIFIC_USERS",
    users: [userId1, userId2]
  },
  requiresAllApprovers: true,
  slaHours: 48
}
```

4. Configurez les notifications
5. Activez le workflow

#### Approuver/Rejeter

1. Consultez **Mes Approbations**
2. Ouvrez l'élément à approuver
3. Examinez les détails
4. Actions possibles:
   - **Approuver**: Valider et passer à l'étape suivante
   - **Rejeter**: Refuser avec raison
   - **Demander des Modifications**: Retourner au soumetteur
   - **Déléguer**: Transférer à un collègue

5. Ajoutez un commentaire
6. Joignez des documents si nécessaire
7. Validez votre action

---

## 7. Rapports

### Rapports de Portfolio

#### PDF
1. Ouvrez un portfolio
2. Cliquez sur **Exporter** > **PDF**
3. Le rapport inclut:
   - Résumé exécutif
   - Statistiques clés
   - Performance
   - Liste des projets
   - Indicateurs
   - Risques

#### Excel
1. Ouvrez un portfolio
2. Cliquez sur **Exporter** > **Excel**
3. Le fichier contient:
   - **Feuille 1**: Résumé
   - **Feuille 2**: Projets détaillés
   - **Feuille 3**: Indicateurs
   - **Feuille 4**: Risques

### Rapports de Cadre de Résultats

1. Ouvrez un cadre de résultats
2. Cliquez sur **Rapport**
3. Sélectionnez le format (PDF/Excel)
4. Le rapport comprend:
   - Hiérarchie Impact > Outcomes > Outputs > Activities
   - Indicateurs par niveau
   - Progression globale
   - Risques et hypothèses

### Rapports de Formulaire

1. Accédez aux soumissions d'un formulaire
2. Cliquez sur **Exporter**
3. Sélectionnez Excel
4. Le fichier inclut:
   - Une ligne par soumission
   - Toutes les réponses
   - Métadonnées (date, soumetteur, statut)

### Rapports Consolidés

1. Naviguez vers **Rapports** > **Nouveau Rapport**
2. Configurez:
   - Type de rapport
   - Filtres (période, projets, régions)
   - Indicateurs à inclure
   - Format de sortie
3. Générez le rapport
4. Planifiez l'envoi automatique (optionnel)

### Planification de Rapports

1. Créez un rapport
2. Activez **Planification**
3. Configurez:
   - Fréquence (Mensuel, Trimestriel, Annuel)
   - Destinataires
   - Format
   - Date de prochain envoi
4. Sauvegardez

---

## Raccourcis Clavier

- `Ctrl + K`: Recherche rapide
- `Ctrl + N`: Nouveau projet/formulaire (selon le contexte)
- `Ctrl + S`: Sauvegarder
- `Ctrl + /`: Aide contextuelle
- `Esc`: Fermer modal/dialogue

## Support

Pour toute question:
- 📧 support@trackimpact.com
- 📚 Documentation complète: docs.trackimpact.com
- 💬 Chat en direct dans l'application
- 🎥 Tutoriels vidéo: youtube.com/trackimpact

---

*Dernière mise à jour: Octobre 2025*

