/**
 * Gestionnaire FAISS pour stockage vectoriel
 * Origine : Facebook AI Similarity Search (2017)
 * Fonctionnement : Index vectoriel optimisé pour la recherche de similarité
 */

const faiss = require('faiss-node');
const fs = require('fs').promises;
const path = require('path');

class VectorStore {
    constructor() {
        this.index = null;
        this.metadata = [];
        this.dimension = 384; // Dimension des embeddings Sentence Transformers
        this.indexPath = path.join(__dirname, '../data/faiss_index.bin');
        this.metadataPath = path.join(__dirname, '../data/faiss_metadata.json');
        this.isInitialized = false;
    }

    /**
     * Initialisation de l'index FAISS
     * 
     * FAISS (Facebook AI Similarity Search) :
     * - Développé par Facebook AI Research en 2017
     * - Optimisé pour la recherche de similarité sur de gros volumes
     * - Utilise des algorithmes d'approximation pour la vitesse
     * - Support GPU pour les très gros datasets
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('🔄 Initialisation de l\'index FAISS...');

            // Tentative de chargement d'un index existant
            const indexExists = await this.loadExistingIndex();
            
            if (!indexExists) {
                // Création d'un nouvel index
                await this.createNewIndex();
            }

            this.isInitialized = true;
            console.log(`✅ Index FAISS initialisé avec ${this.metadata.length} vecteurs`);
        } catch (error) {
            console.error('❌ Erreur initialisation FAISS:', error);
            throw new Error('Impossible d\'initialiser le store vectoriel');
        }
    }

    /**
     * Création d'un nouvel index FAISS
     * Utilise IndexFlatIP (Inner Product) pour une recherche exacte
     */
    async createNewIndex() {
        // IndexFlatIP : recherche exacte par produit scalaire
        // Optimal pour des datasets < 1M de vecteurs
        // Alternative : IndexIVFFlat pour de plus gros volumes
        this.index = new faiss.IndexFlatIP(this.dimension);
        this.metadata = [];
        
        console.log('🆕 Nouvel index FAISS créé');
    }

    /**
     * Chargement d'un index existant depuis le disque
     */
    async loadExistingIndex() {
        try {
            // Vérification de l'existence des fichiers
            await fs.access(this.indexPath);
            await fs.access(this.metadataPath);

            // Chargement de l'index FAISS
            this.index = faiss.read_index(this.indexPath);

            // Chargement des métadonnées
            const metadataContent = await fs.readFile(this.metadataPath, 'utf8');
            this.metadata = JSON.parse(metadataContent);

            console.log('📁 Index FAISS existant chargé');
            return true;
        } catch (error) {
            console.log('📁 Aucun index existant trouvé');
            return false;
        }
    }

    /**
     * Ajout de vecteurs à l'index avec leurs métadonnées
     * 
     * @param {Array} vectors - Tableau de vecteurs (embeddings)
     * @param {Array} metadata - Métadonnées correspondantes
     */
    async addVectors(vectors, metadata) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (!vectors || !metadata || vectors.length !== metadata.length) {
            throw new Error('Vectors et metadata doivent avoir la même taille');
        }

