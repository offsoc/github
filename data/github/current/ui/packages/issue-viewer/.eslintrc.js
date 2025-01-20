module.exports = {
  overrides: [
    {
      files: ['commands.json'],
      rules: {
        // Disable the rule since we have a couple of entries in
        // commands.json that are basic navigation overrides.
        // We override Enter and Escape in the context of an open issue title editor,
        // so we can display a confirmation alert.
        '@github-ui/ui-commands/accessible-default-keybindings': 'off',
      },
    },
  ],
  rules: {
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
}
