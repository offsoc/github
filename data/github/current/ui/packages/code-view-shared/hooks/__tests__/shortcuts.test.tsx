import {renderHook} from '@testing-library/react'

import {useShortcut} from '../shortcuts'

const scenariosCopyLink = [
  {platform: 'Macintosh', expectedText: '⌘ shift .', expectedHotkey: 'Meta+Shift+>'},
  {platform: 'windows', expectedText: 'Ctrl shift .', expectedHotkey: 'Control+Shift+>'},
]
test.each(scenariosCopyLink)('copyFilePathShortcut platform:$platform', async scenario => {
  jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(scenario.platform)
  const {result} = renderHook(useShortcut)

  expect(result.current.copyFilePathShortcut.hotkey).toBe(scenario.expectedHotkey)
  expect(result.current.copyFilePathShortcut.text).toBe(scenario.expectedText)
})

const scenariosCopyPermalink = [
  {platform: 'Macintosh', expectedText: '⌘ shift ,', expectedHotkey: 'Meta+Shift+<'},
  {platform: 'windows', expectedText: 'Ctrl shift ,', expectedHotkey: 'Control+Shift+<'},
]
test.each(scenariosCopyPermalink)('copyPermalinkShortcut platform:$platform', async scenario => {
  jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(scenario.platform)
  const {result} = renderHook(useShortcut)

  expect(result.current.copyPermalinkShortcut.hotkey).toBe(scenario.expectedHotkey)
  expect(result.current.copyPermalinkShortcut.text).toBe(scenario.expectedText)
})

const scenariosExpendTree = [
  {platform: 'Macintosh', expectedText: undefined, expectedHotkey: 'Meta+b'},
  {platform: 'windows', expectedText: undefined, expectedHotkey: 'Control+b'},
]
test.each(scenariosExpendTree)('toggleTreeShortcut platform:$platform', async scenario => {
  jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(scenario.platform)
  const {result} = renderHook(useShortcut)

  expect(result.current.toggleTreeShortcut.hotkey).toBe(scenario.expectedHotkey)
  expect(result.current.toggleTreeShortcut.text).toBe(scenario.expectedText)
})

const scenariosSymbols = [
  {platform: 'Macintosh', expectedText: undefined, expectedHotkey: 'Meta+i'},
  {platform: 'windows', expectedText: undefined, expectedHotkey: 'Control+i'},
]
test.each(scenariosSymbols)('toggleSymbolsShortcut platform:$platform', async scenario => {
  jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(scenario.platform)
  const {result} = renderHook(useShortcut)

  expect(result.current.toggleSymbolsShortcut.hotkey).toBe(scenario.expectedHotkey)
  expect(result.current.toggleSymbolsShortcut.text).toBe(scenario.expectedText)
})

const scenariosFindInFile = [
  {platform: 'Macintosh', expectedText: '⌘ f', expectedHotkey: 'Meta+f, F3'},
  {platform: 'windows', expectedText: 'Ctrl f', expectedHotkey: 'Control+f, F3'},
]
test.each(scenariosFindInFile)('findInFileShortcut platform:$platform', async scenario => {
  jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(scenario.platform)
  const {result} = renderHook(useShortcut)

  expect(result.current.findInFileShortcut.hotkey).toBe(scenario.expectedHotkey)
  expect(result.current.findInFileShortcut.text).toBe(scenario.expectedText)
})
