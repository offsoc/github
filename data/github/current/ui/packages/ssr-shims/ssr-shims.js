/* eslint no-undef: off */
// eslint-disable-next-line import/no-commonjs
module.exports = {
  ssrShimFileMap: {
    'delegated-events': require.resolve('./shims/delegated-events.ts'),
    dompurify: require.resolve('./shims/dompurify.ts'),
    'highlight.js': require.resolve('./shims/highlight.ts'),
    '@github/selector-observer': require.resolve('./shims/selector-observer.ts'),
    '@github/g-emoji-element': require.resolve('./shims/g-emoji-element.ts'),
    '@github/browser-support': require.resolve('./shims/browser-support.ts'),
    '@github/catalyst': require.resolve('./shims/catalyst.ts'),
    '@github-ui/jtml-shimmed': require.resolve('./shims/jtml.ts'),
    '@github-ui/microsoft-analytics': require.resolve('./shims/microsoft-analytics.ts'),
    '@oddbird/popover-polyfill/fn': require.resolve('./shims/popover-polyfill-fn.ts'),
    '@oddbird/popover-polyfill': require.resolve('./shims/popover-polyfill.ts'),
  },
}
