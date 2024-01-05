import { dirname, join } from 'path';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';

module.exports = {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)'],

  addons: [
    getAbsolutePath('@storybook/addon-essentials'),
    {
      name: getAbsolutePath('@storybook/addon-styling-webpack'),
      options: {
        rules: [
          // Replaces any existing Sass rules with given rules
          {
            test: /\.s[ac]ss$/i,
            use: [
              'style-loader',
              'css-loader',
              {
                loader: 'sass-loader',
                options: { implementation: require.resolve('sass') },
              },
            ],
          },
        ],
      },
    },
  ],

  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {},
  },

  // https://storybook.js.org/docs/react/configure/typescript#mainjs-configuration
  typescript: {
    check: false, // type-check stories during Storybook build
    reactDocgen: 'react-docgen-typescript',
  },

  webpackFinal: async (config /* , { configType } */) => {
    // required to have access to packages by path @react-next-calendar/*
    config.resolve.plugins = [
      ...(config.resolve.plugins || []),
      new TsconfigPathsPlugin({
        extensions: config.resolve.extensions,
      }),
    ];

    // Return the altered config
    return config;
  },

  docs: {
    autodocs: true,
  },
};

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}
