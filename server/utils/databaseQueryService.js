/**
 * Service pour interroger la base de données en langage naturel
 * Convertit les questions en requêtes MongoDB simples
 */

const Enterprise = require('../models/Entreprise');
const KPI = require('../models/KPI');
const Report = require('../models/Report');
const User = require('../models/User');

class DatabaseQueryService {
    constructor() {
        this.queryPatterns = this.initializeQueryPatterns();
    }

    /**
     * Initialisation des patterns de requêtes
     */
    initializeQueryPatterns() {
        return {
            // Recherche d'entreprises
            findEnterprises: {
                patterns: [
                    /entreprises? (du|dans le) secteur (.+)/i,
                    /entreprises? avec statut (.+)/i,
                    /cherche entreprise (.+)/i,
                    /entreprises? qui (.+)/i
                ],
                handler: 'queryEnterprises'
            },
            
            // Recherche de KPIs
            findKPIs: {
                patterns: [
                    /kpis? (supérieur|inférieur|égal) à (\d+)/i,
                    /kpis? avec (.+)/i,
                    /performance (.+)/i
                ],
                handler: 'queryKPIs'
            },
            
            // Recherche de rapports
            findReports: {
                patterns: [
                    /rapports? (de|du) (.+)/i,
                    /rapports? créés? (avant|après) (.+)/i,
                    /rapports? contenant (.+)/i
                ],
                handler: 'queryReports'
            },
            
            // Statistiques
            getStats: {
                patterns: [
                    /statistiques? (.+)/i,
                    /combien de (.+)/i,
                    /nombre de (.+)/i
                ],
                handler: 'queryStats'
            }
        };
    }

    /**
     * Traitement d'une requête en langage naturel
     */
    async processQuery(query, enterpriseId = null) {
        try {
            console.log(`Requête reçue: ${query}`);
            
            // Détection du type de requête
            const queryType = this.detectQueryType(query);
            
            // Traitement selon le type
            const handler = this[this.queryPatterns[queryType].handler];
            const results = await handler.call(this, query, enterpriseId);
            
            return {
                success: true,
                query: query,
                type: queryType,
                results: results,
                count: Array.isArray(results) ? results.length : 1,
                timestamp: new Date()
            };
            
        } catch (error) {
            console.error('Erreur traitement requête:', error);
            return {
                success: false,
                error: 'Je n\'ai pas pu traiter votre requête. Veuillez la reformuler.'
            };
        }
    }

    /**
     * Détection du type de requête
     */
    detectQueryType(query) {
        for (const [type, config] of Object.entries(this.queryPatterns)) {
            for (const pattern of config.patterns) {
                if (pattern.test(query)) {
                    return type;
                }
            }
        }
        return 'getStats'; // Par défaut
    }

    /**
     * Requêtes sur les entreprises
     */
    async queryEnterprises(query, enterpriseId) {
        let filter = {};
        
        // Recherche par secteur
        const sectorMatch = query.match(/secteur (.+)/i);
        if (sectorMatch) {
            filter.secteur = new RegExp(sectorMatch[1], 'i');
        }
        
        // Recherche par statut
        const statusMatch = query.match(/statut (.+)/i);
        if (statusMatch) {
            filter.statut = new RegExp(statusMatch[1], 'i');
        }
        
        // Recherche par nom
        const nameMatch = query.match(/cherche entreprise (.+)/i);
        if (nameMatch) {
            filter.nom = new RegExp(nameMatch[1], 'i');
        }
        
        // Si une entreprise spécifique est demandée
        if (enterpriseId) {
            filter._id = enterpriseId;
        }
        
        const enterprises = await Enterprise.find(filter)
            .select('nom secteur statut dateCreation')
            .limit(20);
            
        return enterprises;
    }

