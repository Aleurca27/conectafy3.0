import Docker from 'dockerode';

// Conexión a Docker
export const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});

// Configuración de WAHA
export const wahaConfig = {
  image: process.env.WAHA_IMAGE || 'devlikeapro/waha:latest',
  basePort: parseInt(process.env.WAHA_BASE_PORT) || 3010,
  maxSessions: parseInt(process.env.WAHA_MAX_SESSIONS) || 100,
  networkName: process.env.NETWORK_NAME || 'conectafy_network'
};

