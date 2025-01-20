import { addons } from '@storybook/manager-api';
import primerTheme from './GitHubTheme';

addons.setConfig({
  // Some stories may set up keyboard event handlers, which can be interfered
  // with by these keyboard shortcuts.
  enableShortcuts: false,
  theme: primerTheme,
  sidebar: {
    showRoots: true,
    collapsedRoots: ["recipes","apps","utilities","templates","others"],
  },
});
