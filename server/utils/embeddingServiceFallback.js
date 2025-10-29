/**
 * Service d'embedding de fallback (sans Transformers)
 * Utilise des techniques de traitement de texte simples
 */

const natural = require('natural');
const fs = require('fs').promises;
const path = require('path');

class EmbeddingServiceFallback {
    constructor() {
        this.dimension = 384; // Même dimension que Sentence Transformers
        this.tfidf = new natural.TfIdf();
        this.vocabulary = new Set();
        this.isInitialized = false;
        this.cache = new Map();
    }

    /**
     * Initialisation du service d'embedding de fallback
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('🔄 Initialisation du service d\'embedding (fallback)...');

            // Chargement du vocabulaire existant si disponible
            await this.loadVocabulary();

            this.isInitialized = true;
            console.log('✅ Service d\'embedding (fallback) initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation embedding fallback:', error);
            this.isInitialized = true; // Continuer avec des fonctionnalités limitées
        }
    }

    /**
     * Chargement du vocabulaire depuis le disque
     */
    async loadVocabulary() {
        try {
            const vocabPath = path.join(__dirname, '../data/vocabulary.json');
            const vocabContent = await fs.readFile(vocabPath, 'utf8');
            const vocabData = JSON.parse(vocabContent);
            
            this.vocabulary = new Set(vocabData.vocabulary || []);
            console.log(`📚 Vocabulaire chargé: ${this.vocabulary.size} mots`);
        } catch (error) {
            console.log('📚 Aucun vocabulaire existant, création d\'un nouveau');
            this.vocabulary = new Set();
        }
    }

    /**
     * Sauvegarde du vocabulaire sur le disque
     */
    async saveVocabulary() {
        try {
            const vocabPath = path.join(__dirname, '../data/vocabulary.json');
            const vocabData = {
                vocabulary: Array.from(this.vocabulary),
                timestamp: Date.now()
            };

            await fs.writeFile(vocabPath, JSON.stringify(vocabData, null, 2));
            console.log('💾 Vocabulaire sauvegardé');
        } catch (error) {
            console.error('Erreur sauvegarde vocabulaire:', error);
        }
    }

    /**
     * Alias pour generateEmbedding (compatibilité)
     */
    async getEmbedding(text) {
        return await this.generateEmbedding(text);
    }

    /**
     * Génération d'embedding basé sur TF-IDF et caractéristiques textuelles
     */
    async generateEmbedding(text) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        // Vérification du cache
        const cacheKey = this.getCacheKey(text);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            // Préprocessing du texte
            const processedText = this.preprocessText(text);
            
            // Génération de l'embedding
            const embedding = this.createTextEmbedding(processedText);

            // Mise en cache
            this.cache.set(cacheKey, embedding);

