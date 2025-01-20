import {
  areCharacterKeyShortcutsEnabled,
  isNonCharacterKeyShortcut,
  isShortcutAllowed,
} from '../keyboard-shortcuts-helper'

jest.mock('@github-ui/feature-flags')

describe('areCharacterKeyShortcutsEnabled helper', () => {
  afterEach(() => {
    removeMetaTag()
  })
  test('false when shortcuts preference meta tag content is "no_character_key"', () => {
    addMetaTag('no_character_key')

    expect(areCharacterKeyShortcutsEnabled()).toBe(false)
  })

  test('true when shortcuts preference meta tag content is "all"', () => {
    addMetaTag('all')

    expect(areCharacterKeyShortcutsEnabled()).toBe(true)
  })

  test('true when shortcuts preference meta tag not set', () => {
    expect(areCharacterKeyShortcutsEnabled()).toBe(true)
  })
})

describe('isNonCharacterKeyShortcut helper', () => {
  test('true when arrow key"', () => {
    expect(isNonCharacterKeyShortcut('ArrowRight')).toBe(true)
    expect(isNonCharacterKeyShortcut('ArrowUp')).toBe(true)
    expect(isNonCharacterKeyShortcut('ArrowLeft')).toBe(true)
    expect(isNonCharacterKeyShortcut('ArrowDown')).toBe(true)

    expect(isNonCharacterKeyShortcut('Meta+ArrowLeft')).toBe(true)
    expect(isNonCharacterKeyShortcut('Meta+ArrowRight')).toBe(true)
    expect(isNonCharacterKeyShortcut('Meta+ArrowUp')).toBe(true)
    expect(isNonCharacterKeyShortcut('Meta+ArrowDown')).toBe(true)
  })

  test('true when `Enter`', () => {
    expect(isNonCharacterKeyShortcut('Enter')).toBe(true)
  })

  test('true when `Escape`', () => {
    expect(isNonCharacterKeyShortcut('Escape')).toBe(true)
  })

  test('true when `Esc`', () => {
    expect(isNonCharacterKeyShortcut('Esc')).toBe(true)
  })

  test('true when `Shift+Alt`', () => {
    expect(isNonCharacterKeyShortcut('Shift+Alt')).toBe(true)
  })

  test('true when `Control`', () => {
    expect(isNonCharacterKeyShortcut('Control+c')).toBe(true)
    expect(isNonCharacterKeyShortcut('Control+d')).toBe(true)
  })

  test('true when `Meta`', () => {
    expect(isNonCharacterKeyShortcut('Meta+d')).toBe(true)
    expect(isNonCharacterKeyShortcut('Meta+Shift+P')).toBe(true)
  })

  test('false when not arrow key, Enter, Escape, Shift+Alt, Esc, Control, or Meta', () => {
    expect(isNonCharacterKeyShortcut('A')).toBe(false)
    expect(isNonCharacterKeyShortcut('D')).toBe(false)
    expect(isNonCharacterKeyShortcut('?')).toBe(false)
    expect(isNonCharacterKeyShortcut('!')).toBe(false)
    expect(isNonCharacterKeyShortcut('Shift+a')).toBe(false)
    expect(isNonCharacterKeyShortcut('Alt+a')).toBe(false)
  })
})

describe('isShortcutAllowed helper', () => {
  afterEach(() => {
    removeMetaTag()
  })

  test('true when all shortcuts enabled"', () => {
    addMetaTag('all')

    expect(isShortcutAllowed(new KeyboardEvent('keydown', {metaKey: true, key: 'p'}))).toBe(true)
    expect(isShortcutAllowed(new KeyboardEvent('keydown', {key: '?', code: 'Slash'}))).toBe(true)
  })

  test('false when no_character_key and event corresponds to character key event', () => {
    addMetaTag('no_character_key')

    expect(isShortcutAllowed(new KeyboardEvent('keydown', {key: 'p'}))).toBe(false)
    expect(isShortcutAllowed(new KeyboardEvent('keydown', {key: '?', code: 'Slash'}))).toBe(false)
    expect(isShortcutAllowed(new KeyboardEvent('keydown', {altKey: true, key: 'g'}))).toBe(false)
  })

  test('true when no_character_key and event corresponds to non-character key event', () => {
    addMetaTag('no_character_key')

    expect(isShortcutAllowed(new KeyboardEvent('keydown', {metaKey: true, key: 'p'}))).toBe(true)
    expect(isShortcutAllowed(new KeyboardEvent('keydown', {ctrlKey: true, key: 'c'}))).toBe(true)
    expect(isShortcutAllowed(new KeyboardEvent('keydown', {altKey: true, shiftKey: true}))).toBe(true)
  })

  test('false when target is an input, regardless of settings', () => {
    const event = new KeyboardEvent('keydown', {key: 'p'})
    const target = document.createElement('input')
    target.dispatchEvent(event)

    expect(isShortcutAllowed(event)).toBe(false)
  })

  test('true when target is a readonly input', () => {
    const event = new KeyboardEvent('keydown', {key: 'p'})
    const target = document.createElement('input')
    target.readOnly = true
    target.dispatchEvent(event)

    expect(isShortcutAllowed(event)).toBe(true)
  })

  test('true when target is an aria-readonly input', () => {
    const event = new KeyboardEvent('keydown', {key: 'p'})
    const target = document.createElement('input')
    target.setAttribute('aria-readonly', 'true')
    target.dispatchEvent(event)

    expect(isShortcutAllowed(event)).toBe(true)
  })
})

function addMetaTag(content: string) {
  const meta = document.createElement('meta')
  meta.name = 'keyboard-shortcuts-preference'
  meta.content = content
  document.head.appendChild(meta)
}

function removeMetaTag() {
  const meta = document.querySelector('meta[name=keyboard-shortcuts-preference]') as HTMLMetaElement
  if (meta) {
    meta.remove()
  }
}
