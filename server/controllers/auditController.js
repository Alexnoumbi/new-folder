const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res) => {
    try {
        const { searchTerm, startDate, endDate } = req.query;
        
        let query = {};
        
        if (searchTerm) {
            query = {
                $or: [
                    { action: { $regex: searchTerm, $options: 'i' } },
                    { resourceType: { $regex: searchTerm, $options: 'i' } },
                    { 'userDetails.name': { $regex: searchTerm, $options: 'i' } }
                ]
            };
        }

        if (startDate && endDate) {
            query.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .limit(100);

        res.json(logs);
    } catch (error) {
        console.error('Erreur lors de la récupération des logs d\'audit:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des logs d\'audit' });
    }
};

exports.getAuditLogDetails = async (req, res) => {
    try {
        const log = await AuditLog.findById(req.params.id);
        if (!log) {
            return res.status(404).json({ message: 'Log d\'audit non trouvé' });
        }
        res.json(log);
    } catch (error) {
        console.error('Erreur lors de la récupération du détail du log:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du détail du log' });
    }
};

exports.exportAuditLogs = async (req, res) => {
    try {
        const { searchTerm, startDate, endDate } = req.query;
        
        let query = {};
        
        if (searchTerm) {
            query = {
                $or: [
                    { action: { $regex: searchTerm, $options: 'i' } },
                    { resourceType: { $regex: searchTerm, $options: 'i' } },
                    { 'userDetails.name': { $regex: searchTerm, $options: 'i' } }
                ]
            };
        }

        if (startDate && endDate) {
            query.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 });

        // Convertir en CSV
        const csv = convertLogsToCSV(logs);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
        res.send(csv);
    } catch (error) {
        console.error('Erreur lors de l\'export des logs d\'audit:', error);
        res.status(500).json({ message: 'Erreur lors de l\'export des logs d\'audit' });
    }
};

function convertLogsToCSV(logs) {
    const headers = ['Date', 'Utilisateur', 'Action', 'Type', 'ID'];
    const rows = logs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.userDetails?.name || 'Système',
        log.action,
        log.resourceType || log.entityType || '',
        log.resourceId || log.entityId || ''
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}
