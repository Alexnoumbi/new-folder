/**
 * Service de questions/réponses simple basé sur des règles
 * Pas besoin de modèles complexes - utilise des patterns et la base de données
 */

const Enterprise = require('../models/Entreprise');
const KPI = require('../models/KPI');
const Report = require('../models/Report');

class SimpleQAService {
    constructor() {
        this.questionPatterns = this.initializePatterns();
    }

    /**
     * Initialisation des patterns de questions
     */
    initializePatterns() {
        return {
            // Questions sur les entreprises
            enterprise: {
                patterns: [
                    /combien d['\s]?entreprises?/i,
                    /nombre d['\s]?entreprises?/i,
                    /liste des entreprises/i,
                    /quelles entreprises/i
                ],
                handler: 'handleEnterpriseQuestions'
            },
            
            // Questions sur les KPIs
            kpi: {
                patterns: [
                    /kpi|indicateur/i,
                    /performance/i,
                    /résultat/i,
                    /objectif/i
                ],
                handler: 'handleKPIQuestions'
            },
            
            // Questions sur les rapports
            reports: {
                patterns: [
                    /rapport/i,
                    /document/i,
                    /analyse/i
                ],
                handler: 'handleReportQuestions'
            },
            
            // Questions sur les statistiques
            stats: {
                patterns: [
                    /statistique/i,
                    /total/i,
                    /moyenne/i,
                    /pourcentage/i
                ],
                handler: 'handleStatsQuestions'
            },
            
            // Questions d'aide
            help: {
                patterns: [
                    /aide/i,
                    /help/i,
                    /comment/i,
                    /que puis-je/i
                ],
                handler: 'handleHelpQuestions'
            }
        };
    }

    /**
     * Traitement d'une question
     */
    async processQuestion(question, enterpriseId = null) {
        try {
            console.log(`Question reçue: ${question}`);
            
            // Détection du type de question
            const questionType = this.detectQuestionType(question);
            
            // Traitement selon le type
            const handler = this[this.questionPatterns[questionType].handler];
            const response = await handler.call(this, question, enterpriseId);
            
            return {
                success: true,
                question: question,
                type: questionType,
                response: response,
                timestamp: new Date()
            };
            
        } catch (error) {
            console.error('Erreur traitement question:', error);
            return {
                success: false,
                error: 'Je n\'ai pas pu traiter votre question. Pouvez-vous la reformuler ?'
            };
        }
    }

    /**
     * Détection du type de question
     */
    detectQuestionType(question) {
        for (const [type, config] of Object.entries(this.questionPatterns)) {
            for (const pattern of config.patterns) {
                if (pattern.test(question)) {
                    return type;
                }
            }
        }
        return 'help'; // Par défaut
    }

    /**
     * Traitement des questions sur les entreprises
     */
    async handleEnterpriseQuestions(question, enterpriseId) {
        try {
            if (question.match(/combien|nombre/i)) {
                const count = await Enterprise.countDocuments();
                return `Il y a actuellement ${count} entreprise(s) enregistrée(s) dans le système.`;
            }
            
            if (question.match(/liste|quelles/i)) {
                const enterprises = await Enterprise.find({}, 'nom secteur statut').limit(10);
                if (enterprises.length === 0) {
                    return "Aucune entreprise n'est enregistrée pour le moment.";
                }
                
                let response = "Voici les entreprises enregistrées :\n";
                enterprises.forEach((ent, index) => {
                    response += `${index + 1}. ${ent.nom} (${ent.secteur}) - Statut: ${ent.statut}\n`;
                });
                return response;
            }
            
            if (enterpriseId) {
                const enterprise = await Enterprise.findById(enterpriseId);
                if (enterprise) {
                    return `Informations sur ${enterprise.nom} :\n- Secteur: ${enterprise.secteur}\n- Statut: ${enterprise.statut}\n- Date de création: ${enterprise.dateCreation}`;
                }
            }
            
            return "Pouvez-vous préciser votre question sur les entreprises ?";
            
        } catch (error) {
            return "Erreur lors de la récupération des informations sur les entreprises.";
        }
    }

    /**
     * Traitement des questions sur les KPIs
     */
    async handleKPIQuestions(question, enterpriseId) {
        try {
            const filter = enterpriseId ? { entreprise: enterpriseId } : {};
            
            if (question.match(/combien|nombre/i)) {
                const count = await KPI.countDocuments(filter);
                return `Il y a ${count} KPI(s) enregistré(s)${enterpriseId ? ' pour cette entreprise' : ' au total'}.`;
            }
            
            if (question.match(/liste|quels/i)) {
                const kpis = await KPI.find(filter, 'nom valeur unite objectif').limit(10);
                if (kpis.length === 0) {
                    return "Aucun KPI n'est enregistré.";
                }
                
                let response = "Voici les KPIs :\n";
                kpis.forEach((kpi, index) => {
                    response += `${index + 1}. ${kpi.nom}: ${kpi.valeur} ${kpi.unite || ''} (Objectif: ${kpi.objectif || 'Non défini'})\n`;
                });
                return response;
            }
            
            if (question.match(/performance|résultat/i)) {
                const kpis = await KPI.find(filter);
                const totalKPIs = kpis.length;
                const achievedKPIs = kpis.filter(kpi => kpi.valeur >= kpi.objectif).length;
                const percentage = totalKPIs > 0 ? Math.round((achievedKPIs / totalKPIs) * 100) : 0;
                
                return `Performance des KPIs : ${achievedKPIs}/${totalKPIs} objectifs atteints (${percentage}%)`;
            }
            
            return "Pouvez-vous préciser votre question sur les KPIs ?";
            
        } catch (error) {
            return "Erreur lors de la récupération des informations sur les KPIs.";
        }
    }

    /**
     * Traitement des questions sur les rapports
     */
    async handleReportQuestions(question, enterpriseId) {
        try {
            const filter = enterpriseId ? { entreprise: enterpriseId } : {};
            
            if (question.match(/combien|nombre/i)) {
                const count = await Report.countDocuments(filter);
                return `Il y a ${count} rapport(s) enregistré(s)${enterpriseId ? ' pour cette entreprise' : ' au total'}.`;
            }
            
            if (question.match(/dernier|récent/i)) {
                const report = await Report.findOne(filter).sort({ dateCreation: -1 });
                if (!report) {
                    return "Aucun rapport récent trouvé.";
                }
                return `Dernier rapport : "${report.titre}" créé le ${report.dateCreation.toLocaleDateString()}`;
            }
            
            return "Pouvez-vous préciser votre question sur les rapports ?";
            
        } catch (error) {
            return "Erreur lors de la récupération des informations sur les rapports.";
        }
    }

    /**
     * Traitement des questions statistiques
     */
    async handleStatsQuestions(question, enterpriseId) {
        try {
            const stats = await this.generateBasicStats(enterpriseId);
            
            if (question.match(/total|nombre/i)) {
                return `Statistiques générales :\n- Entreprises: ${stats.totalEnterprises}\n- KPIs: ${stats.totalKPIs}\n- Rapports: ${stats.totalReports}`;
            }
            
            if (question.match(/moyenne/i)) {
                return `Moyennes :\n- KPIs par entreprise: ${stats.avgKPIsPerEnterprise}\n- Rapports par entreprise: ${stats.avgReportsPerEnterprise}`;
            }
            
            return JSON.stringify(stats, null, 2);
            
        } catch (error) {
            return "Erreur lors de la génération des statistiques.";
        }
    }

    /**
     * Traitement des questions d'aide
     */
    async handleHelpQuestions(question, enterpriseId) {
        return `Je peux vous aider avec :

📊 **Questions sur les entreprises :**
- "Combien d'entreprises sont enregistrées ?"
- "Liste des entreprises"

📈 **Questions sur les KPIs :**
- "Quels sont les KPIs ?"
- "Performance des KPIs"

📋 **Questions sur les rapports :**
- "Combien de rapports ?"
- "Quel est le dernier rapport ?"

📊 **Questions statistiques :**
- "Statistiques générales"
- "Moyennes"

Posez-moi une question sur ces sujets !`;
    }

    /**
     * Génération de statistiques de base
     */
    async generateBasicStats(enterpriseId = null) {
        const enterpriseFilter = enterpriseId ? { entreprise: enterpriseId } : {};
        
        const totalEnterprises = await Enterprise.countDocuments();
        const totalKPIs = await KPI.countDocuments(enterpriseFilter);
        const totalReports = await Report.countDocuments(enterpriseFilter);
        
        return {
            totalEnterprises: enterpriseId ? 1 : totalEnterprises,
            totalKPIs,
            totalReports,
            avgKPIsPerEnterprise: totalEnterprises > 0 ? Math.round(totalKPIs / totalEnterprises) : 0,
            avgReportsPerEnterprise: totalEnterprises > 0 ? Math.round(totalReports / totalEnterprises) : 0
        };
    }
}

module.exports = SimpleQAService;
