const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth').auth;
const KPI = require('../models/KPI');
const Entreprise = require('../models/Entreprise');
const mongoose = require('mongoose');

const kpiHistoryHandler = async (req, res) => {
  try {
    console.log('Fetching KPI history for enterprise:', req.params.entrepriseId);

    const entreprise = await Entreprise.findById(req.params.entrepriseId);
    if (!entreprise) {
      console.log('Enterprise not found:', req.params.entrepriseId);
      return res.status(404).json({ message: 'Entreprise non trouvée' });
    }

    // Ensure user has access to this enterprise
    if (req.user.typeCompte === 'entreprise' && req.user.entreprise.toString() !== req.params.entrepriseId) {
      console.log('Unauthorized access attempt:', req.user.email);
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Get KPI history for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Convert entreprise ID to ObjectId
    const entrepriseId = new mongoose.Types.ObjectId(req.params.entrepriseId);

    const kpiHistory = await KPI.aggregate([
      {
        $match: {
          entreprise: entrepriseId,
          date: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          averageScore: { $avg: "$score" }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: 1
            }
          },
          value: { $round: ["$averageScore", 2] }
        }
      }
    ]);

    console.log('KPI history fetched successfully:', kpiHistory);
    res.json(kpiHistory);
  } catch (error) {
    console.error('Error fetching KPI history:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération de l\'historique KPI',
      error: error.message
    });
  }
};

// Register the route with the handler function
router.get('/:entrepriseId/kpi-history', auth, kpiHistoryHandler);

module.exports = router;
