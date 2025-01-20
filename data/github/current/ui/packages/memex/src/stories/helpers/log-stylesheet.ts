export function logStylesheet() {
  /**
   * In 'production' mode of styled components
   * css is not added to the dom, but directly
   * to the CSSOM
   *
   * This is faster, because it skips a parsing step from
   * dom -> cssom, but also harder to debug, since there's
   * no visible styles in the dom.
   *
   * Adding a method to grab these
   * and output them to the console
   *
   * It's safe to do this, since these
   * are public, in that there's nothing
   * stopping end users from doing the same
   */
  try {
    const styleTags = Array.from(document.querySelectorAll<HTMLStyleElement>('style[data-styled]'))
    const rules = []
    for (const tag of styleTags) {
      if (tag.sheet) {
        rules.push(...Array.from(tag.sheet.cssRules).map(rule => rule.cssText))
      }
    }
    console.log(rules.join('\r\n'))
  } catch {
    // ignoring errors here
  }
}
