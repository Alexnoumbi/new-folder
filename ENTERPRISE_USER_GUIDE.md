# Guide Utilisateur - Pages Entreprise

## 🏢 Vue d'ensemble de l'Entreprise (`/enterprise/overview`)

### Accès
Depuis le menu principal, cliquez sur **"Aperçu"** ou naviguez vers `/enterprise/overview`

### Fonctionnalités

#### 1. Tableaux de Bord KPI
En haut de la page, vous trouverez 4 cartes principales:

- **Score Global**: Performance globale de votre entreprise (%)
  - Indicateur de tendance (↑ ou ↓)
  - Représente votre conformité générale

- **KPIs Validés**: Nombre d'indicateurs clés validés sur le total
  - Format: `X/Y` (validés/total)
  - Permet de suivre votre progression

- **Documents**: Documents soumis par rapport aux documents requis
  - Format: `X/Y` (soumis/requis)
  - Suivi de vos obligations documentaires

- **Visites**: Nombre de visites terminées
  - Affiche également le nombre de visites planifiées

#### 2. État de Conformité
Une carte affiche votre statut de conformité actuel:

- 🟢 **Conforme** (Vert): Tous les critères sont respectés
- 🟡 **En cours** (Jaune): Quelques actions restent à compléter
- 🔴 **Action requise** (Rouge): Des améliorations sont nécessaires

Une barre de progression montre visuellement votre avancement global.

#### 3. Graphiques de Performance

##### Évolution des Performances
- **Graphique en aires**: Montre l'évolution de votre score sur les 6 derniers mois
- Permet de visualiser les tendances et l'amélioration

##### Répartition des KPIs
- **Graphique circulaire**: Distribution de vos indicateurs
  - Conforme (vert)
  - En cours (orange)
  - À faire (rouge)

##### Vue d'Ensemble Multi-Critères
- **Graphique radar**: Performance sur 4 dimensions
  - KPIs
  - Documents
  - Conformité
  - Visites

#### 4. Activité Récente
Timeline chronologique affichant vos 10 dernières actions:
- Upload de documents
- Modifications de statut
- Messages envoyés/reçus
- Mises à jour de contrôles

Chaque activité indique:
- Date et heure
- Type d'action
- Utilisateur responsable

#### 5. Informations de l'Entreprise
Carte récapitulative avec:
- Secteur d'activité
- Région
- Nombre d'employés
- Statut actuel

---

## 📄 Gestion des Documents (`/enterprise/documents`)

### Accès
Menu principal → **"Documents"** ou `/enterprise/documents`

### Vue d'ensemble

#### Statistiques
4 cartes résumant vos documents:
- **Total Documents**: Nombre total de documents
- **Validés**: Documents approuvés
- **En Attente**: Documents en cours de validation
- **Action Requise**: Documents expirés ou nécessitant une mise à jour

### Fonctionnalités Principales

#### 1. Scanner un Document (OCR)

##### Étapes:
1. Cliquez sur **"Scanner Document (OCR)"** (bouton violet en haut)
2. Une fenêtre s'ouvre avec une zone de dépôt
3. **Glissez-déposez** votre document scanné ou **cliquez** pour sélectionner
   - Formats acceptés: PNG, JPG, JPEG, GIF, BMP, TIFF, PDF
   - Taille maximale: 10 MB
4. L'OCR extrait automatiquement le texte du document
5. Une fenêtre de validation s'affiche avec:
   - **Score de confiance**: Indique la qualité de l'extraction (%)
   - **Texte extrait**: Affiché dans une zone éditable
   - **Type de document**: Sélectionner le type approprié
6. **Éditez** le texte si nécessaire pour corriger les erreurs
7. **Sélectionnez** le type de document:
   - Business Plan
   - État Financier
   - Attestation Fiscale
   - Sécurité Sociale
   - Registre du Commerce
   - Autre document
8. Cliquez sur **"Valider et Enregistrer"**

##### Avantages de l'OCR:
- ✅ Numérisation rapide de documents papier
- ✅ Extraction automatique du contenu
- ✅ Validation avant enregistrement
- ✅ Recherche dans le texte extrait

#### 2. Importer un Document Standard

##### Étapes:
1. Cliquez sur **"Importer Document"** (bouton bleu)
2. Sélectionnez le **type de document**
3. Glissez-déposez ou sélectionnez votre fichier
4. Le document est immédiatement téléchargé

#### 3. Onglets de Navigation
Trois vues pour organiser vos documents:

- **Tous les Documents**: Vue complète
- **Documents Validés**: Uniquement les documents approuvés
- **En Attente de Validation**: Documents en cours de traitement

#### 4. Tableau des Documents
Pour chaque document:
- **Type**: Catégorie du document
- **Statut**: 
  - 🟢 Validé
  - 🔵 Reçu
  - 🟡 En attente
  - 🔴 Expiré
  - 🟠 Mise à jour requise
- **Date d'upload**: Date de téléchargement
- **Actions**:
  - 👁️ Voir
  - ⬇️ Télécharger
  - 🗑️ Supprimer

#### 5. Filtrage et Recherche
- Barre de recherche pour trouver rapidement un document
- Filtres par type et statut
- Tri par colonnes
- Pagination automatique

---

## 💬 Messages (`/enterprise/messages`)

### Accès
Menu principal → **"Messages"** ou `/enterprise/messages`

### Vue d'ensemble

