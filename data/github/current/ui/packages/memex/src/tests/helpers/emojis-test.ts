import {replaceShortCodesWithEmojis} from '../../client/helpers/emojis'

describe('emojis', () => {
  describe('replaceShortCodesWithEmojis', () => {
    it('replaces shortcodes', () => expect(replaceShortCodesWithEmojis('abc :100: xyz')).toEqual('abc 💯 xyz'))

    it('replaces multiple shortcodes', () =>
      expect(replaceShortCodesWithEmojis('abc :100: :smile: xyz')).toEqual('abc 💯 😄 xyz'))

    it('replaces multiple instances of the same shortcode', () =>
      expect(replaceShortCodesWithEmojis(':100: :100: :100:')).toEqual('💯 💯 💯'))

    it('replaces shortcodes with special characters', () => {
      expect(replaceShortCodesWithEmojis(':+1:')).toEqual('👍')
      expect(replaceShortCodesWithEmojis(':-1:')).toEqual('👎')
      expect(replaceShortCodesWithEmojis(':e-mail:')).toEqual('📧')
    })

    it('does not replace invalid shortcodes', () => expect(replaceShortCodesWithEmojis(':::1:')).toEqual(':::1:'))
  })
})
