# 📘 Guide d'Utilisation - Module Entreprises

## 🎯 Vue d'Ensemble

Le module **Gestion des Entreprises** offre une interface complète pour gérer, analyser et visualiser les données des entreprises partenaires.

---

## 🚀 Accès au Module

### Navigation
1. **Connexion** en tant qu'administrateur
2. **Menu latéral** → "Entreprises" (badge avec nombre d'alertes)
3. **URL directe**: `/admin/entreprises`

---

## 📊 Fonctionnalités Principales

### 1. **Vue Liste** 
Affichage en grille des entreprises avec:
- 📇 **Cartes interactives** par entreprise
- 🏷️ **Badge de statut** coloré (Actif, En attente, Suspendu)
- 📍 **Localisation** (ville, région)
- 💼 **Informations clés**:
  - Secteur d'activité
  - Forme juridique
  - Nombre d'employés
  - État du profil (Complet/Incomplet)

### 2. **Vue Visualisations**
Analyses graphiques avancées:
- 🥧 **Répartition par Statut** (Pie Chart)
- 📊 **Top 5 Régions** (Bar Chart)
- 🏭 **Répartition par Secteur** (Bar Chart horizontal)
- 📈 **Évolution Temporelle** (Area Chart - 6 derniers mois)

---

## 🔍 Filtres et Recherche

### Barre de Recherche
- **Recherche textuelle** dans:
  - Nom d'entreprise
  - Email de contact
- Recherche en temps réel

### Filtres Avancés
1. **Par Statut**:
   - Tous
   - Actif
   - En attente
   - Suspendu
   - Inactif

2. **Par Région**:
   - Toutes les régions
   - Liste dynamique des régions disponibles

3. **Par Secteur**:
   - Tous les secteurs
   - Primaire
   - Secondaire
   - Tertiaire

### Combinaisons de Filtres
Les filtres sont **cumulatifs** - vous pouvez:
- Chercher "Entreprise A" + Statut "Actif" + Région "Centre"
- Résultats mis à jour instantanément

---

## 📈 Statistiques en Temps Réel

### Cartes Métriques (En-tête)

| Métrique | Description | Couleur |
|----------|-------------|---------|
| **Total** | Nombre total d'entreprises | Bleu (Primary) |
| **Actives** | Entreprises avec statut "Actif" | Vert (Success) |
| **En Attente** | Entreprises en attente de validation | Orange (Warning) |
| **Suspendues** | Entreprises suspendues | Rouge (Error) |
| **Complètes** | Profils entièrement remplis | Bleu clair (Info) |
| **Employés** | Total cumulé des employés | Violet (Secondary) |

---

## 🎨 Actions Disponibles

### Sur chaque Carte Entreprise

1. **👁️ Voir Détails**
   - Ouvre une boîte de dialogue
   - Affiche:
     - Informations générales (région, ville, secteur)
     - Performance & Emploi (effectifs, CA)
     - Contact (email, téléphone)

2. **✏️ Éditer**
   - Modifier les informations de l'entreprise
   - Mise à jour en temps réel

### Actions Globales (En-tête)

1. **🔄 Actualiser**
   - Recharge les données
   - Synchronise avec la base de données

2. **📥 Exporter**
   - Télécharger les données filtrées
   - Formats disponibles: Excel, PDF, CSV

3. **➕ Nouvelle Entreprise**
   - Formulaire de création
   - Validation des champs

---

## 📊 Détails des Visualisations

### 1. Répartition par Statut (Pie Chart)

**Objectif**: Visualiser la distribution des entreprises par statut

**Informations affichées**:
- Pourcentage pour chaque statut
- Nombre absolu
- Couleurs sémantiques:
  - 🟢 Actif (Vert)
  - 🟠 En attente (Orange)
  - 🔴 Suspendu (Rouge)
  - ⚪ Inactif (Gris)

**Interaction**:
- Survol pour voir détails
- Clic sur légende pour filtrer

### 2. Top 5 Régions (Bar Chart)

**Objectif**: Identifier les régions avec le plus d'entreprises

**Informations affichées**:
- 5 régions principales
- Nombre d'entreprises par région
- Tri décroissant

**Utilisation**:
- Planification de visites terrain
- Allocation de ressources

### 3. Répartition par Secteur (Bar Chart)

**Objectif**: Analyser la diversité sectorielle

**Informations affichées**:
- Tous les secteurs d'activité
- Nombre par secteur
- Format horizontal pour lisibilité

**Analyse**:
- Équilibre du portefeuille
- Secteurs sous-représentés

### 4. Évolution Temporelle (Area Chart)

**Objectif**: Suivre la croissance du portefeuille

**Informations affichées**:
- 6 derniers mois
- Nouvelles inscriptions par mois
- Tendance visuelle

**Interprétation**:
- Croissance stable
- Pics d'inscription
- Périodes creuses

---

## 🔐 Gestion des Statuts

### Workflow des Statuts

```
En attente → Actif → (Suspendu/Inactif)
    ↓
(Validation admin)
```

### Changement de Statut

**Accès**: Admin uniquement

**Procédure**:
1. Sélectionner entreprise
2. Bouton "Éditer"
3. Changer statut dans le formulaire
4. Enregistrer

**Audit**:
- ✅ Changement enregistré dans l'historique
- ✅ Notification automatique
- ✅ Horodatage précis

---

## 📱 Responsive Design

### Adaptations par Taille d'Écran

| Écran | Affichage |
|-------|-----------|
| **Mobile** (xs) | 1 carte par ligne, filtres empilés |
| **Tablette** (md) | 2 cartes par ligne |
| **Desktop** (lg+) | 3 cartes par ligne |

### Navigation Mobile
- Menu burger
- Filtres dans tiroir coulissant
- Graphiques adaptés

---

## ⚡ Performances

### Optimisations Mises en Place

1. **Chargement Initial**
   - Loader pendant requête
   - Gestion d'erreurs élégante

2. **Filtrage**
   - Traitement côté client (rapide)
   - Pas de requête serveur

3. **Visualisations**
   - Recharts optimisé
   - Responsive automatique

4. **Mise en Cache**
   - Service centralisé
   - Réduction requêtes API

---

## 🛠️ Configuration Avancée

### Variables d'Environnement

```bash
REACT_APP_API_URL=http://localhost:5000/api
```

### Personnalisation du Thème

Fichier: `frontend/src/theme/modernTheme.ts`

```typescript
// Modifier les couleurs
palette: {
  primary: { main: '#1976d2' },
  success: { main: '#2e7d32' },
  // ...
}
```

---

## 🔧 Dépannage

### Problèmes Courants

#### 1. **Entreprises ne se chargent pas**
- ✅ Vérifier connexion réseau
- ✅ Vérifier token d'authentification
- ✅ Consulter la console (F12)

#### 2. **Filtres ne fonctionnent pas**
- ✅ Actualiser la page
- ✅ Vider le cache navigateur

#### 3. **Graphiques ne s'affichent pas**
- ✅ Vérifier données (minimum 1 entreprise)
- ✅ Resize fenêtre (trigger re-render)

#### 4. **Erreur 403 (Non autorisé)**
- ✅ Vérifier rôle utilisateur (doit être admin)
- ✅ Re-connexion

---

## 📚 Données Affichées

### Champs Entreprise

**Identification**:
- Nom de l'entreprise
- Raison sociale
- Région
- Ville
- Secteur d'activité
- Sous-secteur
- Forme juridique
- Numéro contribuable

**Performance**:
- Chiffre d'affaires
- Coûts de production
- Situation de trésorerie

**Emploi**:
- Effectifs employés
- Nouveaux emplois créés
- Types d'investissements

**Contact**:
- Email
- Téléphone
- Site web
- Adresse complète

---

## 🎓 Bonnes Pratiques

### Utilisation Optimale

1. **Filtrage Progressif**
   - Commencer large (tous)
   - Affiner par statut
   - Puis région/secteur

2. **Analyse Visuelle**
   - Utiliser vue Visualisations
   - Identifier tendances
   - Export pour rapports

3. **Mise à Jour Régulière**
   - Vérifier profils incomplets
   - Relancer entreprises en attente
   - Valider données

4. **Exports Planifiés**
   - Rapport mensuel par région
   - Analyse sectorielle trimestrielle
   - Dashboard exécutif hebdomadaire

---

## 🚦 Indicateurs de Qualité

### KPIs à Surveiller

| KPI | Cible | Action si hors cible |
|-----|-------|---------------------|
| **Profils Complets** | > 80% | Relancer entreprises |
| **Entreprises Actives** | > 70% | Campagne réactivation |
| **Réponse Contact** | < 48h | Améliorer support |
| **Équilibre Régional** | ±10% | Prospection ciblée |

---

## 📞 Support et Assistance

### En cas de Problème

1. **Documentation**
   - Consulter ce guide
   - Lire AMELIORATIONS_ENTREPRISES.md

2. **Logs**
   - Console navigateur (F12)
   - Réseau (onglet Network)

3. **Contact Support**
   - Email: support@trackimpact.cm
   - Téléphone: +237 XXX XXX XXX

---

## 🎉 Résumé des Avantages

✅ **Interface Intuitive**
- Design moderne Material-UI
- Navigation fluide

✅ **Visualisations Riches**
- 4 types de graphiques
- Analyses en temps réel

✅ **Filtrage Puissant**
- Multi-critères
- Recherche textuelle

✅ **Performance Optimisée**
- Chargement rapide
- Responsive design

✅ **Sécurité Renforcée**
- Authentification
- Audit trail

---

**Version**: 1.0.0  
**Dernière mise à jour**: 2025-10-08  
**Auteur**: AI Assistant

---

> 💡 **Astuce**: Utilisez les raccourcis clavier Ctrl+F pour rechercher rapidement dans ce guide !

