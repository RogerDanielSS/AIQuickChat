module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // Necessário para empacotar os arquivos .sql das migrações do Drizzle
    // como strings no bundle do app (ver https://orm.drizzle.team/docs/get-started/expo-new).
    plugins: [["inline-import", { extensions: [".sql"] }]],
  };
};