            return embedding;
        } catch (error) {
            console.error('Erreur génération embedding (fallback):', error);
            // Retourner un embedding zéro en cas d'erreur
            return new Array(this.dimension).fill(0);
        }
    }

    /**
     * Génération d'embeddings pour plusieurs textes
     */
    async generateEmbeddings(texts) {
        const embeddings = [];
        
        for (const text of texts) {
            const embedding = await this.generateEmbedding(text);
            embeddings.push(embedding);
        }

        return embeddings;
    }

    /**
     * Préprocessing du texte
     */
    preprocessText(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        // Normalisation
        let processed = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Suppression de la ponctuation
            .replace(/\s+/g, ' ') // Normalisation des espaces
            .trim();

        // Tokenisation
        const tokens = natural.WordTokenizer().tokenize(processed);
        
        // Filtrage des mots vides et ajout au vocabulaire
        const filteredTokens = tokens.filter(token => {
            if (token.length < 2) return false;
            if (natural.stopwords.includes(token)) return false;
            
            this.vocabulary.add(token);
            return true;
        });

        return filteredTokens.join(' ');
    }

    /**
     * Création d'embedding basé sur les caractéristiques textuelles
     */
    createTextEmbedding(text) {
        const tokens = text.split(' ');
        const embedding = new Array(this.dimension).fill(0);

        // Caractéristiques basiques
        const features = this.extractTextFeatures(text, tokens);
        
        // Distribution des caractéristiques dans l'embedding
        for (let i = 0; i < Math.min(features.length, this.dimension); i++) {
            embedding[i] = features[i];
        }

        // Normalisation
        const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        if (norm > 0) {
            for (let i = 0; i < embedding.length; i++) {
                embedding[i] = embedding[i] / norm;
            }
        }

        return embedding;
    }

    /**
     * Extraction de caractéristiques textuelles
     */
    extractTextFeatures(text, tokens) {
        const features = [];

        // Caractéristiques de longueur
        features.push(text.length / 1000); // Longueur normalisée
        features.push(tokens.length / 100); // Nombre de tokens normalisé

        // Caractéristiques de fréquence
        const tokenCounts = {};
        tokens.forEach(token => {
            tokenCounts[token] = (tokenCounts[token] || 0) + 1;
        });

        const uniqueTokens = Object.keys(tokenCounts).length;
        features.push(uniqueTokens / Math.max(tokens.length, 1)); // Ratio tokens uniques

        // Caractéristiques de vocabulaire
        const vocabMatches = tokens.filter(token => this.vocabulary.has(token)).length;
        features.push(vocabMatches / Math.max(tokens.length, 1)); // Ratio vocabulaire connu

        // Caractéristiques de complexité
        const avgTokenLength = tokens.reduce((sum, token) => sum + token.length, 0) / Math.max(tokens.length, 1);
        features.push(avgTokenLength / 10); // Longueur moyenne des tokens

        // Caractéristiques de répétition
        const maxFreq = Math.max(...Object.values(tokenCounts));
        features.push(maxFreq / Math.max(tokens.length, 1)); // Fréquence maximale normalisée

        // Caractéristiques de distribution
        const frequencies = Object.values(tokenCounts);
        const variance = this.calculateVariance(frequencies);
        features.push(variance / 100); // Variance des fréquences

        // Caractéristiques de position
        const firstHalfTokens = tokens.slice(0, Math.floor(tokens.length / 2));
        const secondHalfTokens = tokens.slice(Math.floor(tokens.length / 2));
        
        const firstHalfUnique = new Set(firstHalfTokens).size;
        const secondHalfUnique = new Set(secondHalfTokens).size;
        
        features.push(firstHalfUnique / Math.max(firstHalfTokens.length, 1));
        features.push(secondHalfUnique / Math.max(secondHalfTokens.length, 1));

        // Caractéristiques de cooccurrence (simplifiées)
        const cooccurrenceScore = this.calculateCooccurrenceScore(tokens);
        features.push(cooccurrenceScore);

        // Remplissage avec des caractéristiques dérivées
        while (features.length < this.dimension) {
            const derivedFeature = features[features.length % features.length] * 
                                 Math.sin(features.length / 10) * 
                                 Math.cos(features.length / 7);
            features.push(derivedFeature);
        }

        return features.slice(0, this.dimension);
    }

    /**
     * Calcul de la variance
     */
    calculateVariance(values) {
        if (values.length === 0) return 0;
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        
        return variance;
    }

    /**
     * Calcul du score de cooccurrence (simplifié)
     */
    calculateCooccurrenceScore(tokens) {
        if (tokens.length < 2) return 0;

        let cooccurrences = 0;
        const windowSize = Math.min(3, tokens.length - 1);

        for (let i = 0; i < tokens.length - windowSize; i++) {
            const window = tokens.slice(i, i + windowSize + 1);
            const uniqueInWindow = new Set(window).size;
            cooccurrences += uniqueInWindow / window.length;
        }

        return cooccurrences / Math.max(tokens.length - windowSize, 1);
    }

    /**
     * Génération de clé de cache
     */
    getCacheKey(text) {
        return `embedding_${Buffer.from(text).toString('base64').slice(0, 50)}`;
    }

    /**
     * Nettoyage du cache
     */
    cleanupCache() {
        if (this.cache.size > 1000) {
            const entries = Array.from(this.cache.entries());
            const toKeep = entries.slice(-500); // Garder les 500 plus récents
            this.cache.clear();
            toKeep.forEach(([key, value]) => this.cache.set(key, value));
        }
    }

    /**
     * Statistiques du service
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            dimension: this.dimension,
            vocabularySize: this.vocabulary.size,
            cacheSize: this.cache.size,
            serviceType: 'Fallback'
        };
    }

    /**
     * Nettoyage des ressources
     */
    async destroy() {
        await this.saveVocabulary();
        this.cache.clear();
        this.vocabulary.clear();
        this.isInitialized = false;
    }
}

module.exports = EmbeddingServiceFallback;