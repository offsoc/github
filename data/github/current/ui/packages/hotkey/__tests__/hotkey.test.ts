import {splitHotkeyString} from '../hotkey'

describe('splitHotkeyString', () => {
  it.each([
    ['a,b,c', ['a', 'b', 'c']],
    ['Control+a b,Alt+Shift+x d', ['Control+a b', 'Alt+Shift+x d']],
    [',,Control+,', [',', 'Control+,']],
    [',+Control,a', [',+Control', 'a']],
    ['Control+, a,b', ['Control+, a', 'b']],
    ['Control+,,n', ['Control+,', 'n']],
    ['Control+,,,', ['Control+,', ',']],
  ])(`%p`, (input, expected) => {
    expect(splitHotkeyString(input)).toEqual(expected)
  })
})
