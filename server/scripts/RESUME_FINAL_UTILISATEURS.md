# 📋 RÉSUMÉ FINAL - UTILISATEURS ENTREPRISE

## Informations générales

- **Type de compte** : `entreprise`
- **Mot de passe commun pour tous les utilisateurs** : `Aa123456`
- **Format des emails** : `ent111@gmail.com`, `ent112@gmail.com`, etc. (incrémentation automatique)
- **Source des données** : `donnees tests.csv`

---

## Liste complète des identifiants

| # | Nom de l'Entreprise | Email | Mot de passe | Nom complet | Téléphone |
|---|---------------------|-------|--------------|-------------|-----------|
| 1 | LA SOCIETE STRIDES PHARMA CAMEROON S.A | **ent111@gmail.com** | Aa123456 | VIPIN VIKRAMAN PILLAI | +237 696193119 |
| 2 | LA SOCIETE ROUTD'AF SA | **ent112@gmail.com** | Aa123456 | SIAKA ANDRE | +237 679744607 |
| 3 | LA SOCIETE AGROALIMENTAIRE EQUATORIALE S.A | **ent113@gmail.com** | Aa123456 | KAMAYOU TAWAMBA Pascal | - |
| 4 | LA SOCIETE VINA INDUSTRY CORPORATION SARL | **ent114@gmail.com** | Aa123456 | KAMMENI Emmanuel | - |
| 5 | LA SOCIETE LAMINAGE ET PROFILAGE INDUSTRIE S.A | **ent115@gmail.com** | Aa123456 | DJIMO Samuel | +237 694199246 |
| 6 | LA SOCIETE AFRICA FOOD MANUFACTURE DIVISION SEMOULERIE | **ent116@gmail.com** | Aa123456 | EVARISTE HELLE | +237 694189113 |
| 7 | LA SOCIETE CIVILE IMMOBILIERE GNF | **ent117@gmail.com** | Aa123456 | NJITAP FOTSO Gérémie Sorelle | - |
| 8 | LA SOCIETE AFRICAN CHEMICAL INDUSTRY (ACI SA) | **ent118@gmail.com** | Aa123456 | KAMDEM Dieudonné | +237 695755285 |
| 9 | LA SOCIETE CIVILE IMMOBILIERE MBOMGNIN | **ent119@gmail.com** | Aa123456 | Contact | - |
| 10 | LA SOCIETE CORE MANUFACTURING GROUP S.A | **ent120@gmail.com** | Aa123456 | SONIA LAURE MINGO FANKEM | +237 694194524 |

---

## Détails par utilisateur

### 1. VIPIN VIKRAMAN PILLAI
- **Email** : ent111@gmail.com
- **Mot de passe** : Aa123456
- **Entreprise** : LA SOCIETE STRIDES PHARMA CAMEROON S.A
- **Numéro Contribuable** : M091200043106H
- **Téléphone** : +237 696193119
- **Adresse** : BP 2353 Douala

### 2. SIAKA ANDRE
- **Email** : ent112@gmail.com
- **Mot de passe** : Aa123456
- **Entreprise** : LA SOCIETE ROUTD'AF SA
- **Numéro Contribuable** : M041300045685N
- **Téléphone** : +237 679744607
- **Adresse** : BP 12117 Douala

### 3. KAMAYOU TAWAMBA Pascal
- **Email** : ent113@gmail.com
- **Mot de passe** : Aa123456
- **Entreprise** : LA SOCIETE AGROALIMENTAIRE EQUATORIALE S.A
- **Numéro Contribuable** : M011300048267W
- **Téléphone** : Non renseigné
- **Adresse** : BP 1781 DOUALA

### 4. KAMMENI Emmanuel
- **Email** : ent114@gmail.com
- **Mot de passe** : Aa123456
- **Entreprise** : LA SOCIETE VINA INDUSTRY CORPORATION SARL
- **Numéro Contribuable** : M059600000952K
- **Téléphone** : Non renseigné
- **Adresse** : BP 610 NGaoundéré

