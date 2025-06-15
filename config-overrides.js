const webpack = require('webpack');

module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "assert": require.resolve("assert/"),
    "util": require.resolve("util/"),
    "buffer": require.resolve("buffer/"),
    "process": require.resolve("process/browser"),
    "os": require.resolve("os-browserify/browser"),
    "path": require.resolve("path-browserify"),
    "net": false,
    "tls": false,
    "fs": false,
    "zlib": false,
    "constants": false
  };

  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    })
  ];

  config.ignoreWarnings = [
    function ignoreSourcemapsLoaderWarnings(warning) {
      return (
        warning.module &&
        warning.module.resource.includes('node_modules') &&
        warning.details &&
        warning.details.includes('source-map-loader')
      );
    },
  ];

  return config;
}; 