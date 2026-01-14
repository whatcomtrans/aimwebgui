'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');

const fs = require('fs');
const chalk = require('chalk');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const paths = require('../config/paths');
const config = require('../config/webpack.config.dev');
const createDevServerConfig = require('../config/webpackDevServer.config');

// Tools like Cloud9 rely on this.
const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Warn if required files are missing
if (!fs.existsSync(paths.appHtml) || !fs.existsSync(paths.appIndexJs)) {
  console.log(chalk.red('Could not find required files.'));
  process.exit(1);
}

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const proxySetting = require(paths.appPackageJson).proxy;

// Create webpack compiler
const compiler = webpack(config);

// Create dev server config
const serverConfig = createDevServerConfig(proxySetting, HOST);

// Create and start dev server
const devServer = new WebpackDevServer(serverConfig, compiler);

console.log(chalk.cyan('Starting the development server...\n'));

devServer.start(PORT, HOST).then(() => {
  console.log(chalk.green(`Server started on ${protocol}://${HOST}:${PORT}\n`));
}).catch(err => {
  console.log(chalk.red('Failed to start server:'));
  console.log(err);
  process.exit(1);
});

['SIGINT', 'SIGTERM'].forEach(function(sig) {
  process.on(sig, function() {
    console.log(chalk.cyan('\nShutting down server...'));
    devServer.stop().then(() => process.exit());
  });
});
