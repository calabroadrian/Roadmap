const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
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
      "querystring": require.resolve('querystring-es3'),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      // Aquí puedes agregar middleware adicional si es necesario
      return middlewares;
    },
    port: 3000, // Asegúrate de que el puerto es correcto
    historyApiFallback: true, // Si usas React Router
  },
};
