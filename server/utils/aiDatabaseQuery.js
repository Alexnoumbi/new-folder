const mongoose = require('mongoose');

class AIDatabaseQuery {
  constructor() {
    // Collections autorisées pour les requêtes IA (lecture seule)
    this.allowedCollections = [
      'entreprises',
      'users',
      'kpis',
      'indicators',
      'portfolios',
      'reports',
      'auditlogs',
      'messages',
      'visits'
    ];

    // Champs sensibles à exclure
    this.excludedFields = [
      'password',
      'token',
      'secret',
      'private',
      'internal',
      'confidential'
    ];

    // Opérateurs autorisés
    this.allowedOperators = [
      '$eq', '$ne', '$gt', '$gte', '$lt', '$lte',
      '$in', '$nin', '$exists', '$regex',
      '$and', '$or', '$not'
    ];
  }

  async executeQuery(question, userRole) {
    try {
      // Analyser la question pour extraire les paramètres de requête
      const queryParams = this.parseQuestion(question);
      
      // Valider et sécuriser la requête
      const validatedQuery = this.validateAndSanitizeQuery(queryParams);
      
      // Exécuter la requête
      const results = await this.runQuery(validatedQuery);
      
      // Formater les résultats pour l'IA
      return this.formatResults(results, queryParams);
    } catch (error) {
      console.error('Erreur lors de l\'exécution de la requête IA:', error);
      throw new Error(`Impossible d'exécuter la requête: ${error.message}`);
    }
  }

  parseQuestion(question) {
    const lowerQuestion = question.toLowerCase();
    
    // Détecter le type de requête
    if (lowerQuestion.includes('combien') || lowerQuestion.includes('nombre')) {
      return this.parseCountQuery(question);
    }
    
    if (lowerQuestion.includes('liste') || lowerQuestion.includes('tous')) {
      return this.parseListQuery(question);
    }
    
    if (lowerQuestion.includes('dernière') || lowerQuestion.includes('récent')) {
      return this.parseRecentQuery(question);
    }
    
    if (lowerQuestion.includes('statistique') || lowerQuestion.includes('moyenne')) {
      return this.parseStatsQuery(question);
    }
    
    // Requête par défaut - recherche simple
    return this.parseSearchQuery(question);
  }

  parseCountQuery(question) {
    const collection = this.detectCollection(question);
    const filters = this.extractFilters(question);
    
    return {
      type: 'count',
      collection,
      filters,
      limit: 1
    };
  }

  parseListQuery(question) {
    const collection = this.detectCollection(question);
    const filters = this.extractFilters(question);
    const sort = this.extractSort(question);
    
    return {
      type: 'find',
      collection,
      filters,
      sort,
      limit: 10,
      projection: this.getDefaultProjection(collection)
    };
  }

  parseRecentQuery(question) {
    const collection = this.detectCollection(question);
    const filters = this.extractFilters(question);
    
    return {
      type: 'find',
      collection,
      filters: {
        ...filters,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 7 jours
      },
      sort: { createdAt: -1 },
      limit: 5,
      projection: this.getDefaultProjection(collection)
    };
  }

  parseStatsQuery(question) {
    const collection = this.detectCollection(question);
    const field = this.detectField(question);
    
    return {
      type: 'aggregate',
      collection,
      pipeline: this.buildStatsPipeline(field, collection)
    };
  }

  parseSearchQuery(question) {
    const collection = this.detectCollection(question);
    const searchTerms = this.extractSearchTerms(question);
    
    return {
      type: 'find',
      collection,
      filters: {
        $or: searchTerms.map(term => ({
          $or: this.getSearchableFields(collection).map(field => ({
            [field]: { $regex: term, $options: 'i' }
          }))
        }))
      },
      limit: 5,
      projection: this.getDefaultProjection(collection)
    };
  }

  detectCollection(question) {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('entreprise')) return 'entreprises';
    if (lowerQuestion.includes('utilisateur') || lowerQuestion.includes('user')) return 'users';
    if (lowerQuestion.includes('kpi') || lowerQuestion.includes('indicateur')) return 'kpis';
    if (lowerQuestion.includes('portfolio')) return 'portfolios';
    if (lowerQuestion.includes('rapport')) return 'reports';
    if (lowerQuestion.includes('audit') || lowerQuestion.includes('log')) return 'auditlogs';
    if (lowerQuestion.includes('message')) return 'messages';
    if (lowerQuestion.includes('visite')) return 'visits';
    
