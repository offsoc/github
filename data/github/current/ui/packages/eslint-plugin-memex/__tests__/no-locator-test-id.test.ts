import {RuleTester} from 'eslint'

import noLocatorTestId from '../rules/no-locator-test-id'

const ruleTester = new RuleTester({parser: require.resolve('@typescript-eslint/parser')})

const error = 'Use `getByTestId(...)` instead of `locator(_(...))`.'

ruleTester.run('no-locator-test-id', noLocatorTestId, {
  valid: [
    {code: `getByTestId('side-panel')`},
    {code: `getByTestId("side-panel")`},
    {code: 'getByTestId(`side-panel`)'},
    {code: 'getByTestId(`side-panel`)'},
    {code: 'getByTestId(`side-${"panel"}`)'},
    {code: `page.getByTestId('side-panel')`},
    {code: `this.page.getByTestId('side-panel')`},
    {code: 'page.getByTestId(`side-${"panel"}`)'},
    {code: 'this.page.getByTestId(`side-${"panel"}`)'},
    {code: 'something.getByTestId("side-panel")'},
  ],
  invalid: [
    {
      code: `page.locator(_('side-panel'))`,
      errors: [error],
      output: `page.getByTestId('side-panel')`,
    },
    {
      code: `something.locator(_('side-panel'))`,
      errors: [error],
      output: `something.getByTestId('side-panel')`,
    },
    {
      code: `await expect(page.locator(_('general-settings'))).toBeVisible()`,
      errors: [error],
      output: `await expect(page.getByTestId('general-settings')).toBeVisible()`,
    },
    {
      code: `await expect(this.page.locator(_('general-settings'))).toBeVisible()`,
      errors: [error],
      output: `await expect(this.page.getByTestId('general-settings')).toBeVisible()`,
    },
  ],
})
