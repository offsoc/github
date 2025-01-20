import {TextAreaRuler, type TextRulerTarget, type TextRuler} from '../text-ruler'

// We unit test TextRuler with mocked values because the browser tests don't
// accurately represent client vs offset widths for text changes.  Better to
// just explicitly state the various values and what should happen vs trying to
// arm-wrestle the browser tests into giving us representative values.
describe('TextRuler rulez', () => {
  let rulerTextArea: TextRulerTarget
  let ruler: TextRuler

  beforeEach(() => {
    rulerTextArea = {
      scrollHeight: -1,
      style: {
        lineHeight: '15px',
      },
    }
    ruler = new TextAreaRuler(rulerTextArea)
  })

  // These tests are _slightly_ fake in that setting value doesn't set the
  // scrollHeight, so we prime with the resulting value ourselves.
  describe('line counting with scrollbars', () => {
    test('single line', () => {
      rulerTextArea.scrollHeight = 15
      const lines = ruler.getNumberOfLines('yo', true)
      expect(lines).toEqual(1)
      expect(rulerTextArea.value).toEqual('yo')
      expect(rulerTextArea.style.overflowY).toEqual('scroll')
    })

    test('multiple lines', () => {
      rulerTextArea.scrollHeight = 30
      const lines = ruler.getNumberOfLines('yo\nyo', true)
      expect(lines).toEqual(2)
      expect(rulerTextArea.value).toEqual('yo\nyo')
      expect(rulerTextArea.style.overflowY).toEqual('scroll')
    })

    test('rounds', () => {
      rulerTextArea.scrollHeight = 32
      const lines = ruler.getNumberOfLines('yo\nyo', true)
      expect(lines).toEqual(2)
      expect(rulerTextArea.value).toEqual('yo\nyo')
      expect(rulerTextArea.style.overflowY).toEqual('scroll')
    })
  })

  describe('line counting without scrollbars', () => {
    test('single line', () => {
      rulerTextArea.scrollHeight = 15
      const lines = ruler.getNumberOfLines('yo', false)
      expect(lines).toEqual(1)
      expect(rulerTextArea.value).toEqual('yo')
      expect(rulerTextArea.style.overflowY).toEqual('hidden')
    })

    test('multiple lines', () => {
      rulerTextArea.scrollHeight = 30
      const lines = ruler.getNumberOfLines('yo\nyo', false)
      expect(lines).toEqual(2)
      expect(rulerTextArea.value).toEqual('yo\nyo')
      expect(rulerTextArea.style.overflowY).toEqual('hidden')
    })

    test('rounds', () => {
      rulerTextArea.scrollHeight = 32
      const lines = ruler.getNumberOfLines('yo\nyo', false)
      expect(lines).toEqual(2)
      expect(rulerTextArea.value).toEqual('yo\nyo')
      expect(rulerTextArea.style.overflowY).toEqual('hidden')
    })
  })
})