#### Statistiques
4 cartes pour suivre vos communications:
- **Total Messages**: Nombre total de messages
- **Reçus**: Messages reçus des administrateurs
- **Non Lus**: Messages non encore consultés (badge rouge sur l'onglet)
- **Envoyés**: Messages que vous avez envoyés

### Fonctionnalités Principales

#### 1. Composer un Nouveau Message

##### Étapes:
1. Cliquez sur **"Nouveau Message"** (bouton bleu en haut)
2. Une fenêtre de composition s'ouvre
3. Remplissez le formulaire:
   - **Destinataire**: Sélectionnez un administrateur dans la liste déroulante
     - ⚠️ Vous ne pouvez envoyer de messages qu'aux administrateurs
     - Format: Nom Prénom - Email
   - **Priorité**: Choisissez le niveau
     - 🟢 Basse
     - 🟡 Moyenne
     - 🔴 Haute
   - **Sujet**: Titre du message (obligatoire)
   - **Message**: Contenu de votre message (obligatoire)
4. Cliquez sur **"Envoyer"**

#### 2. Boîte de Réception

##### Navigation:
L'onglet **"Boîte de réception"** affiche tous les messages reçus:
- Badge rouge indiquant le nombre de messages non lus
- Messages non lus avec fond grisé
- Cliquer sur un message le marque automatiquement comme lu

##### Affichage:
Pour chaque message:
- **Avatar** de l'expéditeur
- **Nom de l'expéditeur**
- **Date et heure** d'envoi
- **Sujet** en gras si non lu
- **Aperçu** du contenu (2 lignes)
- **Badges**:
  - Priorité (si définie)
  - "Non lu" (si applicable)

##### Actions:
- **Répondre** (↩️): Ouvre la fenêtre de composition avec:
  - Destinataire pré-rempli
  - Sujet avec "Re:"
  - Citation du message original
- **Supprimer** (🗑️): Supprime le message

#### 3. Messages Envoyés

L'onglet **"Messages envoyés"** montre tous vos messages sortants:
- Liste chronologique
- Indique le destinataire ("À: Nom Prénom")
- Même présentation que la boîte de réception
- Option de suppression

#### 4. Recherche
Barre de recherche pour trouver rapidement:
- Par nom d'expéditeur/destinataire
- Par sujet
- Par contenu du message

#### 5. Affichage Détaillé
Cliquer sur un message l'ouvre en vue détaillée en bas de la page:
- Expéditeur complet
- Sujet
- Date et heure complètes
- Contenu intégral du message
- Bouton "Répondre" (pour les messages reçus)
- Bouton "Fermer"

### Restrictions
⚠️ **Important**: Les entreprises ne peuvent envoyer des messages qu'aux utilisateurs de type **Admin**. Ceci garantit une communication structurée et traçable.

---

## 💡 Conseils d'Utilisation

### Vue d'Ensemble
- Consultez régulièrement votre tableau de bord pour suivre vos performances
- Les graphiques se mettent à jour automatiquement avec vos nouvelles données
- Utilisez la timeline d'activité pour vérifier vos dernières actions

### Documents
- **Utilisez l'OCR** pour numériser vos documents papier
- **Vérifiez toujours** le texte extrait par l'OCR avant de l'enregistrer
- **Organisez** vos documents avec les bons types pour faciliter la recherche
- **Vérifiez régulièrement** l'onglet "En Attente" pour voir les documents à valider

### Messages
- **Répondez rapidement** aux messages des administrateurs
- **Utilisez la priorité** pour les questions urgentes
- **Soyez précis** dans vos sujets pour faciliter le suivi
- **Vérifiez** régulièrement votre boîte de réception (badge de notification)

---

## 🔧 Dépannage

### Problèmes Courants

#### L'OCR ne fonctionne pas
- Vérifiez que votre fichier est bien une image ou un PDF
- Assurez-vous que le fichier ne dépasse pas 10 MB
- Essayez avec une image de meilleure qualité

#### Le texte extrait par OCR est incorrect
- Utilisez une image plus nette
- Ajustez manuellement le texte dans la fenêtre de validation
- Pour des documents complexes, préférez l'upload standard

#### Je ne peux pas envoyer de message
- Vérifiez que vous avez sélectionné un destinataire
- Le sujet et le contenu sont obligatoires
- Seuls les administrateurs peuvent recevoir vos messages

#### Les graphiques ne s'affichent pas
- Actualisez la page (bouton "Actualiser")
- Vérifiez votre connexion internet
- Contactez un administrateur si le problème persiste

---

## 📱 Responsive Design

Toutes les pages sont optimisées pour:
- 💻 **Desktop**: Affichage complet avec tous les graphiques
- 📱 **Tablette**: Layout adapté avec grille responsive
- 📱 **Mobile**: Vue simplifiée pour une navigation facile

---

## 🆘 Support

En cas de problème ou pour toute question:
1. Utilisez la fonction **Messages** pour contacter un administrateur
2. Décrivez précisément votre problème
3. Mentionnez les étapes que vous avez suivies
4. Indiquez les messages d'erreur éventuels

---

## ✨ Mises à Jour Récentes

### Nouvelles Fonctionnalités:
- ✅ Tableau de bord KPI enrichi avec métriques en temps réel
- ✅ Scanner OCR avec validation de texte
- ✅ Système de messagerie avec boîte de réception/envoi
- ✅ Timeline d'activité détaillée
- ✅ Graphiques de performance multi-critères
- ✅ Interface moderne et intuitive

---

**Version**: 1.0  
**Dernière mise à jour**: Octobre 2025

