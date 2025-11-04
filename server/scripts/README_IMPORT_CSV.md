# Script d'import d'entreprises depuis CSV

Ce script permet d'importer automatiquement les entreprises depuis le fichier `donnees tests.csv` et de créer les utilisateurs associés.

## Utilisation

```bash
cd server
npm run import:csv
```

## Fonctionnement

Le script :

1. **Lit le fichier CSV** `donnees tests.csv` à la racine du projet
2. **Parse chaque ligne** et extrait les informations suivantes :
   - Raison sociale
   - Numéro de contribuable
   - Adresse
   - Contact (téléphone)
   - Nom du promoteur
   - Forme juridique
   - Lieu d'implantation
   - Description du projet
   - Montant d'investissement
   - Nombre d'emplois
   - Secteur d'activité
   - Capital social
   - Et bien d'autres...

3. **Crée un utilisateur** pour chaque entreprise avec :
   - Email généré automatiquement
   - Mot de passe par défaut : `Password123!`
   - Nom et prénom extraits du promoteur
   - Type de compte : `entreprise`

4. **Crée l'entreprise** avec toutes les informations mappées :
   - Identification (nom, raison sociale, région, ville, secteur, etc.)
   - Contact (email, téléphone, adresse)
   - Investissement et emploi (effectifs)
   - Performance économique (chiffre d'affaires si disponible)
   - Finances (budget annuel si disponible)
   - Notes (convention, date de signature, etc.)

## Mappings des colonnes CSV

| Colonne CSV | Champ Entreprise |
|------------|------------------|
| RAISON SOCIALE DE L'ENTREPRISE | `identification.nomEntreprise` et `identification.raisonSociale` |
| NUMERO DE CONTRIBUABLE | `identification.numeroContribuable` (nettoyé, sans tirets) |
| ADRESSE DE L'ENTREPRISE | `contact.adresse.rue` |
| CONTACT | `contact.telephone` |
| NOM DU PROMOTTEUR | Création de l'utilisateur (nom, prénom) |
| FORME JURIDIQUE | `identification.formeJuridique` |
| LIEU D'IMPLATATION DU PROJET | `identification.ville` |
| DESCRIPTION DU PROJET D'INVESTISSEMENT | `description` et `identification.filiereProduction` |
| MONTANT INITIAL D'INVESTISSEMENTS PROJETES | `performanceEconomique.chiffreAffaires.montant` |
| NOMBRE INITIAL D'EMPLOIS PROJETES | `investissementEmploi.effectifsEmployes` |
| SECTEUR D'ACTIVITE | `identification.secteurActivite` et `identification.sousSecteur` |
| CAPITAL SOCIAL | `finances.budgetAnnuel` |

## Gestion des erreurs

Le script :
- **Ignore** les entreprises avec un numéro de contribuable manquant
- **Ignore** les entreprises qui existent déjà (basé sur le numéro de contribuable)
- **Continue** en cas d'erreur sur une ligne et affiche un résumé à la fin
- **Nettoie** automatiquement les numéros de contribuable (supprime les tirets)

## Notes importantes

1. **Mot de passe par défaut** : Tous les utilisateurs créés ont le mot de passe `Password123!`. Ils devront le changer lors de leur première connexion.

2. **Emails générés** : Les emails sont générés automatiquement à partir du nom de l'entreprise. Format : `nomentreprise@example.com`

3. **Région automatique** : La région est déterminée automatiquement à partir de la ville (ex: Douala → Littoral, Yaoundé → Centre)

4. **Secteur d'activité** : Le secteur et sous-secteur sont déterminés automatiquement à partir de la description du projet

## Exemple de sortie

```
✅ Connecté à MongoDB
📖 Lecture du fichier CSV...
📊 10 entreprises trouvées dans le CSV
👤 Utilisateur créé: lasocietestridespharma@example.com
✅ 1/10 - Entreprise créée: LA SOCIETE STRIDES PHARMA CAMEROON S.A (M091200043106H)
...
📊 Résumé de l'import:
✅ Succès: 10
❌ Erreurs: 0
✅ Import terminé
```

