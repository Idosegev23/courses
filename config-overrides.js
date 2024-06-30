const webpack = require('webpack');

module.exports = function override(config) {
  config.resolve.fallback = {
    "os": require.resolve("os-browserify/browser"),
    "path": require.resolve("path-browserify"),
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "zlib": require.resolve("browserify-zlib"),
    "util": require.resolve("util/"),
    "assert": require.resolve("assert/"),
    "buffer": require.resolve("buffer/"),
    "https": require.resolve("https-browserify"),
    "http": require.resolve("stream-http"),
    "process": require.resolve("process/browser"),
    "vm": require.resolve("vm-browserify")  // Add this line
  };
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ]);
  return config;
};
