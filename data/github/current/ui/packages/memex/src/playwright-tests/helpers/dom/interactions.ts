import {type ElementHandle, expect, type Locator, type Mouse, type Page} from '@playwright/test'

import type {BrowserName} from '../../types/browsers'
import type {HTMLOrSVGElementHandle} from '../../types/dom'
import {mustFind} from './assertions'

/**
 * Press the tab key on the keyboard, without needing to worry about browser
 * specific idioms. In this situation, Webkit requires ALT+Tab to work as
 * expected.
 *
 * @param browserName the current browser running - should be accesible from Playwright
 * @param element the element to interact with
 */
export async function tab<T>(browserName: BrowserName, element: ElementHandle<T>) {
  if (browserName === 'webkit') {
    await element.press('Alt+Tab')
  } else {
    await element.press('Tab')
  }
}

/**
 * Click on an element, or throw if it does not exist.
 *
 * This is a helper to avoid having to assign an element to a variable, and
 * then call `click`.
 *
 * @param target a page or base element to query
 * @param expression a selector to find the element within `target`
 */
export async function click(target: HTMLOrSVGElementHandle | Page | Locator, expression: string) {
  const element = await mustFind(target, expression)
  await element.click()
}

/**
 * Double click on an element, or throw if it does not exist.
 *
 * This is a helper to avoid having to assign an element to a variable, and
 * then call `double click`.
 *
 * @param target a page or base element to query
 * @param expression a selector to find the element within `target`
 */
export async function doubleClick(target: HTMLOrSVGElementHandle | Page | Locator, expression: string) {
  const element = await mustFind(target, expression)
  await element.dblclick()
}

/**
 * Does the element represented by the elementHandle has DOM focus on it or on a
 * descendant?
 *
 * @param page Playwright page object
 * @param elementHandle the element to check for focus
 *
 * @returns `true` if the element is the active element, or if it contains the
 *          active element. `false` otherwise.
 */
export async function containsDOMFocus(page: Page, elementHandle: HTMLOrSVGElementHandle): Promise<boolean> {
  return page.evaluate(([el]) => el === document.activeElement || el.contains(document.activeElement), [elementHandle])
}

/**
 * Does the element represented by the elementHandle has DOM focus on it?
 *
 * @param page Playwright page object
 * @param elementHandle the element to check for focus
 *
 * @returns `true` if the element is the active element. `false` otherwise.
 */
export async function hasDOMFocus(page: Page, elementHandle: HTMLOrSVGElementHandle) {
  return page.evaluate(([el]) => el === document.activeElement, [elementHandle])
}

/**
 * Confirms a pop-up dialog by clicking the button with the specified text.
 *
 * This test will fail if the alert dialog cannot be found, or if a button with
 * the expected text cannot be found.
 *
 * @param page Playwright page object
 * @param confirmationButtonText expected confirmation text
 *
 */
export const submitConfirmDialog = async (page: Page, confirmationButtonText: string) => {
  const dialog = page.getByRole('alertdialog')

  const buttons = dialog.getByRole('button')

  await buttons.getByText(confirmationButtonText).click()
  return expect(dialog).toBeHidden()
}

type BoundingBox = {x: number; y: number; width: number; height: number}

/**
 * Get a bounding box for an element handle or throw.
 */
async function mustGetBoundingBox(target: HTMLOrSVGElementHandle | Locator): Promise<BoundingBox> {
  const box = await target.boundingBox()
  if (!box) throw new Error('No bounding box for target')
  return box
}

/**
 * Get the center point of the given element handle or throw.
 */
export async function mustGetCenter(target: HTMLOrSVGElementHandle | Locator): Promise<{x: number; y: number}> {
  const box = await mustGetBoundingBox(target)
  return {x: box.x + box.width / 2, y: box.y + box.height / 2}
}

type MouseMoveOpts = Parameters<Mouse['move']>[2]

/**
 * Drag an element to some point.
 */
export async function dragTo(
  page: Page,
  start: HTMLOrSVGElementHandle | Locator,
  end: {x?: number; y?: number},
  opts?: MouseMoveOpts,
  drop = true,
): Promise<void> {
  const startCenterPoint = await mustGetCenter(start)
  const optsWithDefaults: MouseMoveOpts = {steps: 10, ...opts}

  const newX = end.x ?? startCenterPoint.x
  const newY = end.y ?? startCenterPoint.y
  await page.mouse.move(startCenterPoint.x, startCenterPoint.y)
  await page.mouse.down()
  // hack: when moving the mouse to position before the current point, the drag
  // behaviour is not consistent. This makes an initial movement forward before
  // applying the move to the end point.
  await page.mouse.move(startCenterPoint.x + 1, startCenterPoint.y + 1)
  await page.mouse.move(newX, newY, optsWithDefaults)
  if (drop) {
    await page.mouse.up()
  }
}

/**
 * Extract the value from an input field
 *
 * @param page Playwright page model
 * @param element Input element to inspect in the DOM
 */
export async function getInputValue(page: Page, element: ElementHandle<HTMLInputElement>) {
  return await page.evaluate(
    ([elementInputHandle]) => {
      return elementInputHandle.value
    },
    [element],
  )
}

/**
 * Wait for the memex title to be ready
 *
 * @param page Playwright page object
 * @param title Title to search for
 */
export async function waitForTitle(page: Page, title: string) {
  await page.getByRole('heading', {name: title, level: 1}).waitFor()
}
