import {isMacOS} from '@github-ui/get-os'
import {colorNames} from '@github-ui/use-named-color'

import type {NewSingleOption} from '../api/columns/contracts/single-select'
import type {ColumnModel} from '../models/column-model'
import type {SettingsOption} from './new-column'
import {formatISODateString} from './parsing'

/**
 * Converts a string to title case. For example, each of these will be converted to "Title": "", "0", "title", "TITLE", "Title".
 * @param str
 */
export function toTitleCase(str: string) {
  return str.toLowerCase().replace(/^(.)/, x => x.toUpperCase())
}

/**
 * Converts a string to camel case. Examples:
 *
 * @example
 * ```
 * camelize("EquipmentClass name"); => "equipmentClassName"
 * ```
 *
 * @example
 * ```
 * camelize("Equipment className"); => "equipmentClassName"
 * ```
 *
 * @example
 * ```
 * camelize("equipment class name"); => "equipmentClassName"
 * ```
 *
 * @example
 * ```
 * camelize("Equipment Class Name"); => "equipmentClassName"
 * ```
 *
 * @param str
 */
export function camelize(str: string) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) return '' // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase()
  })
}

/**
 * Shallow equality check, essentially equivalent to React's.
 */
export function shallowEqual<T extends Record<string, unknown>>(objA: T, objB: T): boolean {
  if (objA === objB) {
    return true
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  // Test for A's keys different from B.
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key) || !(objA[key] === objB[key])) {
      return false
    }
  }

  return true
}

const NEW_SINGLE_SELECT_OPTION_ID_MATCHER = 'single-select-option'

export const isNewSingleSelectOptionId = (id?: string): boolean => {
  if (!id) return false

  return !!id.match(NEW_SINGLE_SELECT_OPTION_ID_MATCHER)
}

export const buildNewSingleSelectOption = (
  id: number,
  option: NewSingleOption,
  options: Array<SettingsOption>,
): SettingsOption => {
  // filter options to see if one option has color
  if (option.color === 'GRAY' && options.some(o => o.color !== 'GRAY')) {
    const availableColors = colorNames.slice(1) // remove gray

    const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)] || 'PURPLE'
    option = {...option, color: randomColor}
  }
  return {...option, id: `${NEW_SINGLE_SELECT_OPTION_ID_MATCHER}-${id}`}
}

export const isToday = (dateString: string): boolean => {
  return formatISODateString(new Date()) === dateString
}

type FalseyScalars = false | null | undefined | '' | 0
function truthy<T>(value: T): value is Exclude<T, FalseyScalars> {
  return Boolean(value)
}

export function filterFalseyValues<T>(value: Array<T | FalseyScalars>): Array<T> {
  return value.filter(truthy)
}

export function defined<T>(value: T | undefined): value is T {
  return value !== undefined
}

/**
 * If the string has the basics of an img tag with a title attribute that
 * matches the pattern of :emoji: and has some text following.
 *
 * Example input:
 *   "<img class=\"emoji\" title=\":shipit:\" alt=\":shipit:\" src=\"http://assets.github.localhost/images/icons/emoji/shipit.png\" height=\"20\" width=\"20\" align=\"absmiddle\"> ship"
 *
 * Example output:
 *   emoji: :shipit:
 *   text: ship
 */
const EMOJI_IMG_TAG_REGEX =
  /<img.+class=".*\bemoji\b.*".+title="(?<emoji>:[^:]+:)".+>\s+(?<text>.*)|<g-emoji.+>(?<gemoji>.+)<\/g-emoji>\s+(?<gtext>.+)/i

export const emojiImgToText = (emojiElement: string): string => {
  const match = emojiElement.match(EMOJI_IMG_TAG_REGEX)
  const {emoji, text, gemoji, gtext} = match?.groups ?? {}

  if (emoji && text) return `${emoji} ${text}`
  if (gemoji && gtext) return `${gemoji} ${gtext}`

  return emojiElement
}

export function isPlatformMeta(e: React.MouseEvent | React.KeyboardEvent | PointerEvent): boolean {
  // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
  return isMacOS() ? e.metaKey : e.ctrlKey
}

