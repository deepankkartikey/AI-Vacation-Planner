const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force Metro to use polling instead of file watching to avoid EMFILE
config.server = {
  port: 8081,
  enhanceMiddleware: (middleware) => {
    return middleware;
  },
};

// Completely disable file system watching
config.watchFolders = [];
config.watcher = {
  watchman: false,
  healthCheck: {
    enabled: false,
  },
};

// Minimal resolver to reduce file operations
config.resolver = {
  ...config.resolver,
  platforms: ['ios', 'android', 'native', 'web'],
  resolveRequest: null,
};

// Disable all caching
config.resetCache = true;
config.cacheStores = [];

module.exports = config;