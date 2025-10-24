const axios = require('axios');

class AIService {
  constructor() {
    // Forcer l'utilisation exclusive d'Open WebUI
    this.apiProvider = 'openwebui';
    this.apiKey = process.env.AI_API_KEY;
    this.ollamaBaseUrl = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '');
    this.ollamaApiKey = process.env.OLLAMA_API_KEY || process.env.AI_API_KEY; // autoriser AI_API_KEY comme fallback
    this.openwebuiBaseUrl = (process.env.OPENWEBUI_BASE_URL || 'https://your-openwebui-domain.com').replace(/\/$/, '');
    this.openwebuiApiKey = process.env.OPENWEBUI_API_KEY || process.env.AI_API_KEY; // clé optionnelle
    const useCloudDefault = String(process.env.OLLAMA_USE_CLOUD_DEFAULT || '').toLowerCase() === 'true';
    const configuredModel = process.env.AI_MODEL_NAME || (
      this.apiProvider === 'ollama' ? (useCloudDefault ? 'gpt-oss:120b-cloud' : 'llama3.1') :
      this.apiProvider === 'openwebui' ? 'impact' :
      'meta-llama/Llama-2-70b-chat-hf'
    );
    this.modelName = this.normalizeModelName(configuredModel);
    this.maxTokens = parseInt(process.env.AI_MAX_TOKENS) || 1000;
    this.temperature = parseFloat(process.env.AI_TEMPERATURE) || 0.7;

