module.exports = {
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
      rewrites: [
        { from: /^\/app/, to: '/app/index.html' },
      ],
    },
  },
};
