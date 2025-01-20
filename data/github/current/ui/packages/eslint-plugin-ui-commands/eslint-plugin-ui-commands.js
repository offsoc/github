module.exports = {
  rules: {
    'accessible-default-keybindings': require('./rules/accessible-default-keybindings'),
    'require-mod': require('./rules/require-mod'),
    'valid-key-names': require('./rules/valid-key-names'),
    'valid-hotkey-syntax': require('./rules/valid-hotkey-syntax'),
    'valid-ids': require('./rules/valid-ids'),
    'no-manual-shortcut-logic': require('./rules/no-manual-shortcut-logic'),
    'compile-command-types': require('./rules/compile-command-types'),
  },
  configs: {
    recommended: {
      rules: {
        '@github-ui/ui-commands/no-manual-shortcut-logic': 'error',
        '@github-ui/ui-commands/compile-command-types': 'warn',
      },
      // the commands.json rules also check the path internally, but it's faster to not run them at all on other files
      overrides: [
        {
          files: ['**/commands.json'],
          parserOptions: {
            project: null,
          },
          rules: {
            '@github-ui/ui-commands/accessible-default-keybindings': 'error',
            '@github-ui/ui-commands/require-mod': 'error',
            '@github-ui/ui-commands/valid-key-names': 'error',
            '@github-ui/ui-commands/valid-hotkey-syntax': 'error',
            '@github-ui/ui-commands/valid-ids': 'error',
          },
        },
      ],
    },
  },
}
