# Guide des Services IA Simples

## 🚀 Vue d'ensemble

Ce guide présente les services IA simples et efficaces intégrés dans votre application :

1. **OCR Simple** - Extraction de texte des images avec Tesseract.js
2. **Questions/Réponses** - Système basé sur des règles pour répondre aux questions
3. **Requêtes Base de Données** - Interrogation en langage naturel de votre base de données

## 📋 Services disponibles

### **1. Service OCR (Extraction de texte)**

#### Fonctionnalités :
- Extraction de texte depuis des images (JPG, PNG, GIF, BMP, TIFF)
- Support français et anglais
- Analyse automatique du contenu selon le type de document
- Traitement par lot de plusieurs images

#### Utilisation :

```javascript
// Extraction simple
const formData = new FormData();
formData.append('image', imageFile);
formData.append('documentType', 'facture'); // ou 'kpi', 'rapport', 'general'

const response = await fetch('/api/simple-ai/ocr/extract', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.text); // Texte extrait
console.log(result.analysis); // Analyse du contenu
```

#### Types de documents supportés :
- **facture** : Détecte montants, dates, numéros de facture
- **kpi** : Identifie métriques, pourcentages, indicateurs
- **rapport** : Trouve mots-clés business, chiffres clés
- **general** : Extraction basique (emails, téléphones, dates)

### **2. Service Questions/Réponses**

#### Fonctionnalités :
- Réponses basées sur votre base de données
- Pas besoin de modèles complexes
- Réponses instantanées
- Support du contexte entreprise

#### Types de questions supportées :

```javascript
// Questions sur les entreprises
"Combien d'entreprises sont enregistrées ?"
"Liste des entreprises"
"Entreprises du secteur technologie"

// Questions sur les KPIs
"Quels sont les KPIs ?"
"Performance des KPIs"
"KPIs supérieur à 80"

// Questions sur les rapports
"Combien de rapports ?"
"Quel est le dernier rapport ?"

// Questions statistiques
"Statistiques générales"
"Moyennes"
```

#### Utilisation :

```javascript
const response = await fetch('/api/simple-ai/qa/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: "Combien d'entreprises sont dans le secteur technologie ?",
    enterpriseId: "optionnel" // Pour contexte spécifique
  })
});

const result = await response.json();
console.log(result.answer); // Réponse à la question
```

### **3. Service Requêtes Base de Données**

#### Fonctionnalités :
- Conversion de langage naturel en requêtes MongoDB
- Recherche intelligente dans vos données
- Suggestions de requêtes
- Filtres automatiques

#### Exemples de requêtes :

```javascript
// Recherche d'entreprises
"Entreprises du secteur technologie"
"Entreprises avec statut actif"
"Cherche entreprise Microsoft"

// Recherche de KPIs
"KPIs supérieur à 80"
"KPIs avec performance"
"Performance croissance"

// Recherche de rapports
"Rapports de janvier 2024"
"Rapports créés après 2024-01-01"
"Rapports contenant performance"

// Statistiques
"Statistiques entreprises"
"Combien de KPIs"
"Nombre de rapports"
```

#### Utilisation :

```javascript
const response = await fetch('/api/simple-ai/db/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "Entreprises du secteur technologie avec statut actif",
    enterpriseId: "optionnel"
  })
});

const result = await response.json();
console.log(result.results); // Résultats de la requête
console.log(result.count); // Nombre de résultats
```

## 🔧 Configuration et Installation

### **1. Dépendances déjà installées**
- `tesseract.js` - Pour l'OCR
- `multer` - Pour l'upload de fichiers
- `mongoose` - Pour les requêtes base de données

### **2. Ajout des routes dans server.js**

```javascript
// Dans server.js
const simpleAIRoutes = require('./routes/simpleAI');
app.use('/api/simple-ai', simpleAIRoutes);
```

### **3. Configuration des dossiers**

```bash
# Créer le dossier pour les uploads OCR
mkdir -p uploads/ocr
```

## 📊 Exemples d'intégration Frontend

### **1. Composant OCR**

```jsx
import React, { useState } from 'react';

const OCRComponent = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOCR = async () => {
    if (!file) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('documentType', 'facture');

    try {
      const response = await fetch('/api/simple-ai/ocr/extract', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Erreur OCR:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleOCR} disabled={!file || loading}>
        {loading ? 'Extraction...' : 'Extraire le texte'}
      </button>
      
      {result && (
        <div>
          <h3>Texte extrait :</h3>
          <p>{result.text}</p>
          <h3>Analyse :</h3>
          <pre>{JSON.stringify(result.analysis, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
```

### **2. Composant Questions/Réponses**

```jsx
import React, { useState } from 'react';

const QAComponent = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/simple-ai/qa/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      
      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error('Erreur Q&A:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Posez votre question..."
        onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
      />
      <button onClick={askQuestion} disabled={loading}>
        {loading ? 'Traitement...' : 'Poser la question'}
      </button>
      
      {answer && (
        <div>
          <h3>Réponse :</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};
```

### **3. Composant Requête Base de Données**

```jsx
import React, { useState, useEffect } from 'react';

const DatabaseQueryComponent = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Charger les suggestions
    fetch('/api/simple-ai/db/suggestions')
      .then(res => res.json())
      .then(data => setSuggestions(data.suggestions));
  }, []);

  const executeQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/simple-ai/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Erreur requête:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tapez votre requête..."
        onKeyPress={(e) => e.key === 'Enter' && executeQuery()}
      />
      <button onClick={executeQuery} disabled={loading}>
        {loading ? 'Recherche...' : 'Rechercher'}
      </button>
      
      <div>
        <h4>Suggestions :</h4>
        {suggestions.map((suggestion, index) => (
          <button 
            key={index}
            onClick={() => setQuery(suggestion)}
            style={{ margin: '2px', padding: '4px 8px' }}
          >
            {suggestion}
          </button>
        ))}
      </div>
      
      {results && (
        <div>
          <h3>Résultats ({results.count}) :</h3>
          <pre>{JSON.stringify(results.results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
```

## 🎯 Avantages des modèles simples

### **✅ Avantages :**
- **Rapide** : Réponses instantanées
- **Léger** : Pas de modèles lourds à charger
- **Fiable** : Basé sur vos vraies données
- **Économique** : Pas de coûts d'API externes
- **Personnalisable** : Facilement adaptable à vos besoins
- **Offline** : Fonctionne sans connexion internet

### **📈 Cas d'usage parfaits :**
- Extraction de données de documents scannés
- Support client automatisé basique
- Recherche intelligente dans vos données
- Analyse rapide de documents
- Statistiques et rapports automatiques

## 🚨 Limitations

- **OCR** : Qualité dépend de la qualité de l'image
- **Q&A** : Limité aux patterns prédéfinis
- **Requêtes** : Pas de compréhension contextuelle complexe

## 🔄 Extensions possibles

- Ajout de nouveaux patterns de questions
- Intégration avec des APIs externes légères
- Amélioration de l'analyse OCR
- Cache intelligent des réponses fréquentes

Ces services simples couvrent 80% des besoins IA typiques d'une application de gestion d'entreprises, sans la complexité des modèles avancés ! 🎉
