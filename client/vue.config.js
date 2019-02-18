const webpack = require('webpack');

module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        'window.Quill': 'quill/dist/quill.js',
        Quill: 'quill/dist/quill.js',
      }),
    ],
  },
  pages: {
    app: {
      entry: 'src/main.js',
      template: 'public/app.html',
      filename: './app/index.html',
    },
    index: {
      entry: 'src/landing/main.js',
      template: 'public/index.html',
      filename: 'index.html',
    },
  },
  devServer: {
    disableHostCheck: true,
    historyApiFallback: {
      rewrites: [{ from: /^\/app/, to: '/app/index.html' }],
    },
  },
};
