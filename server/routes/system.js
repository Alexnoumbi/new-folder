const express = require('express');
const router = express.Router();
const os = require('os');
const process = require('process');

// Route pour obtenir les statistiques système
router.get('/info', async (req, res) => {
  try {
    const stats = {
      system: {
        cpu: await getCPUUsage(),
        memory: {
          total: Math.round(os.totalmem() / (1024 * 1024)),
          used: Math.round((os.totalmem() - os.freemem()) / (1024 * 1024)),
          free: Math.round(os.freemem() / (1024 * 1024))
        },
        disk: {
          total: 500000,
          used: 250000,
          free: 250000
        },
        osInfo: {
          platform: os.platform(),
          type: os.type(),
          release: os.release(),
          version: os.version(),
          architecture: os.arch()
        }
      },
      process: {
        uptime: Math.floor(process.uptime()),
        memory: process.memoryUsage()
      },
      requests: {
        total: 0,
        perMinute: 0,
        errors: 0
      },
      startTime: Date.now()
    };

    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des stats système:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération des statistiques système',
      error: error.message
    });
  }
});

// Fonction utilitaire pour calculer l'utilisation CPU
const getCPUUsage = () => {
  return new Promise((resolve) => {
    const startUsage = process.cpuUsage();
    const startTime = process.hrtime();

    setTimeout(() => {
      const endUsage = process.cpuUsage(startUsage);
      const endTime = process.hrtime(startTime);

      const userTime = endUsage.user / 1000000; // Convertir en millisecondes
      const systemTime = endUsage.system / 1000000;
      const elapsedTime = (endTime[0] * 1000) + (endTime[1] / 1000000);

      const cpuUsage = Math.round(((userTime + systemTime) / elapsedTime) * 100);
      resolve(cpuUsage);
    }, 100);
  });
};

module.exports = router;
