module.exports = {
  rules: {
    'package-json-required-scripts': require('./rules/package-json-required-scripts'),
    'package-json-required-fields': require('./rules/package-json-required-fields'),
    'package-json-ordered-fields': require('./rules/package-json-ordered-fields'),
    'package-json-version-numbers': require('./rules/package-json-version-numbers'),
    'package-json-valid-exports': require('./rules/package-json-valid-exports'),
    'required-configuration-files': require('./rules/required-configuration-files'),
    'package-json-required-dev-dependencies': require('./rules/package-json-required-dev-dependencies'),
    'restrict-package-deep-imports': require('./rules/restrict-package-deep-imports'),
    'package-json-versions-in-sync': require('./rules/package-json-versions-in-sync'),
    'test-file-names': require('./rules/test-file-names'),
    'react-partial-name': require('./rules/react-partial-name'),
    'no-sx': require('./rules/no-sx'),
  },
  configs: {
    'package-json': require('./configs/package-json'),
    test: require('./configs/test'),
    react: require('./configs/react'),
  },
}
