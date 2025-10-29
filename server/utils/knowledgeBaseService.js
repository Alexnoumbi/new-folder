const fs = require('fs').promises;
const path = require('path');

class KnowledgeBaseService {
  constructor() {
    this.knowledgeBase = null;
    this.isInitialized = false;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async initialize() {
    try {
      console.log('🧠 Initialisation du service de base de connaissances...');
      
      const knowledgeBasePath = path.join(__dirname, '../data/admin_knowledge_base.json');
      const data = await fs.readFile(knowledgeBasePath, 'utf8');
      this.knowledgeBase = JSON.parse(data);
      
      this.isInitialized = true;
      console.log(`✅ Base de connaissances chargée : ${this.knowledgeBase.metadata.totalEntries} entrées`);
      
      return true;
    } catch (error) {
      console.error('❌ Erreur chargement base de connaissances:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Recherche dans la base de connaissances
   * @param {string} question - Question posée
   * @param {string} category - Catégorie spécifique (optionnel)
   * @returns {Object} Réponse trouvée ou null
   */
  async searchKnowledge(question, category = null) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.isInitialized) {
      return null;
    }

    const questionLower = question.toLowerCase();
    const cacheKey = `search_${questionLower}_${category || 'all'}`;
    
    // Vérifier le cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`📚 Cache hit pour: "${question}"`);
        return cached.result;
      }
    }

    console.log(`🔍 Recherche dans la base de connaissances: "${question}"`);
    
    let bestMatch = null;
    let bestScore = 0;

    // Rechercher dans toutes les catégories ou une catégorie spécifique
    const categoriesToSearch = category ? 
      [this.knowledgeBase.categories[category]] : 
      Object.values(this.knowledgeBase.categories);

    for (const categoryData of categoriesToSearch) {
      if (!categoryData) continue;

      for (const entry of categoryData.entries) {
        const score = this.calculateMatchScore(questionLower, entry);
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = {
            ...entry,
            category: categoryData.name,
            score: score
          };
        }
      }
    }

    // Rechercher dans les questions communes
    for (const [key, commonData] of Object.entries(this.knowledgeBase.common_questions)) {
      for (const pattern of commonData.patterns) {
        if (questionLower.includes(pattern)) {
          const score = this.calculatePatternScore(questionLower, pattern);
          if (score > bestScore) {
            bestScore = score;
            bestMatch = {
              id: `common_${key}`,
              question: pattern,
              answer: commonData.response,
              category: 'Questions communes',
              score: score,
              confidence: 0.8
            };
          }
        }
      }
    }

    // Mettre en cache le résultat
    this.cache.set(cacheKey, {
      result: bestMatch,
      timestamp: Date.now()
    });

    if (bestMatch) {
      console.log(`✅ Trouvé: "${bestMatch.question}" (score: ${bestMatch.score.toFixed(2)})`);
    } else {
      console.log(`❌ Aucune correspondance trouvée pour: "${question}"`);
    }

    return bestMatch;
  }

  /**
   * Calcule le score de correspondance entre une question et une entrée
   * @param {string} question - Question en minuscules
   * @param {Object} entry - Entrée de la base de connaissances
   * @returns {number} Score de correspondance (0-1)
   */
  calculateMatchScore(question, entry) {
    let score = 0;
    let matches = 0;
    let totalKeywords = 0;

    // Vérifier la correspondance exacte de la question
    if (entry.question && question.includes(entry.question.toLowerCase())) {
      score += 0.4;
      matches++;
    }

    // Vérifier les mots-clés
    if (entry.keywords) {
      totalKeywords = entry.keywords.length;
      for (const keyword of entry.keywords) {
        if (question.includes(keyword.toLowerCase())) {
          score += 0.3 / totalKeywords;
          matches++;
        }
      }
    }

    // Bonus pour les correspondances multiples
    if (matches > 1) {
      score += 0.1 * (matches - 1);
    }

    // Appliquer le facteur de confiance de l'entrée
    if (entry.confidence) {
      score *= entry.confidence;
    }

    return Math.min(score, 1);
  }

  /**
   * Calcule le score pour les patterns de questions communes
   * @param {string} question - Question en minuscules
   * @param {string} pattern - Pattern à matcher
   * @returns {number} Score de correspondance
   */
  calculatePatternScore(question, pattern) {
    const patternLower = pattern.toLowerCase();
    
    if (question === patternLower) {
      return 1.0; // Correspondance exacte
    } else if (question.includes(patternLower)) {
      return 0.8; // Contient le pattern
    }
    
    return 0;
  }

  /**
   * Obtient une réponse enrichie avec des détails
   * @param {Object} match - Correspondance trouvée
   * @param {string} originalQuestion - Question originale
   * @returns {Object} Réponse enrichie
   */
  enrichResponse(match, originalQuestion) {
    if (!match) {
      return null;
    }

    const response = {
      success: true,
      answer: match.answer,
      confidence: match.confidence || match.score,
      category: match.category,
      source: 'knowledge_base',
      metadata: {
        entryId: match.id,
        score: match.score,
        hasDetails: !!match.details,
        hasSteps: !!match.steps
      }
    };

    // Ajouter des détails si disponibles
    if (match.details) {
      response.details = match.details;
    }

    // Ajouter des étapes si disponibles
    if (match.steps) {
      response.steps = match.steps;
    }

    // Ajouter des actions rapides si disponibles
    if (this.knowledgeBase.quick_actions) {
      response.quickActions = this.getRelevantQuickActions(match);
    }

    return response;
  }

  /**
   * Obtient les actions rapides pertinentes pour une correspondance
   * @param {Object} match - Correspondance trouvée
   * @returns {Array} Actions rapides pertinentes
   */
  getRelevantQuickActions(match) {
    const actions = [];
    
    if (!this.knowledgeBase.quick_actions) {
      return actions;
    }

    // Mapper les catégories aux actions
    const categoryActions = {
      'Gestion Utilisateurs': ['create_user'],
      'Gestion Entreprises': ['validate_enterprise'],
      'Rapports et Analyses': ['generate_report'],
      'Configuration Système': ['system_config'],
      'Sécurité et Audit': ['security_logs']
    };

    const relevantActions = categoryActions[match.category] || [];
    
    for (const actionKey of relevantActions) {
      if (this.knowledgeBase.quick_actions[actionKey]) {
        actions.push(this.knowledgeBase.quick_actions[actionKey]);
      }
    }

    return actions;
  }

  /**
   * Obtient les statistiques de la base de connaissances
   * @returns {Object} Statistiques
   */
  getStats() {
    if (!this.isInitialized) {
      return null;
    }

    const stats = {
      totalEntries: this.knowledgeBase.metadata.totalEntries,
      categories: Object.keys(this.knowledgeBase.categories).length,
      cacheSize: this.cache.size,
      lastUpdated: this.knowledgeBase.metadata.lastUpdated
    };

    // Compter les entrées par catégorie
    stats.entriesByCategory = {};
    for (const [categoryName, categoryData] of Object.entries(this.knowledgeBase.categories)) {
      stats.entriesByCategory[categoryName] = categoryData.entries.length;
    }

    return stats;
  }

  /**
   * Nettoie le cache
   */
  cleanCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
    console.log(`🧹 Cache nettoyé, ${this.cache.size} entrées restantes`);
  }

  /**
   * Recharge la base de connaissances
   * @returns {boolean} Succès du rechargement
   */
  async reload() {
    console.log('🔄 Rechargement de la base de connaissances...');
    this.cache.clear();
    this.isInitialized = false;
    return await this.initialize();
  }
}

module.exports = KnowledgeBaseService;
