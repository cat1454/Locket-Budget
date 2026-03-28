const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Work around Windows child-process spawn failures by keeping Metro single-process.
config.maxWorkers = 1;

module.exports = config;
