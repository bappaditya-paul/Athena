const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add any custom configuration here
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

config.resolver = {
  ...config.resolver,
  assetExts: [...config.resolver.assetExts.filter(ext => ext !== 'svg'), 'bin', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'ttf', 'otf'],
  sourceExts: [...config.resolver.sourceExts, 'svg', 'jsx', 'js', 'ts', 'tsx', 'cjs', 'json'],
  extraNodeModules: new Proxy(
    {},
    {
      get: (target, name) => {
        return name in target ? target[name] : path.join(process.cwd(), `node_modules/${name}`);
      },
    }
  ),
};

module.exports = config;
