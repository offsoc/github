import { create } from '@storybook/theming/create';

export default create({
  base: 'light',
  fontBase: '-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
  fontCode: 'monospace',
  brandTitle: 'GitHub Theme',
  brandUrl: 'https://ui.githubapp.com/storybook/',
  brandImage: 'https://github.com/primer/design/assets/7265547/24ed9399-ec5a-4160-8f4f-1f11dc560b15',
  brandTarget: '_self',

  //
  colorPrimary: '#1F2328',
  colorSecondary: '#218BFF',

  // UI
  appBg: '#F6F8FA',
  appContentBg: '#ffffff',
  appBorderColor: '#D0D7DE',
  appBorderRadius: 0,

  // Text colors
  textColor: '#1F2328',
  textInverseColor: '#ffffff',

  // Toolbar default and active colors
  barTextColor: '#656D76',
  barSelectedColor: '#0969DA',
  barBg: '#ffffff',

  // Form colors
  inputBg: '#ffffff',
  inputBorder: '#1F2328',
  inputTextColor: '#1F2328',
  inputBorderRadius: 0,
});
