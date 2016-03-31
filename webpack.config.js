var path = require('path');

module.exports = {
  context: __dirname + '/js',
  entry: './app.js',
  output: {
    path: __dirname + '/www/js',
    filename: 'app.js',
  },
  resolve: {
    root: [
      path.resolve('./js')
    ]
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015'],
          plugins: [
            'transform-async-functions',
            'transform-regenerator'
          ],
        },
      },
    ],
  },
};
