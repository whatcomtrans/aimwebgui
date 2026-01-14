"use strict";

const ignoredFiles = require("react-dev-utils/ignoredFiles");
const paths = require("./paths");

const protocol = process.env.HTTPS === "true" ? "https" : "http";
const host = process.env.HOST || "0.0.0.0";

module.exports = function(proxy, allowedHost) {
  return {
    // Webpack-dev-server v5 configuration
    allowedHosts: allowedHost ? [allowedHost] : 'all',
    // Enable gzip compression of generated files.
    compress: true,
    // Serve static files from public folder
    static: {
      directory: paths.appPublic,
      publicPath: '/',
      watch: {
        ignored: ignoredFiles(paths.appSrc),
      },
    },
    // Enable hot reloading
    hot: true,
    // Enable HTTPS if the HTTPS environment variable is set to 'true'
    server: protocol === "https" ? "https" : "http",
    host: host,
    client: {
      overlay: false,
      logging: 'none',
    },
    historyApiFallback: {
      disableDotRule: true,
    },
    proxy,
    devMiddleware: {
      publicPath: '/',
    },
  };
};
