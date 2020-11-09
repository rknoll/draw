const HtmlWebpackPlugin = require('html-webpack-plugin');

const CODE = `<script defer src="https://www.googletagmanager.com/gtag/js?id={{ID}}"></script>\
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}\
gtag('js',new Date());gtag('config','{{ID}}');</script>`;

class GoogleAnalyticsPlugin {
  constructor(id) {
    this.id = id;
  }

  apply(compiler) {
    if (!this.id) return;
    compiler.hooks.compilation.tap('ga', compilation => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tap('ga', ({ html }) => ({
        html: html.replace('</body>', CODE.replace(/{{ID}}/g, this.id) + '</body>')
      }));
    });
  }
}

module.exports = GoogleAnalyticsPlugin;
