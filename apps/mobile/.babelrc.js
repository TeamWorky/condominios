module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.ts', '.tsx', '.json'],
          alias: {
            // Mirror the @condominios/shared path alias from tsconfig.base.json
            '@condominios/shared': '../../libs/shared/src',
          },
        },
      ],
    ],
  };
};
