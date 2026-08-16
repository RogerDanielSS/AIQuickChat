const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Habilita o Metro a resolver arquivos .sql (migrações do Drizzle).
config.resolver.sourceExts.push("sql"); // expo-sqlite usa wa-sqlite (.wasm) no suporte web (alpha).
config.resolver.assetExts.push("wasm");
module.exports = config;
