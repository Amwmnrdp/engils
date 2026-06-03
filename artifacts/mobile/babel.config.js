module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          // Disable auto-detection of babel-plugin-react-compiler.
          // expo 54's babel-preset-expo enables it automatically when the
          // package is installed, which conflicts with reanimated transforms.
          reactCompiler: false,
        },
      ],
    ],
    // react-native-reanimated v4 with New Architecture (newArchEnabled:true)
    // no longer requires the Babel plugin — it was a source of Metro crashes.
    plugins: [],
  };
};
