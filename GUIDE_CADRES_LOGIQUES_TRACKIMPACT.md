# 📊 Guide des Cadres Logiques - TrackImpact

## 🎯 **À QUOI SERVENT LES CADRES LOGIQUES ?**

Les cadres logiques sont des **outils de planification et de suivi de performance** pour structurer vos projets et programmes selon une méthodologie reconnue internationalement.

---

## 💡 **DANS VOTRE APPLICATION TRACKIMPACT**

### Utilité Concrète

**TrackImpact** suit les entreprises et leurs projets. Les cadres logiques vous permettent de :

1. **Structurer les projets** des entreprises de manière professionnelle
2. **Mesurer l'impact** réel des activités
3. **Suivre la performance** avec des métriques claires
4. **Répondre aux exigences des bailleurs** (si applicable)
5. **Démontrer les résultats** aux parties prenantes

---

## 📋 **LES 4 NIVEAUX D'UN CADRE LOGIQUE**

### Hiérarchie (du haut vers le bas)

```
1. IMPACT (But ultime)
   "Que voulons-nous changer dans le monde ?"
   ↓
2. OUTCOMES (Résultats)
   "Quels changements souhaitons-nous chez les bénéficiaires ?"
   ↓
3. OUTPUTS (Produits/Livrables)
   "Que produisons-nous concrètement ?"
   ↓
4. ACTIVITIES (Activités)
   "Que faisons-nous au quotidien ?"
```

---

## 🏢 **EXEMPLES CONCRETS POUR TRACKIMPACT**

### Exemple 1 : Programme de Formation d'une Entreprise

**ENTREPRISE** : TechCorp Formation  
**PROJET** : "Formation Digitale 2025"

#### **IMPACT** 🎯
> Contribution au développement économique du pays par la formation

#### **OUTCOMES** (Résultats attendus)
1. **80% des personnes formées trouvent un emploi dans les 6 mois**
   - Indicateur : IND-EMPLOI-001 "Taux d'insertion professionnelle"
   - Cible : 80%
   - Lié au KPI entreprise : KPI-IMPACT-001 "Emplois créés"

2. **Les revenus des bénéficiaires augmentent de 30%**
   - Indicateur : IND-REVENUS-001 "Augmentation moyenne des revenus"
   - Cible : +30%

#### **OUTPUTS** (Produits/Livrables)
1. **500 personnes formées en développement web**
   - Indicateur : IND-FORM-001 "Nombre de personnes formées"
   - Cible : 500 personnes
   - Lié au KPI : KPI-CA-001 "Chiffre d'affaires"

2. **100 certifications professionnelles délivrées**
   - Indicateur : IND-CERT-001 "Certifications délivrées"
   - Cible : 100

3. **20 entreprises partenaires recrutent nos diplômés**
   - Indicateur : IND-PART-001 "Partenaires actifs"
   - Cible : 20

#### **ACTIVITIES** (Activités)
1. **Organiser 20 sessions de formation de 25 personnes**
   - Progression : 0% → 100%
   - Statut : EN_COURS

2. **Développer 10 modules de cours**
   - Progression : 60%
   - Statut : EN_COURS

3. **Recruter et former 5 formateurs**
   - Progression : 100%
   - Statut : TERMINÉ

---

### Exemple 2 : Projet Agricole

**ENTREPRISE** : AgroSuccess  
**PROJET** : "Amélioration Productivité Agricole 2025"

#### **IMPACT**
> Sécurité alimentaire améliorée dans la région

#### **OUTCOMES**
1. **Rendement agricole augmente de 40%**
   - Indicateur : IND-REND-001 "Rendement moyen par hectare"
   - Lié au KPI : KPI-PROD-001 "Production totale"

2. **100 agriculteurs adoptent nouvelles techniques**
   - Indicateur : IND-ADOPT-001 "Taux d'adoption"

#### **OUTPUTS**
1. **300 agriculteurs formés**
   - Indicateur : IND-AGRI-FORM-001
   
2. **50 tonnes de semences distribuées**
   - Indicateur : IND-SEM-001

#### **ACTIVITIES**
1. Organiser ateliers de formation
2. Distribuer semences améliorées
3. Installer systèmes d'irrigation

