import {isMacOS} from '@github-ui/get-os'

import type {NewSingleOption} from '../../client/api/columns/contracts/single-select'
import {joinOxford} from '../../client/helpers/join-oxford'
import type {SettingsOption} from '../../client/helpers/new-column'
import {
  buildNewSingleSelectOption,
  emojiImgToText,
  isPlatformMeta,
  withAdjacentElements,
} from '../../client/helpers/util'

// mock only the client isMacOs check
jest.mock('@github-ui/get-os', () => {
  return {
    ...jest.requireActual('@github-ui/get-os'),
    isMacOS: jest.fn(),
  }
})

const metaClick = {
  metaKey: true,
  ctrlKey: false,
} as React.MouseEvent

const ctrlClick = {
  metaKey: false,
  ctrlKey: true,
} as React.MouseEvent

const colorOption: SettingsOption = {
  id: 'id-0',
  name: 'Initial name',
  color: 'GREEN',
  description: 'Initial description',
}

const grayOption: SettingsOption = {
  id: 'id-0',
  name: 'Initial name',
  color: 'GRAY',
  description: 'Initial description',
}

const newSingleOption: NewSingleOption = {
  name: 'new option',
  color: 'GRAY',
  description: '',
}

describe('joinOxford', () => {
  it('lists a single item', () => {
    const list = ['alpha']
    const actual = joinOxford(list)
    const expected = 'alpha'
    expect(actual).toBe(expected)
  })

  it('lists a two items', () => {
    const list = ['alpha', 'beta']
    const actual = joinOxford(list)
    const expected = 'alpha and beta'
    expect(actual).toBe(expected)
  })

  it('lists multiple items', () => {
    const list = ['alpha', 'beta', 'gamma']
    const actual = joinOxford(list)
    const expected = 'alpha, beta, and gamma'
    expect(actual).toBe(expected)
  })
})

describe('emojiImgToText', () => {
  it('when not an emoji img tag, returns string it was passed', () => {
    const str = 'foo'
    const result = emojiImgToText(str)
    expect(result).toBe(str)
  })

  it('when an emoji img tag, returns string with emoji colons and text', () => {
    const str =
      '<img class="emoji" title=":shipit:" alt=":shipit:" src="http://assets.github.localhost/images/icons/emoji/shipit.png" height="20" width="20" align="absmiddle"> ship'
    const result = emojiImgToText(str)
    const expected = ':shipit: ship'
    expect(result).toBe(expected)
  })

  it('when a g-emoji tag, returns string with emoji and text', () => {
    const str =
      '<g-emoji class="g-emoji" alias="books" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f4da.png">📚</g-emoji> done'
    const result = emojiImgToText(str)
    const expected = '📚 done'
    expect(result).toBe(expected)
  })
})

describe('isPlatformMeta', () => {
  it('when mac', () => {
    ;(isMacOS as jest.Mock).mockImplementation(() => true)

    expect(isPlatformMeta(metaClick)).toBe(true)
    expect(isPlatformMeta(ctrlClick)).toBe(false)
  })

  it('when windows', () => {
    ;(isMacOS as jest.Mock).mockImplementation(() => false)

    expect(isPlatformMeta(metaClick)).toBe(false)
    expect(isPlatformMeta(ctrlClick)).toBe(true)
  })
})

describe('withAdjacentElements', () => {
  const arr = [1, 2, 3, 4]

  it('has undefined previous value for the first element', () =>
    expect(withAdjacentElements(1, 0, arr)).toEqual([undefined, 1, 2]))

  it('has undefined next value for the last element', () =>
    expect(withAdjacentElements(4, 3, arr)).toEqual([3, 4, undefined]))

  it('returns both adjacent elements for middle element', () => {
    expect(withAdjacentElements(2, 1, arr)).toEqual([1, 2, 3])
    expect(withAdjacentElements(3, 2, arr)).toEqual([2, 3, 4])
  })

  it('has undefined previous and next values for single-element array', () =>
    expect(withAdjacentElements(1, 0, [1])).toEqual([undefined, 1, undefined]))
})

describe('buildNewSingleOption', () => {
  it('does NOT set a color if all other options use GRAY', () => {
    expect(buildNewSingleSelectOption(1, newSingleOption, [grayOption]).color).toBe('GRAY')
  })

  it("sets a color if there's at least one option using not GRAY", () => {
    expect(buildNewSingleSelectOption(1, newSingleOption, [colorOption]).color).not.toBe('GRAY')
  })
})