/**
 * Returns the last match index of the given regex in the given string
 *
 * @param regex The regex to apply to the string
 * @param text  The string to apply the regex to
 * @returns index of the last match (or -1 if no match)
 */
export function regexLastMatchIndex(regex: RegExp, text: string): number {
  let index = -1
  while (regex.test(text) === true) index = regex.lastIndex

  return index
}

/**
 * Returns the last match of the given regex in the given string or undefined
 *
 * @param regex The regex to apply to the string
 * @param text  The string to apply the regex to
 * @returns the match array (or undefined if there is no match)
 */
export function regexLastMatch(regex: RegExp, text: string): RegExpExecArray | undefined {
  let match = undefined
  let lastMatch = undefined

  while ((match = regex.exec(text)) !== null) lastMatch = match

  return lastMatch
}

/**
 * Trim characters from the beginning and/or end of a string. Note that this
 * trims the provided characters AND any whitespace before or after those
 * characters. For example:
 *
 * const str = " ,foo ,"
 * trimCharacters(str, ',') // "foo"
 *
 * @param str The string to trim
 * @param characters The characters to trim off the string
 * @returns string The newly trimmed string
 */
export function trimCharacters(str: string, characters: string): string {
  const pattern = new RegExp(`^[\\s${characters}\\s]*|[\\s${characters}\\s]*`)
  return str.replace(pattern, '')
}

export function sortColumnsVisisbleInOrderHiddenAlpha(
  a: ColumnModel,
  b: ColumnModel,
  visibleFields: ReadonlyArray<ColumnModel>,
): number {
  const leftVisibleIndex = visibleFields.findIndex((vf: ColumnModel) => vf.id === a.id)
  const rightVisibleIndex = visibleFields.findIndex((vf: ColumnModel) => vf.id === b.id)

  /**
   * Sort fields
   * 1 - Visible first, in order of left to right in table
   * 2 - Hidden fields, in order of alpha
   */
  if (leftVisibleIndex === -1 && rightVisibleIndex === -1) {
    return a.name.localeCompare(b.name)
  }
  if (leftVisibleIndex === -1 && rightVisibleIndex > -1) {
    return 1
  }
  if (rightVisibleIndex === -1 && leftVisibleIndex > -1) {
    return -1
  }

  return leftVisibleIndex - rightVisibleIndex
}

/** Ensures the subMenus do not close when a selection is made */
export const onSubMenuMultiSelection = (e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
  e.preventDefault()
}

/**
 * Ensures that columns are sorted in a stable order
 */
export function sortColumnsDeterministically(a: ColumnModel, b: ColumnModel) {
  // if at least one of the columns has the position set, make sure that the columns without the position
  // will be sorted first
  if (a.position !== undefined || b.position !== undefined) {
    return (a.position ?? -1) - (b.position ?? -1)
  }

  return a.databaseId - b.databaseId
}

/**
 * Given an array element, return tuple of `[previous, current, next]`, where `previous`
 * and `next` are `undefined` if they don't exist. Using with `Array.map` gives a
 * 'sliding window' around each element in the array, like:
 * `[1,2,3,4].map(withAdjacentElements).map([previous, current, next] => { ... })`.
 */
export function withAdjacentElements<T>(
  element: T,
  index: number,
  array: Array<T>,
): [previous: T | undefined, current: T, next: T | undefined] {
  const previous = index > 0 ? array[index - 1] : undefined
  const next = index < array.length - 1 ? array[index + 1] : undefined
  // We could just get `element` from `array[index]`, but then it wouldn't be compatible with native Array.map
  return [previous, element, next]
}

/**
 * Given an element, return whether the point is within the element's bounding box.
 */

export function isContainedWithin(element: HTMLElement, point: {x: number; y: number}) {
  const {x, y} = point
  const {left, top, right, bottom} = element.getBoundingClientRect()
  return x >= left && x <= right && y >= top && y <= bottom
}

/**
 * Return the XOR (symmetric difference) of the sets. That is the elements that are in either one, but not any elements
 * in both.
 */
export function xor<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): Set<T> {
  const result = new Set(a)
  for (const item of b) if (!result.delete(item)) result.add(item)
  return result
}

export function isEqualSets<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): boolean {
  if (a.size !== b.size) return false
  for (const item of a) if (!b.has(item)) return false
  return true
}
