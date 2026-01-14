"use strict";

const autoprefixer = require("autoprefixer");
const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
const paths = require("./paths");
const getClientEnvironment = require("./env");

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
const publicPath = paths.servedPath;
// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== "false";
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
const publicUrl = publicPath.slice(0, -1);
// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl);

// Assert this just to be safe.
// Development builds of React are slow and not intended for production.
if (env.stringified["process.env"].NODE_ENV !== '"production"') {
  throw new Error("Production builds must have NODE_ENV=production.");
}

// This is the production configuration.
// It compiles slowly and is focused on producing a fast and minimal bundle.
// The development configuration is different and lives in a separate file.
module.exports = {
  mode: "production",
  // Don't attempt to continue if there are any errors.
  bail: true,
  // We generate sourcemaps in production. This is slow but gives good results.
  // You can exclude the *.map files from the build during deployment.
  devtool: shouldUseSourceMap ? "source-map" : false,
  // In production, we only want to load the polyfills and the app code.
  entry: [require.resolve("./polyfills"), paths.appIndexJs],
  output: {
    // The build folder.
    path: paths.appBuild,
    // Generated JS file names (with nested folders).
    // There will be one main bundle, and one file per asynchronous chunk.
    // We don't currently advertise code splitting but Webpack supports it.
    filename: "static/js/[name].[chunkhash:8].js",
    chunkFilename: "static/js/[name].[chunkhash:8].chunk.js",
    // We inferred the "public path" (such as / or /my-project) from homepage.
    publicPath: publicPath,
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info =>
      path
        .relative(paths.appSrc, info.absoluteResourcePath)
        .replace(/\\/g, "/"),
  },
  resolve: {
    // This allows you to set a fallback for where Webpack should look for modules.
    // We placed these paths second because we want `node_modules` to "win"
    // if there are any conflicts. This matches Node resolution mechanism.
    // https://github.com/facebookincubator/create-react-app/issues/253
    modules: ["node_modules", paths.appNodeModules].concat(
      // It is guaranteed to exist because we tweak it in `env.js`
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
    ),
    // These are the reasonable defaults supported by the Node ecosystem.
    // We also include JSX as a common component filename extension to support
    // some tools, although we do not recommend using it, see:
    // https://github.com/facebookincubator/create-react-app/issues/290
    // `web` extension prefixes have been added for better support
    // for React Native Web.
    extensions: [".web.js", ".mjs", ".js", ".json", ".web.jsx", ".jsx"],
    alias: {
      // Support React Native Web
      // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
      "react-native": "react-native-web",
    },
    plugins: [
      // Prevents users from importing files from outside of src/ (or node_modules/).
      // This often causes confusion because we only process files within src/ with babel.
      // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
      // please link the files into your node_modules/ and let module-resolution kick in.
      // Make sure your source files are compiled, as they will not be processed in any way.
      new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
    ],
    // Webpack 5 fallbacks for node polyfills
    fallback: {
      dgram: false,
      fs: false,
      net: false,
      tls: false,
      child_process: false,
      url: require.resolve("url/"),
      querystring: require.resolve("querystring-es3"),
    },
  },
  module: {
    strictExportPresence: true,
    rules: [
      // TODO: Disable require.ensure as it's not a standard language feature.
      // We are waiting for https://github.com/facebookincubator/create-react-app/issues/2176.
      // { parser: { requireEnsure: false } },

      // Note: eslint-loader is deprecated in webpack 5. Use eslint-webpack-plugin instead.
      // For now, we've removed it to maintain compatibility with webpack 5.
      // You can add eslint-webpack-plugin separately if needed.

      {
        // "oneOf" will traverse all following loaders until one will
        // match the requirements. When no loader matches it will fall
        // back to the "file" loader at the end of the loader list.
        oneOf: [
          // "asset" in webpack 5 handles images automatically
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            type: "asset",
            parser: {
              dataUrlCondition: {
                maxSize: 10000,
              },
            },
            generator: {
              filename: "static/media/[name].[hash:8][ext]",
            },
          },
          // Process JS with Babel.
          {
            test: /\.(js|jsx|mjs)$/,
            include: paths.appSrc,
            loader: require.resolve("babel-loader"),
            options: {
              compact: true,
            },
          },
          // The notation here is somewhat confusing.
          // "postcss" loader applies autoprefixer to our CSS.
          // "css" loader resolves paths in CSS and adds assets as dependencies.
          // "style" loader normally turns CSS into JS modules injecting <style>,
          // but unlike in development configuration, we do something different.
          // `ExtractTextPlugin` first applies the "postcss" and "css" loaders
          // (second argument), then grabs the result CSS and puts it into a
          // separate file in our build process. This way we actually ship
          // a single CSS file in production instead of JS code injecting <style>
          // tags. If you use code splitting, however, any async bundles will still
          // use the "style" loader inside the async code so CSS from them won't be
          // in the main CSS file.
          {
            test: /\.(css|scss)$/,
            use: [
              require.resolve("style-loader"),
              {
                loader: require.resolve("css-loader"),
                options: {
                  importLoaders: 2,
                  sourceMap: shouldUseSourceMap,
                  modules: true,
                  localIdentName: "[name]__[local]__[hash:base64:5]",
                  camelCase: true,
                },
              },
              {
                loader: require.resolve("postcss-loader"),
                options: {
                  postcssOptions: {
                    plugins: [
                      require("postcss-flexbugs-fixes"),
                      autoprefixer({
                        overrideBrowserslist: [
                          ">1%",
                          "last 4 versions",
                          "Firefox ESR",
                          "not ie < 9",
                        ],
                        flexbox: "no-2009",
                      }),
                    ],
                  },
                },
              },
              require.resolve("sass-loader"),
            ],
          },
          // "asset/resource" in webpack 5 replaces file-loader
          {
            type: "asset/resource",
            // Exclude `js` files to keep "css" loader working as it injects
            // it's runtime that would otherwise processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpacks internal loaders.
            exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/, /\.(css|scss)$/],
            generator: {
              filename: "static/media/[name].[hash:8][ext]",
            },
          },
          // ** STOP ** Are you adding a new loader?
          // Make sure to add the new loader(s) before the "file" loader.
        ],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            warnings: false,
            comparisons: false,
          },
          mangle: {
            safari10: true,
          },
          output: {
            comments: false,
            ascii_only: true,
          },
        },
        extractComments: false,
      }),
    ],
  },
  plugins: [
    // Generates an `index.html` file with the <script> injected.
    // Note: InterpolateHtmlPlugin removed due to webpack 5 incompatibility
    // Environment variables are now passed via templateParameters
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      templateParameters: env.raw,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
    // It is absolutely essential that NODE_ENV was set to production here.
    // Otherwise React will be compiled in the very slow development mode.
    new webpack.DefinePlugin(env.stringified),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // You can remove this if you don't use Moment.js:
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
  ],
};
