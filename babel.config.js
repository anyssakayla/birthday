module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@database': './src/database',
            '@types': './src/types',
            '@utils': './src/utils',
            '@stores': './src/stores',
            '@services': './src/services'
          }
        }
      ]
    ]
  };
};