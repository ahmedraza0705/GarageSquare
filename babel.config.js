module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      // 'expo-router/babel', // Removed - deprecated in SDK 50+, use babel-preset-expo instead
      'react-native-reanimated/plugin', // Must be last plugin
    ],
  };
};

