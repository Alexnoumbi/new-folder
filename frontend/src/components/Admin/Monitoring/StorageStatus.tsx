import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Storage as StorageIcon,
  Backup as BackupIcon,
  CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material';
import { StorageStats, BackupStatus } from '../../../services/monitoringService';

interface StorageStatusProps {
  storageStats: StorageStats | null;
  backupStatus: BackupStatus | null;
}

const StorageStatus: React.FC<StorageStatusProps> = ({ storageStats, backupStatus }) => {
  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round((bytes / Math.pow(1024, i))) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Stockage et Sauvegardes
      </Typography>

      {/* Stockage */}
      {storageStats && (
        <Box mb={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <StorageIcon color="primary" sx={{ fontSize: 40 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Espace de stockage utilisé
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {formatBytes(storageStats.totalSize)} • {storageStats.fileCount} fichiers
              </Typography>
              <Tooltip title={`${formatBytes(storageStats.totalSize)} utilisés`}>
                <LinearProgress
                  variant="determinate"
                  value={70} // À remplacer par le calcul réel du pourcentage
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Tooltip>
            </Box>
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Sauvegardes */}
      {backupStatus && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Dernières sauvegardes
          </Typography>

          {backupStatus.lastBackup ? (
            <>
              <Box mb={2}>
                <Typography variant="body2" color="success.main">
                  Dernière sauvegarde : {formatDate(backupStatus.lastBackup.createdAt)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Taille : {formatBytes(backupStatus.lastBackup.size)}
                </Typography>
              </Box>

              <List dense>
                {backupStatus.backups.slice(0, 5).map((backup) => (
                  <ListItem
                    key={backup.filename}
                    secondaryAction={
                      <Tooltip title="Télécharger">
                        <IconButton edge="end" size="small">
                          <CloudDownloadIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemText
                      primary={backup.filename}
                      secondary={`${formatBytes(backup.size)} • ${formatDate(backup.createdAt)}`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          ) : (
            <Typography variant="body2" color="error">
              Aucune sauvegarde trouvée
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default StorageStatus;
