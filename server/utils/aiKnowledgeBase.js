const fs = require('fs').promises;
const path = require('path');

class AIKnowledgeBase {
  constructor() {
    this.knowledgeBase = new Map();
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 heures
    this.initializeKnowledgeBase();
  }

  async initializeKnowledgeBase() {
    try {
      // Charger les connaissances depuis les fichiers de documentation
      await this.loadDocumentation();
      await this.loadFAQ();
      await this.loadUserGuides();
      
      console.log('✅ Base de connaissances IA initialisée');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la base de connaissances:', error);
    }
  }

  async loadDocumentation() {
    const docsPath = path.join(__dirname, '../../docs');
    
    try {
      const files = await fs.readdir(docsPath);
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = await fs.readFile(path.join(docsPath, file), 'utf8');
          const processedContent = this.processMarkdown(content);
          
          this.knowledgeBase.set(`doc_${file}`, {
            type: 'documentation',
            title: this.extractTitle(file),
            content: processedContent,
            keywords: this.extractKeywords(processedContent),
            lastUpdated: new Date()
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ Impossible de charger la documentation:', error.message);
    }
  }

  async loadFAQ() {
    // FAQ statique pour les questions courantes
    const faqData = [
      {
        question: "Comment créer un nouveau KPI ?",
        answer: "Pour créer un nouveau KPI, allez dans la section 'Gestion des KPI' du tableau de bord admin, cliquez sur 'Nouveau KPI' et remplissez le formulaire avec les informations requises.",
        category: "kpi",
        keywords: ["kpi", "créer", "nouveau", "indicateur"]
      },
      {
        question: "Comment soumettre un rapport ?",
        answer: "Les rapports peuvent être soumis via la section 'Rapports' de votre tableau de bord entreprise. Utilisez le formulaire de soumission et joignez les documents nécessaires.",
        category: "rapport",
        keywords: ["rapport", "soumettre", "soumission", "document"]
      },
      {
        question: "Comment planifier une visite ?",
        answer: "Les visites sont planifiées par les administrateurs. Vous pouvez consulter le calendrier des visites dans votre tableau de bord pour voir les dates prévues.",
        category: "visite",
        keywords: ["visite", "planifier", "calendrier", "rendez-vous"]
      },
      {
        question: "Comment modifier mes informations d'entreprise ?",
        answer: "Vous pouvez modifier vos informations via la section 'Profil' de votre tableau de bord. Les modifications importantes nécessitent une validation administrative.",
        category: "profil",
        keywords: ["profil", "modifier", "informations", "entreprise"]
      },
      {
        question: "Comment contacter le support ?",
        answer: "Vous pouvez utiliser l'assistant IA pour des questions courantes, ou escalader vers un administrateur via le bouton d'escalade dans l'interface de chat.",
        category: "support",
        keywords: ["support", "contact", "aide", "assistance"]
      }
    ];

    faqData.forEach((item, index) => {
      this.knowledgeBase.set(`faq_${index}`, {
        type: 'faq',
        question: item.question,
        answer: item.answer,
        category: item.category,
        keywords: item.keywords,
        lastUpdated: new Date()
      });
    });
  }

  async loadUserGuides() {
    // Guide d'utilisation statique
    const guides = [
      {
        title: "Guide de navigation",
        content: "Le tableau de bord principal vous donne accès à toutes les fonctionnalités. Utilisez le menu latéral pour naviguer entre les sections : Dashboard, KPI, Rapports, Profil, etc.",
        category: "navigation",
        keywords: ["navigation", "menu", "tableau", "bord"]
      },
      {
        title: "Gestion des KPI",
        content: "Les KPI (Indicateurs de Performance) vous permettent de suivre vos objectifs. Vous pouvez les consulter, les modifier et suivre leur évolution dans le temps.",
        category: "kpi",
        keywords: ["kpi", "indicateur", "performance", "objectif"]
      },
      {
        title: "Système de rapports",
        content: "Les rapports sont générés automatiquement ou peuvent être créés manuellement. Ils incluent les données financières, les indicateurs de performance et les analyses d'impact.",
        category: "rapport",
        keywords: ["rapport", "générer", "données", "analyse"]
      }
    ];

    guides.forEach((guide, index) => {
      this.knowledgeBase.set(`guide_${index}`, {
        type: 'guide',
        title: guide.title,
        content: guide.content,
        category: guide.category,
        keywords: guide.keywords,
        lastUpdated: new Date()
      });
    });
  }

  searchKnowledge(query, category = null, limit = 5) {
    const lowerQuery = query.toLowerCase();
    const queryWords = lowerQuery.split(/\s+/).filter(word => word.length > 2);
    
    const results = [];
    
    for (const [key, item] of this.knowledgeBase) {
      // Filtrer par catégorie si spécifiée
      if (category && item.category !== category) {
        continue;
      }
      
      let score = 0;
      
      // Score basé sur les mots-clés
      if (item.keywords) {
        queryWords.forEach(word => {
          if (item.keywords.some(keyword => keyword.includes(word))) {
            score += 2;
          }
        });
      }
      
      // Score basé sur le contenu
      if (item.content) {
        queryWords.forEach(word => {
          const matches = (item.content.toLowerCase().match(new RegExp(word, 'g')) || []).length;
          score += matches;
        });
      }
      
      // Score basé sur la question (pour FAQ)
      if (item.question) {
        queryWords.forEach(word => {
          if (item.question.toLowerCase().includes(word)) {
            score += 3; // Plus de poids pour les questions
          }
        });
      }
      
      if (score > 0) {
        results.push({
          ...item,
          id: key,
          score,
          relevance: this.calculateRelevance(queryWords, item)
        });
      }
    }
    
    // Trier par score et pertinence
    return results
      .sort((a, b) => (b.score + b.relevance) - (a.score + a.relevance))
      .slice(0, limit);
  }

  calculateRelevance(queryWords, item) {
    let relevance = 0;
    
    // Pertinence basée sur le type
    const typeWeights = {
      'faq': 3,
      'guide': 2,
      'documentation': 1
    };
    
    relevance += typeWeights[item.type] || 0;
    
    // Pertinence basée sur la fraîcheur
    const ageInDays = (Date.now() - new Date(item.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
    relevance += Math.max(0, 1 - ageInDays / 365); // Diminue avec l'âge
    
    return relevance;
  }

  processMarkdown(content) {
    // Simplifier le markdown pour l'analyse
    return content
      .replace(/```[\s\S]*?```/g, '') // Supprimer les blocs de code
      .replace(/`[^`]*`/g, '') // Supprimer le code inline
      .replace(/[#*\-_]/g, '') // Supprimer les marqueurs markdown
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .trim();
  }

  extractTitle(filename) {
    return filename
      .replace(/\.md$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  extractKeywords(content) {
    // Extraire les mots-clés significatifs
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));
    
    // Compter les occurrences
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Retourner les mots les plus fréquents
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  isStopWord(word) {
    const stopWords = [
      'avec', 'pour', 'dans', 'sur', 'sous', 'vers', 'par', 'de', 'du', 'des', 'le', 'la', 'les',
      'un', 'une', 'ce', 'cette', 'ces', 'que', 'qui', 'quoi', 'dont', 'où', 'quand', 'comment',
      'pourquoi', 'donc', 'alors', 'mais', 'ou', 'et', 'ni', 'car', 'ainsi', 'aussi', 'bien',
      'très', 'plus', 'moins', 'tout', 'tous', 'toute', 'toutes', 'chaque', 'plusieurs'
    ];
    
    return stopWords.includes(word);
  }

  getCachedResponse(query) {
    const cacheKey = this.generateCacheKey(query);
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
      return cached.response;
    }
    
    return null;
  }

  setCachedResponse(query, response) {
    const cacheKey = this.generateCacheKey(query);
    this.cache.set(cacheKey, {
      response,
      timestamp: Date.now()
    });
  }

  generateCacheKey(query) {
    return query.toLowerCase().replace(/\s+/g, '_');
  }

  // Méthode pour obtenir une réponse contextuelle
  getContextualResponse(query, userContext = {}) {
    // Vérifier le cache d'abord
    const cached = this.getCachedResponse(query);
    if (cached) {
      return cached;
    }
    
    // Rechercher dans la base de connaissances
    const searchResults = this.searchKnowledge(query);
    
    if (searchResults.length === 0) {
      return this.getDefaultResponse(query, userContext);
    }
    
    const bestMatch = searchResults[0];
    
    // Générer une réponse basée sur le meilleur résultat
    let response = '';
    
    if (bestMatch.type === 'faq') {
      response = bestMatch.answer;
    } else {
      response = this.generateResponseFromContent(bestMatch, query);
    }
    
    // Ajouter du contexte si disponible
    if (userContext.role === 'entreprise' && bestMatch.category) {
      response += `\n\n💡 **Conseil** : Consultez la section "${bestMatch.category}" de votre tableau de bord pour plus d'informations.`;
    }
    
    // Mettre en cache la réponse
    this.setCachedResponse(query, response);
    
    return response;
  }

  generateResponseFromContent(item, originalQuery) {
    let response = `**${item.title || 'Information trouvée'}**\n\n`;
    
    // Extraire les parties pertinentes du contenu
    const relevantParts = this.extractRelevantParts(item.content, originalQuery);
    
    if (relevantParts.length > 0) {
      response += relevantParts.join('\n\n');
    } else {
      response += item.content.substring(0, 300) + '...';
    }
    
    return response;
  }

  extractRelevantParts(content, query) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const queryWords = query.toLowerCase().split(/\s+/);
    
    const relevantSentences = sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return queryWords.some(word => lowerSentence.includes(word));
    });
    
    return relevantSentences.slice(0, 3); // Maximum 3 phrases pertinentes
  }

