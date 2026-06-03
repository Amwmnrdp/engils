module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          // Disable auto-detection of babel-plugin-react-compiler.
          // expo 54's babel-preset-expo enables it automatically when the
          // package is installed, which conflicts with the reanimated/plugin
          // worklet transforms and causes the Metro bundle to fail in CI.
          reactCompiler: false,
        },
      ],
    ],
    plugins: ["react-native-reanimated/plugin"],
  };
};