---

## 🔄 **WORKFLOW DANS TRACKIMPACT**

### Scénario Complet : Suivi d'un Projet

#### PHASE 1 : PLANIFICATION

**Étape 1 : Définir les KPIs de l'Entreprise**
```
/admin/kpis
→ Créer KPI "Chiffre d'Affaires 2025"
→ Code : KPI-CA-2025
→ Cible : 50M FCFA
→ ✅ KPI créé
```

**Étape 2 : Créer le Cadre Logique du Projet**
```
/admin/results-framework
→ "Nouveau Cadre"

Étape 1 : Info
→ Nom : "Formation Professionnelle 2025"
→ Type : Cadre Logique
→ Entreprise : TechCorp Formation
→ Dates : 01/2025 - 12/2025

Étape 2 : Outcomes
→ "80% trouvent emploi"
→ "Revenus +30%"

Étape 3 : Outputs
→ "500 formés"
→ "100 certifiés"

Étape 4 : Activités
→ "20 sessions formation"
→ "Développer modules"

→ Créer ✅
```

**Étape 3 : Créer les Indicateurs**
```
/admin/indicators
→ "Nouvel Indicateur"

Indicateur 1 :
→ Nom : "Personnes formées"
→ Code : IND-FORM-001
→ Type : OUTPUT
→ Entreprise : TechCorp Formation
→ Cadre : "Formation Professionnelle 2025"
→ Unité : personnes
→ Cible : 500
→ Lier KPI : KPI-CA-2025 ✅

Indicateur 2 :
→ Nom : "Taux d'insertion emploi"
→ Code : IND-EMPLOI-001
→ Type : OUTCOME
→ Cible : 80%
→ Lier KPI : KPI-CA-2025 ✅
```

#### PHASE 2 : EXÉCUTION & SUIVI

**Mois 1 - Janvier 2025**
```
/admin/indicators
→ Carte "Personnes formées"
→ Cliquer "+" (Ajouter valeur)
→ Valeur : 50
→ Commentaire : "Janvier - 2 sessions"
→ ✅ Progression : 10%
```

**Mois 2 - Février 2025**
```
→ Ajouter valeur : 100 (total cumulé)
→ ✅ Progression : 20%
```

**Fin Trimestre 1**
```
→ Ajouter valeur : 150
→ ✅ Progression : 30%
→ Graphique d'évolution créé automatiquement
```

#### PHASE 3 : VISUALISATION & REPORTING

**Dashboard Entreprise**
```
/admin/kpis
→ Carte "Chiffre d'Affaires 2025"
→ "Voir Détails & Indicateurs"
→ ✅ Voir "IND-FORM-001" : 30%
→ ✅ Voir "IND-EMPLOI-001" : 15%
→ Vue consolidée de tous les indicateurs
```

**Dashboard Cadre Logique**
```
/admin/results-framework
→ Carte "Formation Professionnelle 2025"
→ "Voir"
→ ✅ Outcomes : Liste complète
→ ✅ Outputs : Liste complète
→ ✅ Activités : Progression de chacune
→ ✅ Progression globale : 25%
```

**Dashboard Indicateurs**
```
/admin/indicators
→ Voir tous les indicateurs
→ Filtrer par type (Outcomes/Outputs)
→ ✅ Graphiques d'évolution
→ ✅ KPIs liés affichés
```

---

## 🎯 **CAS D'USAGE RÉELS DANS TRACKIMPACT**

### Cas 1 : Entreprise avec Multiples Projets

**ENTREPRISE** : MultiServices Inc.

**KPIs Entreprise** (Objectifs globaux) :
- KPI-CA : Chiffre d'affaires annuel : 100M
- KPI-EMP : Emplois créés : 200
- KPI-CLIENT : Clients satisfaits : 95%

**PROJET 1** : Formation IT
- Cadre : "Formation Dev 2025"
- Indicateurs :
  - IND-DEV-001 : Développeurs formés → Lié à KPI-EMP
  - IND-CERT-001 : Certifications → Lié à KPI-CA

