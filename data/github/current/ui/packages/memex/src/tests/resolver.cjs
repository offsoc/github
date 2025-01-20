/**
 * A custom jest resolver to avoid esm export issues
 * when parsing msw in jest-environment-jsdom
 */
module.exports = (path, options) => {
  // Call the defaultResolver, so we leverage its cache, error handling, etc.
  return options.defaultResolver(path, {
    ...options,
    packageFilter: pkg => {
      if (pkg.name === 'msw') {
        delete pkg.exports['./node'].browser
      }
      if (pkg.name === '@mswjs/interceptors') {
        delete pkg.exports
      }

      return pkg
    },
  })
}
