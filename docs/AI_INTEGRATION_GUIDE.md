# Guide d'Intégration - Système d'IA Conversationnelle

## Vue d'Ensemble

Le système d'IA conversationnelle TrackImpact permet aux administrateurs et aux entreprises d'interagir avec des assistants IA intelligents pour obtenir de l'aide, des analyses de données et du support technique.

## Architecture

### Backend
- **Modèles**: `AIConversation`, `SubmissionRequest` (modifié)
- **Services**: `aiService.js`, `aiDatabaseQuery.js`, `aiKnowledgeBase.js`
- **Routes**: `/api/ai-chat/*`
- **Contrôleurs**: `aiChatController.js`

### Frontend
- **Types**: `aiChat.types.ts`
- **Services**: `aiChatService.ts`
- **Composants**: `AIChatModal`, `AIFloatingButton`, `MessageBubble`, `ConversationList`, `EscalationDialog`
- **Pages**: `AdminAIChats`, `EnterpriseAISupport`
- **Hooks**: `useAIChat.ts`

## Configuration

### Variables d'Environnement Backend

```env
# Configuration IA
AI_API_PROVIDER=huggingface
AI_API_KEY=your_api_key_here
AI_MODEL_NAME=meta-llama/Llama-2-70b-chat-hf
AI_MAX_TOKENS=1000
AI_TEMPERATURE=0.7
```

### Variables d'Environnement Frontend (optionnel)

```env
REACT_APP_AI_FEATURE_ENABLED=true
```

## Fonctionnalités

### Assistant IA Admin
- **Accès aux données**: Interrogation de la base de données MongoDB
- **Analyses en temps réel**: Statistiques et métriques
- **Requêtes sécurisées**: Validation et sanitization des requêtes
- **Cache intelligent**: Mise en cache des réponses fréquentes

### Assistant IA Entreprise
- **Support technique**: Aide pour l'utilisation de la plateforme
- **Base de connaissances**: FAQ et guides intégrés
- **Escalade automatique**: Transmission vers les administrateurs
- **Historique des conversations**: Suivi des interactions

## Utilisation

### Pour les Administrateurs

1. **Accès**: Bouton flottant sur le dashboard admin
2. **Questions possibles**:
   - "Combien d'entreprises sont actives ?"
   - "Quelles sont les statistiques des KPI ce mois ?"
   - "Montre-moi les dernières activités"

3. **Pages de gestion**: `/admin/ai-chats`
   - Vue d'ensemble de toutes les conversations
   - Statistiques et métriques
   - Gestion des escalades

### Pour les Entreprises

1. **Accès**: Bouton flottant sur le dashboard entreprise
2. **Questions possibles**:
   - "Comment créer un nouveau KPI ?"
   - "Comment soumettre un rapport ?"
   - "J'ai un problème technique"

3. **Pages de support**: `/enterprise/ai-support`
   - Historique des conversations
   - Statut des escalades
   - FAQ intégrée

## API Endpoints

### Messages
- `POST /api/ai-chat/admin/message` - Envoyer message admin
- `POST /api/ai-chat/enterprise/message` - Envoyer message entreprise

### Conversations
- `GET /api/ai-chat/conversations` - Lister les conversations
- `GET /api/ai-chat/conversations/:id` - Détails d'une conversation
- `DELETE /api/ai-chat/conversations/:id` - Supprimer une conversation

### Escalade
- `POST /api/ai-chat/enterprise/escalate` - Escalader vers admin

### Statistiques
- `GET /api/ai-chat/stats` - Statistiques IA (admin)
- `GET /api/ai-chat/health` - Statut de santé de l'IA

## Sécurité

### Rate Limiting
- **Admin**: 100 requêtes / 15 minutes
- **Entreprise**: 50 requêtes / 15 minutes
- **Escalade**: 3 escalades / heure

### Validation
- Messages limités à 2000 caractères
- Filtrage du contenu malveillant
- Requêtes DB en lecture seule pour l'IA

### Permissions
- Accès basé sur le type de compte
- Validation des tokens JWT
- Isolation des données par utilisateur

## Base de Connaissances

### Sources
- Documentation markdown (`docs/*.md`)
- FAQ statique intégrée
- Guides d'utilisation
- Cache intelligent des réponses

### Recherche
- Analyse sémantique des questions
- Scoring de pertinence
- Mise en cache des résultats
- Mise à jour automatique

## Monitoring et Logs

### Métriques
- Nombre total de conversations
- Taux d'escalade
- Temps de réponse moyen
- Questions fréquentes

### Logs
- Toutes les requêtes IA sont loggées
- Audit trail complet
- Détection d'anomalies
- Alertes automatiques

## Troubleshooting

### Problèmes Courants

1. **IA non configurée**
   - Vérifier `AI_API_KEY` dans `.env`
   - Tester avec `/api/ai-chat/health`

2. **Rate limiting**
   - Attendre la fin de la fenêtre de temps
   - Vérifier les logs pour les abus

3. **Erreurs de base de données**
   - Vérifier les permissions MongoDB
   - Contrôler les index de performance

4. **Problèmes de cache**
   - Nettoyer le cache localStorage
   - Redémarrer le serveur

### Logs de Debug

```bash
# Backend
npm run dev  # Logs détaillés

# Frontend
# Ouvrir DevTools > Console
```

## Optimisations

### Performance
- Cache Redis recommandé pour la production
- Pagination des conversations
- Lazy loading des composants
- Debouncing des requêtes

### Scalabilité
- Load balancing des requêtes IA
- Mise en cache distribué
- Monitoring des ressources
- Auto-scaling basé sur la charge

## Maintenance

### Tâches Régulières
- Nettoyage des conversations anciennes
- Mise à jour de la base de connaissances
- Monitoring des performances
- Sauvegarde des données critiques

### Mises à Jour
- Mise à jour des modèles IA
- Amélioration des prompts
- Ajout de nouvelles fonctionnalités
- Tests de régression

## Support

Pour toute question ou problème :
1. Consulter ce guide
2. Vérifier les logs
3. Contacter l'équipe technique
4. Créer un ticket de support

---

**Version**: 1.0.0  
**Dernière mise à jour**: Décembre 2024  
**Auteur**: Équipe TrackImpact
