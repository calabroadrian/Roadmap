const webpack = require('webpack');
const path = require('path');

module.exports = function override(config, env) {
  config.resolve = {
    ...config.resolve,
    fallback: {
      path: require.resolve('path-browserify'),
      fs: false,
      net: false,
      tls: false,
      child_process: false,
      querystring: require.resolve('querystring-es3'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      zlib: require.resolve('browserify-zlib'),
      'https-proxy-agent': require.resolve('https-proxy-agent'),
      vm: require.resolve('vm-browserify'), // Polyfill para 'vm'
      process: require.resolve('process/browser.js')  // Actualizado con extensión .js
    },
  };

  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser.js', // Actualizado con extensión .js
      Buffer: ['buffer', 'Buffer'],
    })
  );

  return config;
};
const webpack = require('webpack');
const path = require('path');

module.exports = function override(config, env) {
  config.resolve = {
    ...config.resolve,
    fallback: {
      path: require.resolve('path-browserify'),
      fs: false,
      net: false,
      tls: false,
      child_process: false,
      querystring: require.resolve('querystring-es3'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      zlib: require.resolve('browserify-zlib'),
      'https-proxy-agent': require.resolve('https-proxy-agent'),
      vm: require.resolve('vm-browserify'), // Polyfill para 'vm'
      process: require.resolve('process/browser.js')  // Actualizado con extensión .js
    },
  };

  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser.js', // Actualizado con extensión .js
      Buffer: ['buffer', 'Buffer'],
    })
  );

  return config;
};
