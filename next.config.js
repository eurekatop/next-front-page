const { i18n } = require('./next-i18next.config')

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/
})

module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  i18n,
  env: {
    BASE_CONTENT_DIR: process.env.BASE_CONTENT_DIR,
  },
  webpack(config, { isServer }) {
    //if (!isServer) {
      config.optimization.minimize = true;
    //}
    return config;
  }
})
