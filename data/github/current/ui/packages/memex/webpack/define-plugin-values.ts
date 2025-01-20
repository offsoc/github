export const definePluginValues = {
  /**
   * Styled components has 2 output modes
   * 'speedy' and not. This explicitly enables
   * speedy mode for development, which helps provides
   * a consistent profiling base for style insertion, at the
   * expense of readability.
   *
   * `window.__memex.logStylesheet` is exposed to the client
   * as a means of logging the stylesheet to the console
   */
  SC_DISABLE_SPEEDY: 'false',
}
