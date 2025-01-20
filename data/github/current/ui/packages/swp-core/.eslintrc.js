module.exports = {
  rules: {
    'primer-react/no-system-props': 'off', // this project uses @primer/react-brand instead of @primer/react
  },

  overrides: [
    {
      files: ['./schemas/contentful/contentTypes/*.ts'],

      rules: {
        'filenames/match-regex': 'off', // we name files following their content type "id" in Contentful
      },
    },
  ],
}
