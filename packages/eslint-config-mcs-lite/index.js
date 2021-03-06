module.exports = {
  parser: 'babel-eslint',
  extends: [
    'airbnb',
    'plugin:flowtype/recommended',
    'plugin:jest/recommended',
    'prettier',
    'prettier/react',
    'prettier/flowtype',
  ],
  plugins: ['prettier', 'jest', 'flowtype'],
  env: {
    'jest/globals': true,
  },
  rules: {
    'react/jsx-filename-extension': [
      1,
      {
        extensions: ['.js'],
      },
    ],
    'import/no-extraneous-dependencies': 0,
    'jsx-a11y/no-static-element-interactions': 0, // <div onClick={() => {}} />
    'react/forbid-prop-types': 0,
    'react/require-default-props': 0,
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['to'],
        aspects: ['noHref', 'invalidHref', 'preferButton'],
      },
    ],
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/mouse-events-have-key-events': 0,

    // Prettier
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'all',
      },
    ],
  },
};
