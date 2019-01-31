// reference: https://cli.vuejs.org/config/#baseurl
module.exports = {
  /**
   * This app should be a multi-page because:
   *  - landing page ('thevinegar.com') should be SEO friendly
   *    (vue is not SEO friendly since it creates HTML/CSS after vue.js is loaded)
   */
  // pages: {
  //   index: {
  //     entry: 'src/main.js',
  //     template: 'public/app.html',
  //     filename: 'app.html',
  //   },
  // },
  devServer: {
    disableHostCheck: true,
  },
};
