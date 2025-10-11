# 🚀 Guide de Démarrage Rapide - KPIs & Indicateurs

## ⚡ DÉMARRAGE EN 5 MINUTES

---

## 📋 PRÉREQUIS

### Redémarrer le Serveur
```bash
# Dans terminal
cd server
npm start
```

**Console devrait afficher** :
```
✅ Connecté à MongoDB Atlas
🚀 Serveur démarré sur le port 5000
```

---

## 🎯 ÉTAPE 1 : CRÉER UN KPI (2 min)

### Navigation
```
http://localhost:3000/admin/kpis
```

### Actions
1. Cliquer onglet **"Créer un KPI"**
2. Remplir :
   - **Nom** : "Chiffre d'Affaires"
   - **Code** : "KPI-CA-001"
   - **Description** : "CA annuel de l'entreprise"
   - **Type** : Monétaire
   - **Unité** : "FCFA"
   - **Valeur cible** : 50000000
   - **Fréquence** : Mensuelle
3. Cliquer **"Créer le KPI"**
4. ✅ KPI apparaît dans l'onglet "Liste des KPIs"

---

## 📊 ÉTAPE 2 : CRÉER UN CADRE DE RÉSULTATS (3 min)

### Navigation
```
http://localhost:3000/admin/results-framework
```

### Actions
1. Cliquer **"Nouveau Cadre"**

**Étape 1/4 - Informations** :
- Nom : "Projet Formation Digitale 2025"
- Type : Cadre Logique
- Entreprise : [Sélectionner une entreprise]
- Dates : 2025-01-01 → 2025-12-31
→ **Suivant**

**Étape 2/4 - Outcomes** :
- Taper : "80% des formés trouvent un emploi"
→ Cliquer **"Ajouter"**
- Taper : "Revenus augmentent de 30%"
→ Cliquer **"Ajouter"**
→ **Suivant**

**Étape 3/4 - Outputs** :
- Taper : "500 personnes formées"
→ **Ajouter**
- Taper : "100 certifications délivrées"
→ **Ajouter**
→ **Suivant**

**Étape 4/4 - Activités** :
- Taper : "Organiser 20 sessions de formation"
→ **Ajouter**
- Taper : "Développer contenu pédagogique"
→ **Ajouter**
→ Cliquer **"Créer le Cadre"**

2. ✅ Cadre créé et affiché

---

## 🔗 ÉTAPE 3 : CRÉER UN INDICATEUR LIÉ (2 min)

### Navigation
```
http://localhost:3000/admin/indicators
```

### Actions
1. Cliquer **"Nouvel Indicateur"**
2. Remplir :
   - **Nom** : "Nombre de personnes formées"
   - **Code** : "IND-FORM-001"
   - **Type** : OUTPUT
   - **Entreprise** : [Même que le cadre]
   - **Cadre de Résultats** : "Projet Formation Digitale 2025"
   - **Unité** : "personnes"
   - **Valeur de base** : 0
   - **Cible** : 500
   - **Fréquence** : Mensuelle
   - **Lier à des KPIs** : Sélectionner "KPI-CA-001"
3. Cliquer **"Créer"**
4. ✅ Indicateur créé
5. ✅ Badge "KPI: KPI-CA-001" affiché sur la carte

---

## 📈 ÉTAPE 4 : SUIVRE LA PROGRESSION (1 min)

### Ajouter une Valeur
```
/admin/indicators
```

1. Sur carte "Nombre de personnes formées"
2. Cliquer icône **"+"** (Ajouter valeur)
3. Entrer : **150**
4. Commentaire : "Fin Q1 2025"
5. ✅ Progression passe à 30%
6. ✅ Barre verte se remplit
7. ✅ Graphique créé

---

## 🔍 ÉTAPE 5 : VÉRIFIER LES CONNEXIONS (1 min)

### Voir depuis KPI
```
/admin/kpis
```

1. Sur carte "Chiffre d'Affaires"
2. Cliquer **"Voir Détails & Indicateurs"**
3. ✅ Section "Indicateurs Liés (1)"
4. ✅ Voir "IND-FORM-001"
5. ✅ Voir progression 30%
6. ✅ Connexion confirmée !

### Voir depuis Cadre
```
/admin/results-framework
```

1. Sur carte "Projet Formation Digitale 2025"
2. Cliquer **"Voir"**
3. ✅ Voir tous les outcomes
4. ✅ Voir tous les outputs
5. ✅ Voir toutes les activités

---

## ✅ VÉRIFICATION FINALE

### Checklist
- [ ] ✅ KPI créé et visible dans `/admin/kpis`
- [ ] ✅ Cadre créé et visible dans `/admin/results-framework`
- [ ] ✅ Indicateur créé et visible dans `/admin/indicators`
- [ ] ✅ Badge KPI affiché sur carte indicateur
- [ ] ✅ Indicateur affiché dans dialogue KPI
- [ ] ✅ Progression met à jour automatiquement
- [ ] ✅ Statistiques correctes sur chaque page

### Si tout est ✅
**Le système fonctionne parfaitement !** 🎉

---

## 🆘 DÉPANNAGE

### Erreur "Indicateurs ne se chargent pas"
```bash
# Vérifier que le serveur est redémarré
cd server
npm start
```

### Erreur "Entreprise non trouvée"
```bash
# Créer une entreprise d'abord
/admin/entreprises → Créer
```

### Liaison KPI ne fonctionne pas
```bash
# Vérifier que le KPI a un code
# Dans CreateKPIForm, le champ "Code" est requis
```

---

## 📚 PAGES PRINCIPALES

| Page | URL | Fonction |
|------|-----|----------|
| **KPIs** | `/admin/kpis` | Objectifs entreprise |
| **Indicateurs** | `/admin/indicators` | Métriques projets |
| **Cadres** | `/admin/results-framework` | Cadres logiques |

---

## 🎯 RÉSUMÉ EN 3 POINTS

1. **KPIs** = Objectifs business globaux de l'entreprise
2. **Cadres** = Structure logique des projets
3. **Indicateurs** = Métriques spécifiques liées aux KPIs

**Connexion** : Indicateur ↔ KPI = Vue consolidée !

---

**Temps total : ~9 minutes**  
**Résultat : Système de suivi complet !** 🚀

---

> 💡 **Suivez maintenant la performance de vos projets et objectifs en un seul endroit !**