  getDefaultResponse(query, userContext) {
    if (userContext.role === 'admin') {
      return `Je n'ai pas trouvé d'informations spécifiques pour "${query}". 

**Suggestions :**
- Vérifiez les données directement dans la base de données
- Consultez les logs d'audit pour des informations récentes
- Utilisez les filtres du tableau de bord pour des analyses ciblées

Si vous avez besoin d'aide pour formuler une requête plus spécifique, n'hésitez pas à me le demander.`;
    } else {
      return `Je n'ai pas trouvé d'informations spécifiques pour "${query}".

**Que puis-je faire pour vous aider :**
- Expliquer comment utiliser une fonctionnalité spécifique
- Vous guider dans la navigation de la plateforme
- Vous aider avec vos KPI et rapports
- Vous connecter avec un administrateur si nécessaire

Pouvez-vous reformuler votre question ou me dire plus précisément ce que vous cherchez ?`;
    }
  }

  // Méthode pour mettre à jour la base de connaissances
  updateKnowledge(key, data) {
    this.knowledgeBase.set(key, {
      ...data,
      lastUpdated: new Date()
    });
  }

  // Méthode pour nettoyer le cache
  cleanCache() {
    const now = Date.now();
    for (const [key, value] of this.cache) {
      if ((now - value.timestamp) > this.cacheExpiry) {
        this.cache.delete(key);
      }
    }
  }
}

module.exports = new AIKnowledgeBase();
