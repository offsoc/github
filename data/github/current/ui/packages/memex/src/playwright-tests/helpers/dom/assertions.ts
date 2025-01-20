import {expect, type Locator, type Page} from '@playwright/test'

import type {HTMLOrSVGElementHandle} from '../../types/dom'
import {_} from './selectors'

/**
 * Assert the given element is not present, or throw an error.
 *
 * @param target the locator or page to inspect
 * @param expression a selector to find the element
 *
 * @returns resolves if the element cannot be found, or throws an error
 */
export async function mustNotFind(target: Locator | Page, expression: string) {
  await expect(target.locator(expression)).toHaveCount(0)
}

/**
 * Assert the given element can be found, or throw an error.
 *
 * @param target the element or page to inspect
 * @param expression a selector to find the element
 * @param errorMessage error message to throw if the element cannot be found
 *
 * @returns a single element, if the selector resolves, or throws an error
 */
export async function mustFind(target: HTMLOrSVGElementHandle | Page | Locator, expression: string, errorMessage = '') {
  // if target is not an ElementHandle, use locator
  if (!('locator' in target)) {
    const result = await target.waitForSelector(expression)

    if (result === null) {
      throw new Error(errorMessage || `Could not find valid element for expression ${expression}`)
    }

    return result
  } else {
    const result = target.locator(expression)

    try {
      await expect(result).toBeVisible()
    } catch (e) {
      throw new Error(errorMessage || `Could not find valid element for expression ${expression}`)
    }

    return result.elementHandle()
  }
}

/**
 * Wait for a specific selector to match a given count, or throw an error.
 *
 * @param page the page under test
 * @param selector the selector to locate on the page
 * @param count the number of matches expected
 * @param timeout how long to wait before failing the test (default 1000ms)
 *
 */
export async function waitForSelectorCount(page: Page, selector: string, count: number, timeout = 5000) {
  const locator = page.locator(selector)
  await expect(locator).toHaveCount(count, {timeout})
}

/**
 * Helper function for asserting a group exists and that it contains the correct
 * number of rows.
 *
 * Do not include the "footer" in the expected `rowCount` as this is handled
 * internally.
 *
 * @param page Playwright object model
 * @param groupName group name to locate in the table
 * @param rowCount the expected row count
 */
export const groupContainsRows = async (page: Page, groupName: string, rowCount: number) => {
  await mustFind(page, _(`group-header-${groupName}`))

  const expectedRowCount = rowCount + 1
  const rows = page.getByTestId(`table-group-${groupName}`).getByRole('row')
  await expect(rows).toHaveCount(expectedRowCount)
  await mustFind(page, _(`table-group-footer-${groupName}`))
}

/**
 * Assert that the `element` has the acessible description `description`.
 */
export const mustHaveDescription = async (target: Locator, description: string) => {
  const describedBy = await target.evaluate(e => e.getAttribute('aria-describedby'))
  // An element can be described by more than one thing, so get all the described-by ids and iterate over them to see if their text is
  // equal to our expected description.

  // `react-aria` generated ids can have a `:`, which is not valid for a css selector, so we cannot use a syntax like:
  // `#${id}:has-text("${description}")` for the selector and instead need to check them all individually
  const describedByIds = describedBy.split(' ')
  let hasDescription = false
  for (const id of describedByIds) {
    const potentialDescription = await target.page().locator(`id=${id}`).innerText()
    if (potentialDescription === description) {
      hasDescription = true
      break
    }
  }
  expect(hasDescription, `Target is not described by an element with description '${description}'`).toBeTruthy()
}
