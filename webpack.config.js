const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { version } = require('./package.json');

module.exports = {
  entry: './src/index.js',

  output: {
    filename: 'bundle.[name].js',
    path: path.resolve('./build')
  },

  plugins: [
    new CopyWebpackPlugin([
      {
        from: './src/manifest.json',
        to: './manifest.json',
        transform: content => {
          const manifest = JSON.parse(content.toString('utf8'));
          return Buffer.from(
            JSON.stringify(Object.assign({}, manifest, { version }), null, 2),
            'utf8'
          );
        }
      }
    ])
  ]
};