        try {
            // Conversion en Float32Array pour FAISS
            const vectorsFloat32 = vectors.map(vector => 
                new Float32Array(vector)
            );

            // Ajout à l'index FAISS
            this.index.add(vectorsFloat32);

            // Ajout des métadonnées
            this.metadata.push(...metadata);

            console.log(`➕ ${vectors.length} vecteurs ajoutés à l'index`);
        } catch (error) {
            console.error('Erreur ajout vecteurs:', error);
            throw error;
        }
    }

    /**
     * Recherche des vecteurs les plus similaires
     * 
     * @param {Array} queryVector - Vecteur de requête
     * @param {number} k - Nombre de résultats à retourner
     * @param {number} threshold - Seuil de similarité minimum
     */
    async search(queryVector, k = 5, threshold = 0.5) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (this.index.ntotal === 0) {
            return [];
        }

        try {
            // Conversion en Float32Array
            const queryFloat32 = new Float32Array(queryVector);

            // Recherche dans l'index FAISS
            const results = this.index.search(queryFloat32, k);

            // Formatage des résultats avec métadonnées
            const formattedResults = [];
            
            for (let i = 0; i < results.labels.length; i++) {
                const label = results.labels[i];
                const distance = results.distances[i];
                
                // Conversion distance en similarité (pour IndexFlatIP)
                const similarity = distance;

                if (similarity >= threshold && label >= 0 && label < this.metadata.length) {
                    formattedResults.push({
                        similarity: similarity,
                        metadata: this.metadata[label],
                        index: label
                    });
                }
            }

            return formattedResults.sort((a, b) => b.similarity - a.similarity);
        } catch (error) {
            console.error('Erreur recherche FAISS:', error);
            return [];
        }
    }

    /**
     * Recherche par métadonnées avec filtrage
     */
    async searchWithFilter(queryVector, k = 5, filter = {}) {
        const allResults = await this.search(queryVector, k * 3); // Chercher plus pour filtrer

        return allResults.filter(result => {
            const metadata = result.metadata;
            
            // Application des filtres
            for (const [key, value] of Object.entries(filter)) {
                if (metadata[key] !== value) {
                    return false;
                }
            }
            
            return true;
        }).slice(0, k);
    }

    /**
     * Mise à jour d'un vecteur existant
     */
    async updateVector(index, newVector, newMetadata) {
        if (index < 0 || index >= this.metadata.length) {
            throw new Error('Index invalide');
        }

        // FAISS ne supporte pas la mise à jour directe
        // Il faut reconstruire l'index pour les mises à jour
        console.warn('⚠️ Mise à jour nécessite une reconstruction de l\'index');
        
        // Mise à jour des métadonnées seulement
        if (newMetadata) {
            this.metadata[index] = { ...this.metadata[index], ...newMetadata };
        }
    }

    /**
     * Suppression d'un vecteur (marquer comme supprimé)
     */
    async removeVector(index) {
        if (index < 0 || index >= this.metadata.length) {
            throw new Error('Index invalide');
        }

        // Marquer comme supprimé dans les métadonnées
        this.metadata[index].deleted = true;
        
        console.log(`🗑️ Vecteur ${index} marqué comme supprimé`);
    }

    /**
     * Reconstruction de l'index (pour nettoyer les suppressions)
     */
    async rebuildIndex() {
        console.log('🔄 Reconstruction de l\'index FAISS...');

        const activeVectors = [];
        const activeMetadata = [];

        // Récupération des vecteurs non supprimés
        for (let i = 0; i < this.metadata.length; i++) {
            if (!this.metadata[i].deleted) {
                // Note: FAISS ne permet pas de récupérer les vecteurs facilement
                // Cette fonctionnalité nécessiterait de stocker les vecteurs séparément
                activeMetadata.push(this.metadata[i]);
            }
        }

        // Création d'un nouvel index
        await this.createNewIndex();
        
        // Réindexation (nécessite les vecteurs originaux)
        console.log('⚠️ Reconstruction complète nécessite les vecteurs originaux');
    }

    /**
     * Sauvegarde de l'index sur le disque
     */
    async save() {
        if (!this.isInitialized || !this.index) {
            return;
        }

        try {
            // Sauvegarde de l'index FAISS
            faiss.write_index(this.index, this.indexPath);

            // Sauvegarde des métadonnées
            await fs.writeFile(
                this.metadataPath, 
                JSON.stringify(this.metadata, null, 2)
            );

            console.log('💾 Index FAISS sauvegardé');
        } catch (error) {
            console.error('Erreur sauvegarde FAISS:', error);
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

        // Reconstruction si plus de 20% de suppressions
        if (deletedRatio > 0.2) {
            console.log(`🧹 Nettoyage automatique: ${deletedCount}/${totalCount} supprimés`);
            await this.rebuildIndex();
        }
    }

    /**
     * Statistiques de l'index
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            totalVectors: this.index ? this.index.ntotal : 0,
            dimension: this.dimension,
            metadataCount: this.metadata.length,
            deletedCount: this.metadata.filter(m => m.deleted).length,
            indexType: 'IndexFlatIP'
        };
    }

    /**
     * Nettoyage des ressources
     */
    async destroy() {
        await this.save();
        this.index = null;
        this.metadata = [];
        this.isInitialized = false;
    }
}

module.exports = VectorStore;
