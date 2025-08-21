const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add path alias resolution
config.resolver.alias = {
  '@components': path.resolve(__dirname, 'src/components'),
  '@screens': path.resolve(__dirname, 'src/screens'),
  '@navigation': path.resolve(__dirname, 'src/navigation'),
  '@store': path.resolve(__dirname, 'src/store'),
  '@utils': path.resolve(__dirname, 'src/utils'),
  '@services': path.resolve(__dirname, 'src/services'),
  '@assets': path.resolve(__dirname, 'assets'),
  '@': path.resolve(__dirname, 'src'),
};

module.exports = config;