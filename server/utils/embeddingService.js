/**
 * Service d'embeddings avec Sentence Transformers
 * Origine : Basé sur les modèles BERT/RoBERTa (2018-2019)
 * Fonctionnement : Encode le texte en vecteurs de 384 dimensions
 */

const { pipeline } = require('@xenova/transformers');
const natural = require('natural');
const fs = require('fs').promises;
const path = require('path');

class EmbeddingService {
    constructor() {
        this.model = null;
        this.modelName = 'Xenova/all-MiniLM-L6-v2'; // Modèle optimisé pour la similarité sémantique
        this.cache = new Map();
        this.cacheFile = path.join(__dirname, '../data/embeddings_cache.json');
        this.isInitialized = false;
    }

    /**
     * Initialisation du modèle Sentence Transformers
     * Le modèle all-MiniLM-L6-v2 :
     * - Basé sur BERT (Bidirectional Encoder Representations from Transformers)
     * - Optimisé pour la vitesse tout en gardant une bonne précision
     * - Produit des embeddings de 384 dimensions
     * - Entraîné sur des paires de phrases pour la similarité sémantique
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('🔄 Initialisation du modèle Sentence Transformers...');
            
            // Chargement du modèle de feature extraction
            this.model = await pipeline('feature-extraction', this.modelName, {
                quantized: false, // Pour une meilleure précision
                revision: 'main'
            });

            // Chargement du cache existant
            await this.loadCache();

            this.isInitialized = true;
            console.log('✅ Modèle Sentence Transformers initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation modèle:', error);
            throw new Error('Impossible d\'initialiser le service d\'embeddings');
        }
    }

    /**
     * Préprocessing du texte avant embedding
     * Origine : Techniques NLP classiques + optimisations pour Transformers
     */
    preprocessText(text) {
        if (!text || typeof text !== 'string') return '';

        return text
            .toLowerCase() // Normalisation de la casse
            .trim() // Suppression des espaces
            .replace(/[^\w\sàâäéèêëïîôöùûüÿç]/g, ' ') // Nettoyage caractères spéciaux
            .replace(/\s+/g, ' ') // Normalisation des espaces
            .substring(0, 512); // Limitation pour le modèle (max 512 tokens)
    }

    /**
     * Génération d'embedding pour un texte
     * Utilise le modèle Sentence Transformers pour encoder le texte
     */
    async getEmbedding(text) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const cleanText = this.preprocessText(text);
        if (!cleanText) return null;

        // Vérification du cache
        const cacheKey = this.generateCacheKey(cleanText);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            // Génération de l'embedding avec le modèle
            const output = await this.model(cleanText, {
                pooling: 'mean', // Mean pooling pour obtenir un vecteur par phrase
                normalize: true   // Normalisation L2 pour la similarité cosinus
            });

            // Extraction du vecteur (première dimension)
            const embedding = Array.from(output.data);

            // Mise en cache
            this.cache.set(cacheKey, embedding);
            
            return embedding;
        } catch (error) {
            console.error('Erreur génération embedding:', error);
            return null;
        }
    }

    /**
     * Génération d'embeddings pour plusieurs textes (batch)
     * Plus efficace que les appels individuels
     */
    async getBatchEmbeddings(texts) {
        if (!Array.isArray(texts)) return [];

        const embeddings = [];
        
        // Traitement par batch de 10 pour optimiser la mémoire
        const batchSize = 10;
        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            const batchPromises = batch.map(text => this.getEmbedding(text));
            const batchResults = await Promise.all(batchPromises);
            embeddings.push(...batchResults);
        }

        return embeddings;
    }

    /**
     * Calcul de similarité cosinus entre deux vecteurs
     * Origine : Géométrie vectorielle, optimisé pour les embeddings normalisés
     * 
     * Formule : cos(θ) = (A · B) / (||A|| × ||B||)
     * Avec des vecteurs normalisés : cos(θ) = A · B
     */
    cosineSimilarity(vectorA, vectorB) {
        if (!vectorA || !vectorB || vectorA.length !== vectorB.length) {
            return 0;
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }

        // Éviter la division par zéro
        if (normA === 0 || normB === 0) return 0;

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Recherche des textes les plus similaires
     * Utilise la similarité cosinus pour classer les résultats
     */
    async findMostSimilar(queryText, candidateTexts, topK = 5) {
        const queryEmbedding = await this.getEmbedding(queryText);
        if (!queryEmbedding) return [];

        const candidateEmbeddings = await this.getBatchEmbeddings(candidateTexts);
        
        const similarities = candidateEmbeddings.map((embedding, index) => ({
            text: candidateTexts[index],
            similarity: this.cosineSimilarity(queryEmbedding, embedding),
            index
        }));

        // Tri par similarité décroissante
        similarities.sort((a, b) => b.similarity - a.similarity);

        return similarities.slice(0, topK);
    }

    /**
     * Génération de clé de cache basée sur le hash du texte
     */
    generateCacheKey(text) {
        return natural.SoundEx.process(text) + '_' + text.length;
    }

    /**
     * Chargement du cache depuis le disque
     */
    async loadCache() {
        try {
            const cacheData = await fs.readFile(this.cacheFile, 'utf8');
            const cacheObject = JSON.parse(cacheData);
            
            for (const [key, value] of Object.entries(cacheObject)) {
                this.cache.set(key, value);
            }
            
            console.log(`📁 Cache d'embeddings chargé: ${this.cache.size} entrées`);
        } catch (error) {
            console.log('📁 Nouveau cache d\'embeddings créé');
        }
    }

    /**
     * Sauvegarde du cache sur le disque
     */
    async saveCache() {
        try {
            const cacheObject = Object.fromEntries(this.cache);
            await fs.writeFile(this.cacheFile, JSON.stringify(cacheObject, null, 2));
            console.log(`💾 Cache d'embeddings sauvegardé: ${this.cache.size} entrées`);
        } catch (error) {
            console.error('Erreur sauvegarde cache:', error);
        }
    }

    /**
     * Nettoyage des ressources
     */
    async cleanup() {
        await this.saveCache();
        this.cache.clear();
        this.model = null;
        this.isInitialized = false;
    }

    /**
     * Statistiques du service
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            modelName: this.modelName,
            cacheSize: this.cache.size,
            embeddingDimensions: 384
        };
    }
}

module.exports = EmbeddingService;