    /**
     * Requêtes sur les KPIs
     */
    async queryKPIs(query, enterpriseId) {
        let filter = {};
        
        if (enterpriseId) {
            filter.entreprise = enterpriseId;
        }
        
        // Recherche par valeur
        const valueMatch = query.match(/(supérieur|inférieur|égal) à (\d+)/i);
        if (valueMatch) {
            const operator = valueMatch[1].toLowerCase();
            const value = parseFloat(valueMatch[2]);
            
            switch (operator) {
                case 'supérieur':
                    filter.valeur = { $gt: value };
                    break;
                case 'inférieur':
                    filter.valeur = { $lt: value };
                    break;
                case 'égal':
                    filter.valeur = value;
                    break;
            }
        }
        
        // Recherche par nom/type
        const nameMatch = query.match(/avec (.+)/i);
        if (nameMatch) {
            filter.nom = new RegExp(nameMatch[1], 'i');
        }
        
        const kpis = await KPI.find(filter)
            .populate('entreprise', 'nom')
            .limit(20);
            
        return kpis;
    }

    /**
     * Requêtes sur les rapports
     */
    async queryReports(query, enterpriseId) {
        let filter = {};
        
        if (enterpriseId) {
            filter.entreprise = enterpriseId;
        }
        
        // Recherche par date
        const dateMatch = query.match(/(avant|après) (.+)/i);
        if (dateMatch) {
            const operator = dateMatch[1].toLowerCase();
            const dateStr = dateMatch[2];
            const date = new Date(dateStr);
            
            if (!isNaN(date.getTime())) {
                filter.dateCreation = operator === 'avant' ? { $lt: date } : { $gt: date };
            }
        }
        
        // Recherche par contenu
        const contentMatch = query.match(/contenant (.+)/i);
        if (contentMatch) {
            filter.$or = [
                { titre: new RegExp(contentMatch[1], 'i') },
                { contenu: new RegExp(contentMatch[1], 'i') }
            ];
        }
        
        // Recherche par entreprise
        const enterpriseMatch = query.match(/rapports? (de|du) (.+)/i);
        if (enterpriseMatch && !enterpriseId) {
            const enterpriseName = enterpriseMatch[2];
            const enterprise = await Enterprise.findOne({ nom: new RegExp(enterpriseName, 'i') });
            if (enterprise) {
                filter.entreprise = enterprise._id;
            }
        }
        
        const reports = await Report.find(filter)
            .populate('entreprise', 'nom')
            .select('titre dateCreation type')
            .limit(20);
            
        return reports;
    }

    /**
     * Requêtes statistiques
     */
    async queryStats(query, enterpriseId) {
        const stats = {};
        
        // Statistiques générales
        if (query.match(/entreprises?/i)) {
            stats.totalEnterprises = await Enterprise.countDocuments();
            stats.enterprisesBySector = await Enterprise.aggregate([
                { $group: { _id: '$secteur', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);
        }
        
        if (query.match(/kpis?/i)) {
            const filter = enterpriseId ? { entreprise: enterpriseId } : {};
            stats.totalKPIs = await KPI.countDocuments(filter);
            stats.avgKPIValue = await KPI.aggregate([
                { $match: filter },
                { $group: { _id: null, avg: { $avg: '$valeur' } } }
            ]);
        }
        
        if (query.match(/rapports?/i)) {
            const filter = enterpriseId ? { entreprise: enterpriseId } : {};
            stats.totalReports = await Report.countDocuments(filter);
            stats.reportsByType = await Report.aggregate([
                { $match: filter },
                { $group: { _id: '$type', count: { $sum: 1 } } }
            ]);
        }
        
        if (query.match(/utilisateurs?/i)) {
            stats.totalUsers = await User.countDocuments();
            stats.usersByRole = await User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]);
        }
        
        return stats;
    }

    /**
     * Suggestions de requêtes
     */
    getSuggestions() {
        return [
            "Entreprises du secteur technologie",
            "Entreprises avec statut actif",
            "KPIs supérieur à 80",
            "Rapports créés après 2024-01-01",
            "Statistiques entreprises",
            "Combien de KPIs",
            "Rapports contenant performance"
        ];
    }

    /**
     * Validation d'une requête
     */
    validateQuery(query) {
        if (!query || query.trim().length < 3) {
            return {
                valid: false,
                error: "La requête doit contenir au moins 3 caractères"
            };
        }
        
        return { valid: true };
    }
}

module.exports = DatabaseQueryService;
