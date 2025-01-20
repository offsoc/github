import {filterOutCharacterKeyShortcuts} from '../observer'

describe('filterOutCharacterKeyShortcuts', () => {
  test('keeps shortcuts that include control, meta, arrow keys, shift+alt, enter, or escape', () => {
    const metaShortcut = filterOutCharacterKeyShortcuts('Meta+m')
    expect(metaShortcut).toBe('Meta+m')

    const controlShortcut = filterOutCharacterKeyShortcuts('Control+m')
    expect(controlShortcut).toBe('Control+m')

    const arrowUpShortcut = filterOutCharacterKeyShortcuts('ArrowUp')
    expect(arrowUpShortcut).toBe('ArrowUp')

    const arrowDownShortcut = filterOutCharacterKeyShortcuts('ArrowDown')
    expect(arrowDownShortcut).toBe('ArrowDown')

    const arrowLeftShortcut = filterOutCharacterKeyShortcuts('ArrowLeft')
    expect(arrowLeftShortcut).toBe('ArrowLeft')

    const arrowRightShortcut = filterOutCharacterKeyShortcuts('ArrowRight')
    expect(arrowRightShortcut).toBe('ArrowRight')

    const enterShortcut = filterOutCharacterKeyShortcuts('Enter')
    expect(enterShortcut).toBe('Enter')

    const escapeShortcut = filterOutCharacterKeyShortcuts('Escape')
    expect(escapeShortcut).toBe('Escape')

    const altAndShiftShortcut = filterOutCharacterKeyShortcuts('Alt+Shift')
    expect(altAndShiftShortcut).toBe('Alt+Shift')
  })

  test('removes character key shortcuts from comma separated string of shortcuts', () => {
    const filteredShortcut_1 = filterOutCharacterKeyShortcuts('a,Control+p,Shift+c,Meta+p,Alt+c')
    expect(filteredShortcut_1).toBe('Control+p,Meta+p')

    const filteredShortcuts_2 = filterOutCharacterKeyShortcuts('Shift,Shift+ArrowLeft,Shift+ArrowUp,Shift+c,P')
    expect(filteredShortcuts_2).toBe('Shift+ArrowLeft,Shift+ArrowUp')

    const filteredShortcuts_3 = filterOutCharacterKeyShortcuts('a,Escape,g f,Enter,Shift+Alt')
    expect(filteredShortcuts_3).toBe('Escape,Enter,Shift+Alt')
  })

  test('returns empty string if string composed only of character key shortcuts', () => {
    const filteredShortcuts_1 = filterOutCharacterKeyShortcuts('a,Alt+g')
    expect(filteredShortcuts_1).toBe('')

    const filteredShortcuts_2 = filterOutCharacterKeyShortcuts('a,c o d e,g F,F')
    expect(filteredShortcuts_2).toBe('')
  })
})
