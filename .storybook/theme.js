import { create } from '@storybook/theming';

export default create({
  base: 'light',

  // UI
  appBg: 'white',

  // Typography
  fontBase: '"Open Sans", sans-serif',
  fontCode: 'monospace',

  // Text colors
  textColor: 'black',
  textInverseColor: 'rgba(255,255,255,0.9)',

  // Toolbar default and active colors
  barTextColor: 'white',
  barBg: 'rgb(49, 116, 173)',

  // Form colors
  inputBg: 'white',
  inputTextColor: 'black',
  inputBorderRadius: 4,

  brandTitle: 'React Next Calendar',
  brandUrl: 'https://github.com/newsiberian/react-next-calendar',
});
