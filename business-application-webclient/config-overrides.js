const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
// const path = require('path');

// module.exports = {
//   entry: './index.js',
//   output: {
//     path: path.resolve(__dirname, 'dist'),
//     filename: 'app.js'
//   },
//   module: {
//     rules: [{
//       test: /\.css$/,
//       use: ['style-loader', 'css-loader']
//     }, {
//       test: /\.ttf$/,
//       use: ['file-loader']
//     }]
//   },
//   plugins: [
//     new MonacoWebpackPlugin()
//   ]
// };

module.exports = function override(config, env) {

  config.plugins.push(
    new MonacoWebpackPlugin()
  );

  return config;
};