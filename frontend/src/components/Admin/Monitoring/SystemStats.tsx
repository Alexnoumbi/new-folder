import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { SystemStats as SystemStatsType } from '../../../services/monitoringService';

interface SystemStatsProps {
  stats: SystemStatsType | null;
}

const SystemStats: React.FC<SystemStatsProps> = ({ stats }) => {
  if (!stats) return null;

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round((bytes / Math.pow(1024, i))) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}j ${hours}h ${minutes}m`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        État du Système
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* CPU Usage */}
        <Box>
          <Typography variant="body2" color="textSecondary">
            CPU ({Math.round(stats.system.cpu)}%)
          </Typography>
          <Tooltip title={`${Math.round(stats.system.cpu)}% d'utilisation`}>
            <LinearProgress
              variant="determinate"
              value={stats.system.cpu}
              color={stats.system.cpu > 80 ? "error" : "primary"}
            />
          </Tooltip>
        </Box>

        {/* Memory Usage */}
        <Box>
          <Typography variant="body2" color="textSecondary">
            Mémoire ({formatBytes(stats.system.memory.used)} / {formatBytes(stats.system.memory.total)})
          </Typography>
          <Tooltip
            title={`${formatBytes(stats.system.memory.free)} disponible`}
          >
            <LinearProgress
              variant="determinate"
              value={(stats.system.memory.used / stats.system.memory.total) * 100}
              color={stats.system.memory.free < 1024 * 1024 * 1024 ? "error" : "primary"}
            />
          </Tooltip>
        </Box>

        {/* Disk Usage */}
        <Box>
          <Typography variant="body2" color="textSecondary">
            Disque ({formatBytes(stats.system.disk.used)} / {formatBytes(stats.system.disk.total)})
          </Typography>
          <Tooltip
            title={`${formatBytes(stats.system.disk.free)} disponible`}
          >
            <LinearProgress
              variant="determinate"
              value={(stats.system.disk.used / stats.system.disk.total) * 100}
              color={stats.system.disk.free < 1024 * 1024 * 1024 ? "error" : "primary"}
            />
          </Tooltip>
        </Box>

        {/* Performance Metrics */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Métriques de Performance
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Temps de réponse moyen
              </Typography>
              <Typography variant="body1">
                {(stats.requests.averageResponseTime || stats.database.responseTime || 0).toFixed(2)}ms
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Requêtes par minute
              </Typography>
              <Typography variant="body1">
                {stats.requests.perMinute}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* System Uptime */}
        <Box>
          <Typography variant="body2" color="textSecondary">
            Temps de fonctionnement
          </Typography>
          <Typography variant="body1">
            {formatUptime(stats.uptime || stats.process.uptime || 0)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SystemStats;