    return 'entreprises'; // Collection par défaut
  }

  extractFilters(question) {
    const filters = {};
    const lowerQuestion = question.toLowerCase();
    
    // Filtres de date
    if (lowerQuestion.includes('aujourd\'hui')) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filters.createdAt = { $gte: today };
    }
    
    if (lowerQuestion.includes('cette semaine')) {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      filters.createdAt = { $gte: weekAgo };
    }
    
    if (lowerQuestion.includes('ce mois')) {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      filters.createdAt = { $gte: monthAgo };
    }
    
    // Filtres de statut
    if (lowerQuestion.includes('actif') || lowerQuestion.includes('active')) {
      filters.status = { $in: ['active', 'ACTIVE', 'actif', 'ACTIF'] };
    }
    
    if (lowerQuestion.includes('inactif') || lowerQuestion.includes('inactive')) {
      filters.status = { $in: ['inactive', 'INACTIVE', 'inactif', 'INACTIF'] };
    }
    
    return filters;
  }

  extractSort(question) {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('plus récent') || lowerQuestion.includes('dernier')) {
      return { createdAt: -1 };
    }
    
    if (lowerQuestion.includes('plus ancien') || lowerQuestion.includes('premier')) {
      return { createdAt: 1 };
    }
    
    if (lowerQuestion.includes('nom')) {
      return { nom: 1 };
    }
    
    return { createdAt: -1 }; // Tri par défaut
  }

  detectField(question) {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('effectif') || lowerQuestion.includes('personnel')) {
      return 'effectifs';
    }
    
    if (lowerQuestion.includes('chiffre') || lowerQuestion.includes('ca')) {
      return 'ca';
    }
    
    if (lowerQuestion.includes('budget') || lowerQuestion.includes('finance')) {
      return 'budget';
    }
    
    return 'value'; // Champ par défaut
  }

  extractSearchTerms(question) {
    // Extraire les mots-clés significatifs (plus de 3 caractères)
    return question
      .split(/\s+/)
      .filter(word => word.length > 3)
      .map(word => word.replace(/[^\w\s]/g, ''))
      .filter(word => word.length > 0);
  }

  validateAndSanitizeQuery(queryParams) {
    // Vérifier que la collection est autorisée
    if (!this.allowedCollections.includes(queryParams.collection)) {
      throw new Error(`Collection non autorisée: ${queryParams.collection}`);
    }
    
    // Nettoyer les filtres
    if (queryParams.filters) {
      queryParams.filters = this.sanitizeFilters(queryParams.filters);
    }
    
    // Limiter le nombre de résultats
    if (!queryParams.limit || queryParams.limit > 50) {
      queryParams.limit = 10;
    }
    
    return queryParams;
  }

  sanitizeFilters(filters) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(filters)) {
      // Exclure les champs sensibles
      if (this.excludedFields.some(field => key.toLowerCase().includes(field))) {
        continue;
      }
      
      // Valider les opérateurs MongoDB
      if (typeof value === 'object' && value !== null) {
        const sanitizedValue = {};
        for (const [op, val] of Object.entries(value)) {
          if (this.allowedOperators.includes(op)) {
            sanitizedValue[op] = val;
          }
        }
        if (Object.keys(sanitizedValue).length > 0) {
          sanitized[key] = sanitizedValue;
        }
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  async runQuery(queryParams) {
    const db = mongoose.connection.db;
    const collection = db.collection(queryParams.collection);
    
    switch (queryParams.type) {
      case 'count':
        return await collection.countDocuments(queryParams.filters || {});
      
      case 'find':
        let cursor = collection.find(queryParams.filters || {});
        
        if (queryParams.sort) {
          cursor = cursor.sort(queryParams.sort);
        }
        
        if (queryParams.limit) {
          cursor = cursor.limit(queryParams.limit);
        }
        
        if (queryParams.projection) {
          cursor = cursor.project(queryParams.projection);
        }
        
        return await cursor.toArray();
      
      case 'aggregate':
        return await collection.aggregate(queryParams.pipeline).toArray();
      
      default:
        throw new Error(`Type de requête non supporté: ${queryParams.type}`);
    }
  }

  formatResults(results, queryParams) {
    if (queryParams.type === 'count') {
      return {
        type: 'count',
        value: results,
        collection: queryParams.collection,
        message: `Nombre total: ${results}`
      };
    }
    
    if (queryParams.type === 'aggregate') {
      return {
        type: 'stats',
        data: results,
        collection: queryParams.collection,
        message: `Statistiques calculées pour ${queryParams.collection}`
      };
    }
    
    return {
      type: 'list',
      data: results,
      collection: queryParams.collection,
      count: results.length,
      message: `${results.length} résultats trouvés`
    };
  }

  getDefaultProjection(collection) {
    const projections = {
      entreprises: { nomEntreprise: 1, secteur: 1, statut: 1, createdAt: 1 },
      users: { nom: 1, email: 1, role: 1, createdAt: 1 },
      kpis: { nom: 1, valeur: 1, unite: 1, createdAt: 1 },
      portfolios: { nom: 1, description: 1, statut: 1, createdAt: 1 },
      reports: { titre: 1, type: 1, statut: 1, createdAt: 1 },
      auditlogs: { action: 1, user: 1, timestamp: 1 },
      messages: { sujet: 1, expediteur: 1, statut: 1, createdAt: 1 },
      visits: { entreprise: 1, date: 1, statut: 1 }
    };
    
    return projections[collection] || {};
  }

  getSearchableFields(collection) {
    const searchableFields = {
      entreprises: ['nomEntreprise', 'secteur', 'description'],
      users: ['nom', 'email', 'role'],
      kpis: ['nom', 'description'],
      portfolios: ['nom', 'description'],
      reports: ['titre', 'description'],
      auditlogs: ['action', 'details'],
      messages: ['sujet', 'contenu'],
      visits: ['entreprise', 'commentaire']
    };
    
    return searchableFields[collection] || [];
  }

  buildStatsPipeline(field, collection) {
    return [
      { $match: {} },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avg: { $avg: `$${field}` },
          min: { $min: `$${field}` },
          max: { $max: `$${field}` },
          sum: { $sum: `$${field}` }
        }
      }
    ];
  }
}

module.exports = new AIDatabaseQuery();