    // Pour Ollama, aucune clé API n'est requise
    if (this.apiProvider !== 'ollama' && this.apiProvider !== 'openwebui' && !this.apiKey) {
      console.warn('⚠️ AI_API_KEY non configuré - Les fonctionnalités IA cloud seront désactivées');
    }
  }

  async generateResponse(messages, context = {}, role = 'admin') {
    // Pas d'exigence de clé API pour Ollama ou Open WebUI
    if (this.apiProvider !== 'ollama' && this.apiProvider !== 'openwebui' && !this.apiKey) {
      return this.getFallbackResponse(role);
    }

    try {
      const systemPrompt = this.getSystemPrompt(role, context);
      const formattedMessages = this.formatMessages(systemPrompt, messages);
      
      const response = await this.callAIAPI(formattedMessages);
      return response;
    } catch (error) {
      console.error('Erreur lors de la génération de réponse IA:', error);
      return this.getFallbackResponse(role);
    }
  }

  async generateAdminResponse(messages, dbContext = {}) {
    const context = {
      role: 'admin',
      hasDatabaseAccess: true,
      dbContext
    };
    return this.generateResponse(messages, context, 'admin');
  }

  async generateEnterpriseResponse(messages, userContext = {}) {
    const context = {
      role: 'entreprise',
      hasDatabaseAccess: false,
      userContext
    };
    return this.generateResponse(messages, context, 'entreprise');
  }

  getSystemPrompt(role, context) {
    // Prompt spécifique pour le modèle Impact d'Open WebUI
    if (this.apiProvider === 'openwebui' && (this.modelName || '').toLowerCase() === 'impact') {
      return 'Tu es un assistant qui va recevoir des informations d\'une base de donnees et utiliser cela pour repondre aux questions des utilisateur dans un autre cas qui sera specifier dans celui-ci tu devra repondre aux preocupations des utilisateur en fonction de la base de connaissance qui te sera transmis';
    }

    if (role === 'admin') {
      return `Vous êtes un assistant IA spécialisé pour les administrateurs de la plateforme TrackImpact. 
      
Votre rôle :
- Répondre aux questions sur les données de la plateforme
- Fournir des analyses et insights basés sur la base de données
- Aider à interpréter les métriques et KPI
- Suggérer des actions basées sur les données

Contexte disponible : ${JSON.stringify(context.dbContext || {})}

Instructions :
- Utilisez les données fournies pour donner des réponses précises
- Formatez les nombres et pourcentages de manière claire
- Proposez des actions concrètes quand approprié
- Soyez professionnel et technique mais accessible
- Si vous ne pouvez pas répondre avec certitude, indiquez-le clairement`;
    } else {
      return `Vous êtes un assistant de support pour les entreprises utilisant la plateforme TrackImpact.

Votre rôle :
- Aider les entreprises avec leurs questions sur la plateforme
- Expliquer les fonctionnalités et processus
- Guider dans l'utilisation des outils
- Si vous ne pouvez pas résoudre un problème, suggérer l'escalade vers un administrateur

Contexte utilisateur : ${JSON.stringify(context.userContext || {})}

Instructions :
- Soyez empathique et patient
- Expliquez les étapes de manière claire
- Utilisez un langage accessible
- Si le problème nécessite une intervention humaine, proposez l'escalade
- Restez professionnel mais amical`;
    }
  }

  formatMessages(systemPrompt, messages) {
    const formatted = [
      { role: 'system', content: systemPrompt }
    ];

    messages.forEach(msg => {
      formatted.push({
        role: msg.role,
        content: msg.content
      });
    });

    return formatted;
  }

  async callAIAPI(messages) {
    switch (this.apiProvider.toLowerCase()) {
      case 'huggingface':
        return this.callHuggingFaceAPI(messages);
      case 'openai':
        return this.callOpenAIAPI(messages);
      case 'anthropic':
        return this.callAnthropicAPI(messages);
      case 'ollama':
        return this.callOllamaAPI(messages);
      case 'openwebui':
        return this.callOpenWebUIAPI(messages);
      default:
        throw new Error(`Provider IA non supporté: ${this.apiProvider}`);
    }
  }

  async callHuggingFaceAPI(messages) {
    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${this.modelName}`,
        {
          inputs: messages.map(m => m.content).join('\n\n'),
          parameters: {
            max_new_tokens: this.maxTokens,
            temperature: this.temperature,
            return_full_text: false
          },
          options: { wait_for_model: true }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.data && response.data[0] && response.data[0].generated_text) {
        return response.data[0].generated_text.trim();
      }
      
      throw new Error('Réponse IA invalide');
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 404) {
        console.warn(`⚠️ Modèle Hugging Face introuvable: "${this.modelName}" (404). Tentative avec modèles de repli.`);

        const fallbackModels = this.getFallbackModels();
        for (const candidate of fallbackModels) {
          if (candidate === this.modelName) continue;
          try {
            console.warn(`↪️ Essai modèle de repli: ${candidate}`);
            this.modelName = candidate;
            return await this.callHuggingFaceAPI(messages);
          } catch (e) {
            if (e.response?.status === 404) {
              console.warn(`❌ Repli introuvable: ${candidate} (404)`);
              continue;
            }
            // autre erreur -> relancer
            throw e;
          }
        }
        throw new Error('Aucun modèle Hugging Face valide trouvé (404 sur tous les modèles testés).');
      }
      console.error('Erreur Hugging Face:', { status, data });
      throw err;
    }
  }

  async callOpenAIAPI(messages) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: this.modelName,
        messages: messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (response.data && response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content.trim();
    }
    
    throw new Error('Réponse OpenAI invalide');
  }

  async callAnthropicAPI(messages) {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: this.modelName,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages: messages.filter(m => m.role !== 'system')
      },
      {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        timeout: 30000
      }
    );

    if (response.data && response.data.content && response.data.content[0]) {
      return response.data.content[0].text.trim();
    }
    
    throw new Error('Réponse Anthropic invalide');
  }

  async callOllamaAPI(messages) {
    // Par défaut, Ollama écoute sur http://localhost:11434
    // API: POST /api/chat { model, messages: [{role, content}], stream }
    const url = `${this.ollamaBaseUrl}/api/chat`;

    const payload = {
      model: this.modelName,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: false,
      options: {
        temperature: this.temperature,
        num_predict: this.maxTokens
      }
    };

    const headers = {};
    if (this.ollamaApiKey) {
      headers['Authorization'] = `Bearer ${this.ollamaApiKey}`;
    }

    const timeoutMs = parseInt(process.env.OLLAMA_TIMEOUT_MS || '') || 30000;

    const response = await axios.post(url, payload, { timeout: timeoutMs, headers });

    // Réponse attendue: { message: { role, content }, done: true, ... }
    const content = response.data?.message?.content || response.data?.content;
    if (content && typeof content === 'string') {
      return content.trim();
    }
    throw new Error('Réponse Ollama invalide');
  }

  async callOpenWebUIAPI(messages) {
    // Open WebUI expose une API compatible OpenAI: POST /v1/chat/completions
    const url = `${this.openwebuiBaseUrl}/v1/chat/completions`;

    console.log(`🔗 Tentative d'appel Open WebUI: ${url}`);
    console.log(`📝 Modèle utilisé: ${this.modelName || 'impact'}`);

    const payload = {
      model: this.modelName || 'impact',
      messages,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      stream: false
    };

    const headers = { 'Content-Type': 'application/json' };
    if (this.openwebuiApiKey) {
      headers['Authorization'] = `Bearer ${this.openwebuiApiKey}`;
    }

    const timeoutMs = parseInt(process.env.OPENWEBUI_TIMEOUT_MS || '') || 30000;
    
    try {
      const response = await axios.post(url, payload, { timeout: timeoutMs, headers });
      console.log(`✅ Réponse Open WebUI reçue: ${response.status}`);
      
      // Réponse compatible OpenAI
      const content = response.data?.choices?.[0]?.message?.content;
      if (content && typeof content === 'string') {
        return content.trim();
      }
      throw new Error('Réponse Open WebUI invalide');
    } catch (error) {
      console.error(`❌ Erreur Open WebUI (${url}):`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Si 404, vérifier si Open WebUI est démarré
      if (error.response?.status === 404) {
        console.error(`🚨 Open WebUI semble ne pas être démarré sur ${this.openwebuiBaseUrl}`);
        console.error(`💡 Vérifiez que Open WebUI est en cours d'exécution et accessible`);
      }
      
      throw error;
    }
  }

  async streamOpenWebUI(messages, onDelta) {
    const url = `${this.openwebuiBaseUrl}/v1/chat/completions`;

    const payload = {
      model: this.modelName || 'impact',
      messages,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      stream: true
    };

    const headers = { 'Content-Type': 'application/json' };
    if (this.openwebuiApiKey) {
      headers['Authorization'] = `Bearer ${this.openwebuiApiKey}`;
    }

    const timeoutMs = parseInt(process.env.OPENWEBUI_TIMEOUT_MS || '') || 60000;

    const response = await axios.post(url, payload, {
      responseType: 'stream',
      timeout: timeoutMs,
      headers
    });

    return await new Promise((resolve, reject) => {
      let fullText = '';
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.slice(5).trim();
            if (dataStr === '[DONE]') {
              return; // fin de ce bloc
            }
            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed?.choices?.[0]?.delta?.content || '';
              if (delta) {
                fullText += delta;
                if (typeof onDelta === 'function') onDelta(delta);
              }
            } catch (e) {
              // ignorer les lignes non JSON
            }
          }
        }
      });
      response.data.on('end', () => resolve(fullText.trim()));
      response.data.on('error', reject);
    });
  }

  // Normalise/valide le nom du modèle selon le provider
  normalizeModelName(modelName) {
    if (!modelName || typeof modelName !== 'string') {
      return this.apiProvider === 'ollama' ? 'llama3.1' : 'meta-llama/Llama-2-70b-chat-hf';
    }

    const trimmed = modelName.trim();

    if (this.apiProvider === 'ollama') {
      // Pour Ollama on renvoie tel quel, avec quelques alias pratiques
      const ollamaAliases = {
        'llama3': 'llama3.1',
        'llama-3': 'llama3.1',
        'llama3.1': 'llama3.1',
        'llama-3.1': 'llama3.1',
        'llama3.2': 'llama3.1',
        'qwen2.5': 'qwen2.5:7b',
        'phi3': 'phi3:3.8b'
      };
      return ollamaAliases[trimmed.toLowerCase()] || trimmed;
    }

    if (this.apiProvider === 'openwebui') {
      // Open WebUI accepte les ids simples (ex: impact)
      return trimmed;
    }

    // Si l'utilisateur a mis des alias courts connus (HuggingFace), mappez-les
    const aliases = {
      'llama2': 'meta-llama/Llama-2-70b-chat-hf',
      'llama-2': 'meta-llama/Llama-2-70b-chat-hf',
      'llama3': 'meta-llama/Meta-Llama-3-8B-Instruct',
      'llama-3': 'meta-llama/Meta-Llama-3-8B-Instruct',
      'llama3.1': 'meta-llama/Meta-Llama-3.1-8B-Instruct',
      'llama-3.1': 'meta-llama/Meta-Llama-3.1-8B-Instruct',
      'llama3.2': 'meta-llama/Meta-Llama-3.1-8B-Instruct'
    };

    if (aliases[trimmed.toLowerCase()]) {
      return aliases[trimmed.toLowerCase()];
    }

    // Les modèles HF valides contiennent en général un slash owner/model
    if (!trimmed.includes('/')) {
      console.warn(`⚠️ AI_MODEL_NAME invalide: "${trimmed}". Utilisation du modèle par défaut.`);
      return 'meta-llama/Llama-2-70b-chat-hf';
    }

    return trimmed;
  }

  getFallbackModels() {
    // Autoriser override via env (séparées par des virgules)
    if (process.env.AI_FALLBACK_MODELS) {
      return process.env.AI_FALLBACK_MODELS
        .split(',')
        .map(m => m.trim())
        .filter(Boolean);
    }

    // Liste de modèles publics courants (non-gated) susceptibles de fonctionner
    return [
      'HuggingFaceH4/zephyr-7b-beta',
      'bigscience/bloomz-7b1',
      'tiiuae/falcon-7b-instruct',
      'google/gemma-2b-it'
    ];
  }

  getFallbackResponse(role) {
    if (role === 'admin') {
      return `Je suis temporairement indisponible. Voici quelques informations générales :

📊 **Statistiques rapides** :
- Consultez le tableau de bord pour les métriques en temps réel
- Utilisez les filtres pour analyser des périodes spécifiques
- Les exports sont disponibles dans la section rapports

🛠️ **Actions recommandées** :
- Vérifiez les alertes dans le dashboard
- Consultez les logs d'audit pour les activités récentes
- Contactez l'équipe technique si vous avez besoin d'aide spécifique`;
    } else {
      return `Je suis temporairement indisponible, mais je peux vous aider avec ces ressources :

📚 **Aide rapide** :
- Consultez le guide utilisateur dans la section documentation
- Vérifiez vos KPI dans le tableau de bord entreprise
- Utilisez le calendrier pour voir vos visites planifiées

🆘 **Besoin d'aide ?** :
- Si votre problème est urgent, utilisez l'option "Escalader vers un administrateur"
- Les administrateurs vous répondront dans les plus brefs délais
- Vous pouvez aussi consulter la FAQ dans votre profil`;
    }
  }

  // Validation et nettoyage des messages
  validateMessage(message) {
    if (!message || typeof message !== 'string') {
      throw new Error('Message invalide');
    }
    
    if (message.length > 2000) {
      throw new Error('Message trop long (max 2000 caractères)');
    }
    
    return message.trim();
  }

  // Analyse de l'intention pour optimiser les réponses
  analyzeIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('statistique') || lowerMessage.includes('métrique')) {
      return 'analytics';
    }
    if (lowerMessage.includes('problème') || lowerMessage.includes('erreur')) {
      return 'support';
    }
    if (lowerMessage.includes('comment') || lowerMessage.includes('aide')) {
      return 'help';
    }
    if (lowerMessage.includes('rapport') || lowerMessage.includes('export')) {
      return 'report';
    }
    
    return 'general';
  }
}

module.exports = new AIService();
