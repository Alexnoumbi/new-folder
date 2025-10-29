/**
 * Gestionnaire de fallback pour stockage vectoriel (sans FAISS)
 * Utilise une recherche linéaire simple pour la compatibilité
 */

const fs = require('fs').promises;
const path = require('path');

class VectorStoreFallback {
    constructor() {
        this.vectors = [];
        this.metadata = [];
        this.dimension = 384; // Dimension des embeddings Sentence Transformers
        this.dataPath = path.join(__dirname, '../data/vectors_fallback.json');
        this.isInitialized = false;
    }

    /**
     * Initialisation du store de fallback
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('🔄 Initialisation du store vectoriel (fallback)...');

            // Tentative de chargement des données existantes
            const loaded = await this.loadExistingData();
            
            if (!loaded) {
                // Initialisation avec des données vides
                this.vectors = [];
                this.metadata = [];
            }

            this.isInitialized = true;
            console.log(`✅ Store vectoriel (fallback) initialisé avec ${this.vectors.length} vecteurs`);
        } catch (error) {
            console.error('❌ Erreur initialisation store fallback:', error);
            // Initialisation avec des données vides en cas d'erreur
            this.vectors = [];
            this.metadata = [];
            this.isInitialized = true;
        }
    }

    /**
     * Chargement des données existantes depuis le disque
     */
    async loadExistingData() {
        try {
            const dataContent = await fs.readFile(this.dataPath, 'utf8');
            const data = JSON.parse(dataContent);
            
            this.vectors = data.vectors || [];
            this.metadata = data.metadata || [];

            console.log('📁 Données vectorielles existantes chargées');
            return true;
        } catch (error) {
            console.log('📁 Aucune donnée existante trouvée');
            return false;
        }
    }

    /**
     * Ajout de vecteurs avec leurs métadonnées
     */
    async addVectors(vectors, metadata) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (!vectors || !metadata || vectors.length !== metadata.length) {
            throw new Error('Vectors et metadata doivent avoir la même taille');
        }

        try {
            // Ajout des vecteurs et métadonnées
            this.vectors.push(...vectors);
            this.metadata.push(...metadata);

            console.log(`➕ ${vectors.length} vecteurs ajoutés au store (fallback)`);
        } catch (error) {
            console.error('Erreur ajout vecteurs (fallback):', error);
            throw error;
        }
    }

    /**
     * Recherche des vecteurs les plus similaires (recherche linéaire)
     */
    async search(queryVector, k = 5, threshold = 0.5) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (this.vectors.length === 0) {
            return [];
        }

        try {
            const results = [];

            // Recherche linéaire avec calcul de similarité cosinus
            for (let i = 0; i < this.vectors.length; i++) {
                const vector = this.vectors[i];
                const similarity = this.cosineSimilarity(queryVector, vector);

                if (similarity >= threshold) {
                    results.push({
                        similarity: similarity,
                        metadata: this.metadata[i],
                        index: i
                    });
                }
            }

            // Tri par similarité décroissante et limitation à k résultats
            return results
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, k);
        } catch (error) {
            console.error('Erreur recherche (fallback):', error);
            return [];
        }
    }

    /**
     * Recherche par métadonnées avec filtrage
     */
    async searchWithFilter(queryVector, k = 5, filter = {}) {
        const allResults = await this.search(queryVector, k * 3);

        return allResults.filter(result => {
            const metadata = result.metadata;
            
            for (const [key, value] of Object.entries(filter)) {
                if (metadata[key] !== value) {
                    return false;
                }
            }
            
            return true;
        }).slice(0, k);
    }

    /**
     * Calcul de similarité cosinus entre deux vecteurs
     */
    cosineSimilarity(a, b) {
        if (a.length !== b.length) {
            throw new Error('Les vecteurs doivent avoir la même dimension');
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Mise à jour d'un vecteur existant
     */
    async updateVector(index, newVector, newMetadata) {
        if (index < 0 || index >= this.metadata.length) {
            throw new Error('Index invalide');
        }

        if (newVector) {
            this.vectors[index] = newVector;
        }

        if (newMetadata) {
            this.metadata[index] = { ...this.metadata[index], ...newMetadata };
        }

        console.log(`🔄 Vecteur ${index} mis à jour`);
    }

    /**
     * Suppression d'un vecteur (marquer comme supprimé)
     */
    async removeVector(index) {
        if (index < 0 || index >= this.metadata.length) {
            throw new Error('Index invalide');
        }

        this.metadata[index].deleted = true;
        console.log(`🗑️ Vecteur ${index} marqué comme supprimé`);
    }

    /**
     * Reconstruction de l'index (nettoyage des suppressions)
     */
    async rebuildIndex() {
        console.log('🔄 Reconstruction du store (fallback)...');

        const activeVectors = [];
        const activeMetadata = [];

        for (let i = 0; i < this.metadata.length; i++) {
            if (!this.metadata[i].deleted) {
                activeVectors.push(this.vectors[i]);
                activeMetadata.push(this.metadata[i]);
            }
        }

        this.vectors = activeVectors;
        this.metadata = activeMetadata;

        console.log(`🧹 Reconstruction terminée: ${this.vectors.length} vecteurs actifs`);
    }

    /**
     * Sauvegarde des données sur le disque
     */
    async save() {
        if (!this.isInitialized) {
            return;
        }

        try {
            const data = {
                vectors: this.vectors,
                metadata: this.metadata,
                timestamp: Date.now()
            };

            await fs.writeFile(
                this.dataPath, 
                JSON.stringify(data, null, 2)
            );

            console.log('💾 Données vectorielles sauvegardées (fallback)');
        } catch (error) {
            console.error('Erreur sauvegarde (fallback):', error);
            throw error;
        }
    }

    /**
     * Nettoyage automatique périodique
     */
    async cleanup() {
        const deletedCount = this.metadata.filter(m => m.deleted).length;
        const totalCount = this.metadata.length;
        const deletedRatio = deletedCount / totalCount;

        if (deletedRatio > 0.2) {
            console.log(`🧹 Nettoyage automatique: ${deletedCount}/${totalCount} supprimés`);
            await this.rebuildIndex();
        }
    }

    /**
     * Statistiques du store
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            totalVectors: this.vectors.length,
            dimension: this.dimension,
            metadataCount: this.metadata.length,
            deletedCount: this.metadata.filter(m => m.deleted).length,
            indexType: 'LinearSearch'
        };
    }

    /**
     * Nettoyage des ressources
     */
    async destroy() {
        await this.save();
        this.vectors = [];
        this.metadata = [];
        this.isInitialized = false;
    }
}

module.exports = VectorStoreFallback;