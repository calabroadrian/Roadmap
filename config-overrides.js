const webpack = require('webpack');

module.exports = function override(config, env) {
  config.resolve.fallback = {
    "https": require.resolve("https-browserify"),
    "http": require.resolve("stream-http"),
    "buffer": require.resolve("buffer/"),
    "crypto": require.resolve("crypto-browserify"),
    "util": require.resolve("util/"),
    "path": require.resolve("path-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "stream": require.resolve("stream-browserify"),
    "zlib": require.resolve("browserify-zlib"),
    "child_process": false,
    "https-proxy-agent": require.resolve("https-proxy-agent"),
    "querystring": require.resolve("querystring-es3"),
    "process": require.resolve("process/browser.js")  // Agregamos la extensión .js
  };

  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser.js',  // Usamos la ruta con extensión
      Buffer: ['buffer', 'Buffer'],
    })
  );

  return config;
};
