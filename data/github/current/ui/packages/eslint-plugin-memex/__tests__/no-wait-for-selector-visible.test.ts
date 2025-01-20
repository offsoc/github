import {RuleTester} from 'eslint'

import noWaitForSelectorVisible from '../rules/no-wait-for-selector-visible'

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
})

const error = {
  message: `Using waitForSelector with the "state: 'visible'" option is discouraged. Use 'expect().toBeVisible()' instead.`,
}

ruleTester.run('no-wait-for-selector-visible', noWaitForSelectorVisible, {
  valid: [
    {code: `await expect(page.locator(_('settings-side-nav'))).toBeVisible()`},
    {code: `await expect(this.page.locator(_('settings-side-nav'))).toBeVisible()`},
    {code: `const sideNav = await page.locator(_('settings-side-nav'))\nawait expect(sideNav).toBeVisible()`},
    // Unrelated, but caused a crash once
    {code: `const field = await (testId ? page.$(_(testId)) : page.$(selector))`},
  ],
  invalid: [
    {
      code: `await page.waitForSelector(_('settings-side-nav'), { state: 'visible' })`,
      errors: [error],
      output: `await expect(page.locator(_('settings-side-nav'))).toBeVisible()`,
    },
    {
      code: `await this.page.waitForSelector(_('settings-side-nav'), { state: 'visible' })`,
      errors: [error],
      output: `await expect(this.page.locator(_('settings-side-nav'))).toBeVisible()`,
    },
    {
      code: `const sideNav = await page.waitForSelector(_('settings-side-nav'), { state: 'visible' })`,
      errors: [error],
      output: `const sideNav = page.locator(_('settings-side-nav'))\nawait expect(sideNav).toBeVisible()`,
    },
  ],
})
