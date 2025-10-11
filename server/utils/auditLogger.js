const AuditLog = require('../models/AuditLog');

/**
 * Enregistre une action dans les logs d'audit
 * @param {Object} params - Paramètres du log
 * @param {Object} params.user - Utilisateur qui effectue l'action
 * @param {String} params.action - Type d'action (CREATE, UPDATE, DELETE, etc.)
 * @param {String} params.entityType - Type d'entité (USER, ENTERPRISE, etc.)
 * @param {String} params.entityId - ID de l'entité
 * @param {Object} params.changes - Changements effectués
 * @param {Object} params.details - Détails supplémentaires
 * @param {Object} params.req - Request object (pour extraire IP, user agent, etc.)
 * @param {String} params.status - Statut de l'action (success, error, warning)
 */
const logAudit = async (params) => {
  try {
    const {
      user,
      action,
      entityType,
      entityId,
      changes = {},
      details = {},
      req,
      status = 'success'
    } = params;

    const logData = {
      userId: user?._id || user?.id || null,
      userDetails: user ? {
        name: `${user.prenom || ''} ${user.nom || ''}`.trim() || user.email || 'Système',
        email: user.email || ''
      } : {
        name: 'Système',
        email: ''
      },
      action,
      entityType,
      entityId: entityId?.toString() || 'N/A',
      resourceType: entityType, // Pour compatibilité
      resourceId: entityId?.toString() || 'N/A',
      changes,
      details,
      status,
      timestamp: new Date()
    };

    // Ajouter informations de la requête si disponible
    if (req) {
      logData.ipAddress = req.ip || req.connection?.remoteAddress || 'Unknown';
      logData.userAgent = req.get('user-agent') || '';
      logData.method = req.method;
      logData.endpoint = req.originalUrl || req.url;
    }

    await AuditLog.create(logData);
    console.log(`✓ Audit log created: ${action} on ${entityType} by ${logData.userDetails.name}`);
  } catch (error) {
    // Ne pas bloquer l'exécution si le log échoue
    console.error('❌ Error creating audit log (non-critical):', error.message);
  }
};

/**
 * Middleware pour logger automatiquement les actions CRUD
 * À utiliser après les routes qui modifient des données
 */
const auditMiddleware = (action, entityType) => {
  return async (req, res, next) => {
    // Intercepter la réponse pour logger après succès
    const originalJson = res.json;
    
    res.json = function(data) {
      // Logger l'action
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAudit({
          user: req.user,
          action,
          entityType,
          entityId: data?._id || data?.id || req.params.id || 'N/A',
          details: {
            method: req.method,
            body: req.body,
            params: req.params
          },
          req,
          status: 'success'
        }).catch(err => console.error('Audit log error:', err));
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Logger les actions de connexion/déconnexion
 */
const logAuth = async (user, action, req, success = true) => {
  return logAudit({
    user,
    action,
    entityType: 'USER',
    entityId: user?._id || user?.id || 'N/A',
    details: {
      success,
      timestamp: new Date()
    },
    req,
    status: success ? 'success' : 'error'
  });
};

/**
 * Logger les exports de données
 */
const logExport = async (user, entityType, filters, req) => {
  return logAudit({
    user,
    action: 'EXPORT',
    entityType,
    entityId: 'BULK',
    details: {
      filters,
      exportedAt: new Date()
    },
    req,
    status: 'success'
  });
};

/**
 * Logger les erreurs
 */
const logError = async (user, action, entityType, entityId, error, req) => {
  return logAudit({
    user,
    action,
    entityType,
    entityId,
    details: {
      error: error.message,
      stack: error.stack
    },
    req,
    status: 'error'
  });
};

module.exports = {
  logAudit,
  auditMiddleware,
  logAuth,
  logExport,
  logError
};

