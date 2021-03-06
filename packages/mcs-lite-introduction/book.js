/* eslint no-console: 0 */
const pkg = require('./package.json');

const GITHUB_ORG = 'https://github.com/MCS-Lite';
const GITHUB_DIR = `${GITHUB_ORG}/mcs-lite/tree/master/packages/mcs-lite-introduction`;
const NETLIFY_URL = 'https://mcs-lite-introduction.netlify.com/';
const { GA_ID } = process.env;

const plugins = [
  'edit-link',
  'prism',
  '-highlight',
  'github',
  'anchorjs',
  'sitemap-general',
];

if (GA_ID) {
  // prettier-ignore
  console.info(`[Book.js]: the 'gitbook-plugin-ga' has been loaded with GA_ID: ${GA_ID}.`);
  plugins.push('ga');
}

module.exports = {
  title: 'MCS Lite',
  links: {
    sidebar: {
      'MCS Lite GitHub': GITHUB_ORG,
    },
  },

  plugins,

  variables: {
    version: pkg.version,
  },

  pluginsConfig: {
    'edit-link': {
      base: GITHUB_DIR,
      label: {
        en: 'Edit This Page',
        'zh-tw': '編輯本頁',
        'zh-cn': '编辑本页',
      },
    },
    prism: {
      lang: {
        arduino: 'clike',
      },
    },
    github: {
      url: GITHUB_DIR,
    },
    'theme-default': {
      styles: {
        website: 'build/gitbook.css',
      },
    },
    ga: {
      token: GA_ID || '',
    },
    'sitemap-general': {
      prefix: NETLIFY_URL,
    },
  },
};
