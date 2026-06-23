import { LMSConfig } from './types.js';

export function loadConfig(): LMSConfig {
  const config: LMSConfig = {
    host: process.env.LMS_HOST || 'localhost',
    port: parseInt(process.env.LMS_PORT || '9000'),
    protocol: (process.env.LMS_PROTOCOL as 'http' | 'https') || 'http',
    timeout: parseInt(process.env.LMS_TIMEOUT || '10000'),
  };

  // Validate configuration
  if (config.port < 1 || config.port > 65535) {
    throw new Error('Invalid LMS_PORT: must be between 1 and 65535');
  }

  if (config.protocol !== 'http' && config.protocol !== 'https') {
    throw new Error('Invalid LMS_PROTOCOL: must be "http" or "https"');
  }

  if (config.timeout && (config.timeout < 1000 || config.timeout > 60000)) {
    throw new Error('Invalid LMS_TIMEOUT: must be between 1000 and 60000 milliseconds');
  }

  return config;
}

export function getDefaultConfig(): LMSConfig {
  return {
    host: 'localhost',
    port: 9000,
    protocol: 'http',
    timeout: 10000,
  };
}

