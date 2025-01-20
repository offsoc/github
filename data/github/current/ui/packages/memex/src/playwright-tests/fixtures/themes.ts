import {expect} from '@playwright/test'

import {BasePageViewWithMemexApp} from './base-page-view'

const THEME_COLOR_SCHEME_ATTRIBUTE = 'data-current-theme-color-scheme'

export class Theme extends BasePageViewWithMemexApp {
  THEME_COLOR_SCHEME_LOCATOR = this.page.locator(`[${THEME_COLOR_SCHEME_ATTRIBUTE}]`)

  public async expectThemeColorSchemeApplied(colorScheme: string) {
    return expect(this.THEME_COLOR_SCHEME_LOCATOR).toHaveAttribute(THEME_COLOR_SCHEME_ATTRIBUTE, colorScheme)
  }

  public async expectThemeColorSchemeNotApplied(colorScheme: string) {
    return expect(this.THEME_COLOR_SCHEME_LOCATOR).not.toHaveAttribute(THEME_COLOR_SCHEME_ATTRIBUTE, colorScheme)
  }
  /**
   *
   * A helper function that validates a given theme is not applied, and that a fallback
   * is
   *
   * @param givenTheme A theme name to be applied to the page
   * @param fallbackTheme A theme that should apply when the given theme is not available
   * @returns
   */
  public async expectFallbackThemeColorSchemeApplied(givenColorScheme: string, fallbackColorScheme: string) {
    return Promise.all([
      this.expectThemeColorSchemeNotApplied(givenColorScheme),
      this.expectThemeColorSchemeApplied(fallbackColorScheme),
    ])
  }
}