**PROJET 2** : Consulting Business
- Cadre : "Consulting PME 2025"
- Indicateurs :
  - IND-PME-001 : PMEs accompagnées → Lié à KPI-CLIENT
  - IND-REV-001 : Revenus consulting → Lié à KPI-CA

**Avantage** :
- Vue entreprise : KPI global consolidé
- Vue projet : Indicateurs détaillés
- **Connexion** : KPI agrège plusieurs indicateurs de différents projets

---

### Cas 2 : Suivi de Conformité et Impact

**ENTREPRISE** : GreenEnergy

**KPIs** :
- KPI-ENV-001 : Émissions CO2 réduites : -50%
- KPI-PROD-001 : MWh produits : 1000

**CADRE LOGIQUE** : "Projet Solaire Village X"

**Outcomes** :
- 500 foyers accèdent à l'électricité
  - **Indicateur** : IND-FOYER-001 → Lié à KPI-ENV-001

**Outputs** :
- 100 panneaux solaires installés
  - **Indicateur** : IND-PAN-001 → Lié à KPI-PROD-001

**Suivi mensuel** :
- Janvier : 10 panneaux → 10%
- Février : 25 panneaux → 25%
- Mars : 40 panneaux → 40%
→ Graphique montre progression
→ KPI "MWh produits" suit automatiquement

---

## 📊 **DIFFÉRENCE KPI vs INDICATEUR**

### Dans TrackImpact

| Aspect | KPI | Indicateur |
|--------|-----|------------|
| **Niveau** | Entreprise globale | Projet spécifique |
| **Objectif** | Objectif business | Métrique projet |
| **Exemple** | "CA 2025 : 100M" | "Formations vendues : 500" |
| **Fréquence** | Annuel/Trimestriel | Mensuel/Hebdo |
| **Agrégation** | Agrège plusieurs projets | Contribue au KPI |
| **Page** | `/admin/kpis` | `/admin/indicators` |

### Connexion

**Indicateur alimente le KPI** :

```
KPI "Chiffre d'Affaires" : 100M
  ├─ Projet Formation : 40M (Indicateur IND-FORM-REV)
  ├─ Projet Consulting : 35M (Indicateur IND-CONS-REV)
  └─ Projet Audit : 25M (Indicateur IND-AUD-REV)
  
Total KPI = Somme des indicateurs = 100M ✅
```

---

## 🎨 **TYPES DE CADRES DISPONIBLES**

### 1. **Cadre Logique (LOGFRAME)** - Le Plus Commun

**Quand l'utiliser ?**
- Projets avec objectifs clairs et mesurables
- Exigé par bailleurs (Banque Mondiale, UE, etc.)
- Projets de développement classiques

**Structure** :
```
Impact → Outcomes → Outputs → Activities
```

**Exemple** : Projet de formation, construction infrastructure, programme santé

---

### 2. **Théorie du Changement (THEORY OF CHANGE)**

**Quand l'utiliser ?**
- Projets complexes avec multiples acteurs
- Changement social/comportemental
- Besoin de montrer liens de causalité

**Structure** :
```
But ultime → Résultats long terme → Résultats moyen terme → 
Résultats court terme → Activités
```

**Exemple** : Programme de lutte contre pauvreté, changement climatique

---

### 3. **Chaîne de Résultats (RESULTS CHAIN)**

**Quand l'utiliser ?**
- Projets simples et directs
- Séquence linéaire d'effets
- Projets pilotes

**Structure** :
```
Inputs → Activities → Outputs → Outcomes → Impact
```

**Exemple** : Distribution de matériel, campagne de sensibilisation

---

### 4. **Cartographie des Résultats (OUTCOME MAPPING)**

**Quand l'utiliser ?**
- Focus sur changements comportementaux
- Projets de renforcement de capacités
- Changement organisationnel

**Structure** :
```
Partenaires frontière → Changements comportementaux → 
Stratégies → Signaux de progrès
```

**Exemple** : Renforcement capacités ONG, formation leadership

---

## 🚀 **COMMENT UTILISER DANS TRACKIMPACT**

### Scénario Réel : Entreprise de Formation

