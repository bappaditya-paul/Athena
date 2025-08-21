module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      'module:metro-react-native-babel-preset',
      '@babel/preset-typescript'
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@services': './src/services',
            '@utils': './src/utils',
            '@assets': './src/assets',
            '@types': './src/types',
            '@hooks': './src/hooks',
            '@contexts': './src/contexts',
            'react-native-paper': 'react-native-paper/src/index',
            'react-native-vector-icons': 'react-native-vector-icons',
            'expo-local-authentication': 'expo-local-authentication/build',
            'react-native-keychain': 'react-native-keychain',
          }
        }
      ],
      'react-native-reanimated/plugin'
  ],
};
}

