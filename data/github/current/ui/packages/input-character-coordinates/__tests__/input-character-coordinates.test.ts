import {
  getAbsoluteCharacterCoordinates,
  getCharacterCoordinates,
  getScrollAdjustedCharacterCoordinates,
} from '../input-character-coordinates'

describe('getCharacterCoordinates', () => {
  it('returns coordinates of textarea', () => {
    const element = document.createElement('textarea')
    element.value = 'hello world'
    document.body.appendChild(element)

    const coordinates = getCharacterCoordinates(element, 5)
    expect(coordinates).toEqual({top: 1, left: 1, height: NaN})
  })

  it('returns coordinates of input', () => {
    const element = document.createElement('input')
    element.value = 'hello world'
    document.body.appendChild(element)

    const coordinates = getCharacterCoordinates(element, 5)
    expect(coordinates).toEqual({top: 2, left: 2, height: NaN})
  })

  it('returns coordinates of textarea with width styling and border-box', () => {
    const element = document.createElement('textarea')
    element.style.width = '100px'
    element.style.lineHeight = '18px'
    element.style.boxSizing = 'border-box'
    element.value = 'hello world'
    document.body.appendChild(element)

    const coordinates = getCharacterCoordinates(element, 5)
    expect(coordinates).toEqual({top: 1, left: 1, height: 18})
  })

  it('returns coordinates of input and accounts for `box-sizing: border-box` style', () => {
    const element = document.createElement('input')
    element.style.boxSizing = 'border-box'
    element.value = 'hello world'
    document.body.appendChild(element)

    const coordinates = getCharacterCoordinates(element, 5)
    expect(coordinates).toEqual({top: 2, left: 2, height: NaN})
  })

  it('returns coordinates of input and accounts for line-height', () => {
    const element = document.createElement('input')
    element.style.boxSizing = 'border-box'
    element.style.height = '40px'
    element.style.lineHeight = '20px'
    element.value = 'hello world'
    document.body.appendChild(element)

    const coordinates = getCharacterCoordinates(element, 5)
    expect(coordinates).toEqual({top: 2, left: 2, height: 20})
  })

  it('returns coordinates of input and calculates correct height when line heights are equal', () => {
    const element = document.createElement('input')
    element.style.boxSizing = 'border-box'
    element.style.height = '20px'
    element.style.lineHeight = '18px'
    element.value = 'hello world'
    document.body.appendChild(element)

    const coordinates = getCharacterCoordinates(element, 5)
    expect(coordinates).toEqual({top: 2, left: 2, height: 18})
  })
})

describe('getScrollAdjustedCharacterCoordinates', () => {
  it('returns coordinates with adjusted for scroll', () => {
    const element = document.createElement('input')
    element.value = 'hello world'
    element.scrollTop = 10
    element.scrollLeft = 10
    element.style.lineHeight = '18px'
    document.body.appendChild(element)

    const coordinates = getScrollAdjustedCharacterCoordinates(element, 5)

    expect(coordinates).toEqual({top: -8, left: -8, height: 18})
  })
})

describe('getAbsoluteCharacterCoordinates', () => {
  it('returns coordinates with viewport offsets', () => {
    const element = document.createElement('input')
    element.value = 'hello world'
    element.scrollTop = 10
    element.style.marginTop = '10px'
    element.style.borderTopWidth = '22px'
    element.style.lineHeight = '18px'
    document.body.appendChild(element)

    const coordinates = getAbsoluteCharacterCoordinates(element, 5)

    expect(coordinates).toEqual({top: 12, left: 2, height: 18})
  })
})