#### **CONTEXTE**
Vous suivez **TechCorp Formation**, une entreprise qui forme des jeunes au numérique.

#### **OBJECTIF**
Structurer et suivre leur projet "Formation Dev 2025".

---

### **ÉTAPE PAR ÉTAPE**

#### **1. Créer les KPIs de l'Entreprise** (Objectifs Business)

```
/admin/kpis → Créer un KPI

KPI 1 : Chiffre d'Affaires
- Code : KPI-CA-2025
- Cible : 50,000,000 FCFA
- Fréquence : Mensuelle

KPI 2 : Emplois Créés (Impact Social)
- Code : KPI-EMP-2025
- Cible : 100 emplois
- Fréquence : Trimestrielle

KPI 3 : Satisfaction Client
- Code : KPI-SAT-2025
- Cible : 90%
- Fréquence : Mensuelle
```

---

#### **2. Créer le Cadre Logique du Projet**

```
/admin/results-framework → Nouveau Cadre

ÉTAPE 1 : INFORMATIONS
- Nom : "Formation Dev 2025"
- Type : Cadre Logique
- Entreprise : TechCorp Formation
- Dates : 01/01/2025 - 31/12/2025
→ Suivant

ÉTAPE 2 : OUTCOMES (Résultats)
→ "80% des formés trouvent emploi dans 6 mois"
→ "Revenus bénéficiaires augmentent de 30%"
→ "20 entreprises recrutent nos diplômés"
→ Suivant

ÉTAPE 3 : OUTPUTS (Livrables)
→ "500 personnes formées en dev web"
→ "400 personnes formées en design"
→ "100 certifications délivrées"
→ "15 entreprises partenaires signées"
→ Suivant

ÉTAPE 4 : ACTIVITÉS
→ "Organiser 20 sessions formation frontend"
→ "Organiser 15 sessions formation backend"
→ "Développer 10 modules de cours"
→ "Recruter 5 formateurs experts"
→ "Équiper 3 salles de formation"
→ Créer le Cadre ✅
```

---

#### **3. Créer les Indicateurs et les Lier aux KPIs**

```
/admin/indicators → Nouvel Indicateur

INDICATEUR 1 : Personnes Formées
- Nom : "Nombre de personnes formées dev web"
- Code : IND-FORM-WEB-001
- Type : OUTPUT
- Entreprise : TechCorp Formation
- Cadre : "Formation Dev 2025"
- Unité : personnes
- Baseline : 0
- Cible : 500
- Fréquence : Mensuelle
- **Lier à KPI** : KPI-CA-2025, KPI-EMP-2025
→ Créer ✅

INDICATEUR 2 : Taux Insertion
- Nom : "Taux d'insertion professionnelle"
- Code : IND-INSERT-001
- Type : OUTCOME
- Cible : 80%
- **Lier à KPI** : KPI-EMP-2025
→ Créer ✅

INDICATEUR 3 : Revenus Générés
- Nom : "Revenus formations"
- Code : IND-REV-001
- Type : OUTPUT
- Cible : 40,000,000 FCFA
- **Lier à KPI** : KPI-CA-2025
→ Créer ✅
```

---

#### **4. Suivre la Progression (Chaque Mois)**

**JANVIER 2025**
```
/admin/indicators

IND-FORM-WEB-001 :
→ Ajouter valeur : 50
→ Commentaire : "Janvier - 2 sessions terminées"
→ ✅ 10% de progression

IND-REV-001 :
→ Ajouter valeur : 3,500,000
→ ✅ 8.75% de progression
```

**FÉVRIER 2025**
```
IND-FORM-WEB-001 :
→ Ajouter valeur : 100 (cumulé)
→ ✅ 20% de progression
→ ✅ Graphique montre courbe ascendante

IND-REV-001 :
→ Ajouter valeur : 7,200,000 (cumulé)
→ ✅ 18% de progression
```

**MARS 2025**
```
IND-FORM-WEB-001 :
→ Ajouter valeur : 150
→ ✅ 30% de progression

→ Badge passe au ORANGE (AT_RISK si < 50%)
```

---

#### **5. Analyser les Résultats**