### 5. DJIMO Samuel
- **Email** : ent115@gmail.com
- **Mot de passe** : Aa123456
- **Entreprise** : LA SOCIETE LAMINAGE ET PROFILAGE INDUSTRIE S.A
- **Numéro Contribuable** : M077500000210R
- **Téléphone** : +237 694199246
- **Adresse** : BP 6787 Douala

### 6. EVARISTE HELLE
- **Email** : ent116@gmail.com
- **Mot de passe** : Aa123456
- **Entreprise** : LA SOCIETE AFRICA FOOD MANUFACTURE DIVISION SEMOULERIE
- **Numéro Contribuable** : M111712694172K
- **Téléphone** : +237 694189113
- **Adresse** : BP 4 157 Douala

### 7. NJITAP FOTSO Gérémie Sorelle
- **Email** : ent117@gmail.com
- **Mot de passe** : Aa123456
- **Entreprise** : LA SOCIETE CIVILE IMMOBILIERE GNF
- **Numéro Contribuable** : M061314954594K
- **Téléphone** : Non renseigné
- **Adresse** : BP 3 423 Yaoundé

### 8. KAMDEM Dieudonné
- **Email** : ent118@gmail.com
- **Mot de passe** : Aa123456
- **Entreprise** : LA SOCIETE AFRICAN CHEMICAL INDUSTRY (ACI SA)
- **Numéro Contribuable** : M061000035469Q
- **Téléphone** : +237 695755285
- **Adresse** : BP 4 086 Douala

### 9. Contact (MBOMGNIN)
- **Email** : ent119@gmail.com
- **Mot de passe** : Aa123456
- **Entreprise** : LA SOCIETE CIVILE IMMOBILIERE MBOMGNIN
- **Numéro Contribuable** : M061314954594K
- **Téléphone** : Non renseigné
- **Adresse** : BP 12 449 Douala

### 10. SONIA LAURE MINGO FANKEM
- **Email** : ent120@gmail.com
- **Mot de passe** : Aa123456
- **Entreprise** : LA SOCIETE CORE MANUFACTURING GROUP S.A
- **Numéro Contribuable** : M121300048981G
- **Téléphone** : +237 694194524
- **Adresse** : BP 3299 Douala

---

## Données incluses dans la description

Chaque utilisateur aura dans son champ `description` toutes les informations de l'entreprise depuis le CSV :
- Raison sociale
- Numéro de contribuable
- Adresse
- Forme juridique
- Lieu d'implantation
- Numéro de convention
- Description du projet
- Type d'entreprise
- Date de signature
- Montant investissement
- Nombre d'emplois projetés
- Effectif total
- Secteur d'activité
- Lieu siège
- Capital social
- Chiffre d'affaires (années 1-5)
- Valeur ajoutée (années 1-5)
- Statut questionnaire 2024

---

## Commandes d'exécution

### 1. Supprimer les utilisateurs de test existants (optionnel)
```bash
cd server
node scripts/delete-test-users.js
```

### 2. Créer les utilisateurs entreprise depuis le CSV
```bash
cd server
node scripts/insert-users-entreprise-from-csv.js
```

---

## Fichiers générés

Après l'exécution du script, les fichiers suivants seront créés :

1. **server/scripts/users-entreprise-credentials.txt** - Format texte lisible
2. **server/scripts/users-entreprise-credentials.json** - Format JSON pour traitement automatique
3. **server/scripts/RESUME_FINAL_UTILISATEURS.md** - Ce document

---

## Résumé statistique

- **Total d'utilisateurs** : 10
- **Type de compte** : entreprise
- **Mot de passe commun** : Aa123456
- **Emails** : ent111@gmail.com à ent120@gmail.com

---

**Date de génération** : Généré automatiquement par le script d'insertion

