import {getCoordinates} from '../Sparkline'

describe('getCoordinates', () => {
  it('returns flat line if less than 2 pints', () => {
    expect(getCoordinates([], 100, 10)).toEqual(['0,0', '100,0'])
    expect(getCoordinates([0], 100, 10)).toEqual(['0,0', '100,0'])
  })

  it('returns correct coordinates for points with max greater than component heigh', () => {
    expect(getCoordinates([0, 2000], 100, 10)).toEqual(['0,0', '100,10'])
  })

  it('returns correct coordinates for points with max smaller than component heigh', () => {
    expect(getCoordinates([0, 5], 100, 10)).toEqual(['0,0', '100,5'])
  })
})