**Vue KPI Global**
```
/admin/kpis → "KPI-CA-2025"

Indicateurs liés :
- IND-REV-001 : 18% (7.2M / 40M)
- Autres projets...

Consolidation automatique !
```

**Vue Cadre Logique**
```
/admin/results-framework → "Formation Dev 2025"

Progression globale : 20%
- Outcomes : 3 définis
- Outputs : 4 définis
- Activités : 5 en cours (2 terminées, 3 en cours)

Vue d'ensemble du projet !
```

**Vue Indicateurs**
```
/admin/indicators

Filtrer par entreprise : TechCorp
→ ✅ Voir tous les indicateurs
→ ✅ Graphiques d'évolution
→ ✅ KPIs liés affichés
```

---

## 📈 **RAPPORTS ET ANALYSES**

### Rapports Disponibles

**1. Rapport de Performance Entreprise**
- KPIs globaux
- Tous indicateurs liés
- Progression par projet

**2. Rapport de Cadre Logique**
- Impact visé
- Outcomes atteints
- Outputs produits
- Activités réalisées

**3. Rapport d'Indicateur**
- Évolution temporelle
- Graphiques de tendance
- Historique complet

---

## 💼 **AVANTAGES POUR TRACKIMPACT**

### 1. **Professionnalisme**
- Méthodologie reconnue internationalement
- Conforme aux standards bailleurs
- Crédibilité accrue

### 2. **Clarté**
- Objectifs bien définis
- Liens de causalité explicites
- Responsabilités claires

### 3. **Mesurabilité**
- Indicateurs quantifiables
- Suivi objectif
- Preuves tangibles

### 4. **Pilotage**
- Détection précoce des problèmes
- Ajustement en cours de route
- Décisions basées sur données

### 5. **Communication**
- Reporting simplifié
- Démonstration d'impact
- Transparence envers parties prenantes

---

## 🔑 **POINTS CLÉS**

### À Retenir

1. **Un Cadre = Un Projet**
   - Chaque projet d'entreprise a son cadre
   
2. **Des Indicateurs = Mesures du Projet**
   - Chaque output/outcome a des indicateurs
   
3. **Des KPIs = Objectifs Entreprise**
   - Un KPI peut agréger plusieurs indicateurs
   
4. **Connexion Indicateur ↔ KPI**
   - L'indicateur contribue au KPI
   - Vue projet ET vue entreprise

---

## 📚 **MÉTHODOLOGIE**

### Approche SMART pour les Indicateurs

**S**pécifique : "500 personnes formées" (pas "beaucoup de gens")  
**M**esurable : Unité claire (personnes, %, FCFA)  
**A**tteignable : Cible réaliste  
**R**elevant : Lié aux outcomes  
**T**emporel : Date cible définie

### Questions Clés

**Pour chaque niveau** :

**IMPACT** : Quel changement dans le monde ?  
**OUTCOME** : Quel changement chez les bénéficiaires ?  
**OUTPUT** : Que produisons-nous ?  
**ACTIVITY** : Que faisons-nous ?

---

## 🎉 **EN RÉSUMÉ**

### Les Cadres Logiques dans TrackImpact servent à :

1. ✅ **Structurer** les projets des entreprises
2. ✅ **Planifier** avec méthodologie professionnelle
3. ✅ **Mesurer** l'impact réel
4. ✅ **Suivre** la progression
5. ✅ **Connecter** objectifs entreprise (KPIs) et réalisations projet (Indicateurs)
6. ✅ **Rapporter** aux parties prenantes
7. ✅ **Piloter** avec des données

---

## 🚀 **COMMENCEZ MAINTENANT**

```bash
1. Redémarrez le serveur
   cd server && npm start

2. Créez un KPI d'entreprise
   /admin/kpis

3. Créez un Cadre Logique
   /admin/results-framework

4. Créez des Indicateurs liés
   /admin/indicators

5. Suivez la progression !
   ✅ Ajouter valeurs mensuelles
   ✅ Voir graphiques
   ✅ Analyser performance
```

---

**C'est un système professionnel de gestion de performance orientée résultats !** 🎯

---

> 💡 **Transformez vos projets en résultats mesurables et prouvez votre impact !**

