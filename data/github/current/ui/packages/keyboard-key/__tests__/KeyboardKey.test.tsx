import {render, screen} from '@testing-library/react'

import {KeyboardKey, getAccessibleKeyboardKeyString} from '../KeyboardKey'

describe('KeyboardKey', () => {
  it('renders condensed keys by default', () => {
    render(<KeyboardKey keys="Shift+Control+Function+PageUp" />)
    for (const icon of ['⇧', '⌃', 'Fn', 'PgUp']) {
      const el = screen.getByText(icon)
      expect(el).toBeVisible()
      expect(el).toHaveAttribute('aria-hidden')
    }
  })

  it('renders accessible key descriptions', () => {
    render(<KeyboardKey format="condensed" keys="Control+Shift+{" />)
    for (const name of ['control', 'shift', 'left curly brace']) {
      const el = screen.getByText(name)
      expect(el).toBeInTheDocument()
      expect(el).not.toHaveAttribute('aria-hidden')
    }
  })

  it('renders key names in full format', () => {
    render(<KeyboardKey format="full" keys="Shift+Control+Function+ArrowUp" />)
    for (const name of ['Shift', 'Control', 'Function', 'Up Arrow']) {
      const el = screen.getByText(name)
      expect(el).toBeVisible()
      expect(el).toHaveAttribute('aria-hidden')
    }
  })

  it('sorts modifier keys', () => {
    render(<KeyboardKey format="full" keys="Shift+Control+PageUp+Function" />)
    const namesInOrder = ['Control', 'Shift', 'Function', 'Page Up']
    const names = screen.getAllByText(text => namesInOrder.includes(text)).map(el => el.textContent)
    expect(names).toEqual(namesInOrder)
  })

  it('capitalizes other keys', () => {
    render(<KeyboardKey format="condensed" keys="control+a" />)
    for (const key of ['⌃', 'A']) expect(screen.getByText(key)).toBeInTheDocument()
  })

  it.each([
    ['Plus', '+'],
    ['Space', '␣'],
  ])('renders %s as symbol in condensed mode', (name, symbol) => {
    render(<KeyboardKey format="condensed" keys={name} />)
    expect(screen.getByText(symbol)).toBeInTheDocument()
  })

  it.each(['Plus', 'Space'])('renders %s as name in full format', name => {
    render(<KeyboardKey format="full" keys={name} />)
    expect(screen.getByText(name)).toBeInTheDocument()
  })

  it('does not render plus signs in condensed mode', () => {
    render(<KeyboardKey format="condensed" keys="control+b" />)
    expect(screen.queryByText('+')).not.toBeInTheDocument()
  })

  it('renders plus signs between keys in full format', () => {
    render(<KeyboardKey format="full" keys="control+b" />)
    const plus = screen.getByText('+')
    expect(plus).toBeVisible()
    expect(plus).toHaveAttribute('aria-hidden')
  })

  it('renders sequences separated by hidden "then"', () => {
    render(<KeyboardKey keys="Mod+A F" format="full" />)
    const el = screen.getByText(', then')
    expect(el).toBeInTheDocument()
    expect(el).not.toHaveAttribute('aria-hidden')
  })
})

describe('getAccessibleKeyboardKeyString', () => {
  it('returns full readable key names', () => expect(getAccessibleKeyboardKeyString('{')).toBe('left curly brace'))

  it('joins keys in a chord with space', () => expect(getAccessibleKeyboardKeyString('Command+U')).toBe('command u'))

  it('sorts modifiers in standard order', () =>
    expect(getAccessibleKeyboardKeyString('Alt+Shift+Command+%')).toBe('alt shift command percent'))

  it('joins chords in a sequence with "then"', () =>
    expect(getAccessibleKeyboardKeyString('Alt+9 x y')).toBe('alt 9, then x, then y'))
})
