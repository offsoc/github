import {
  BoardDndEventTypes,
  isBoardDndCardData,
  isBoardDndColumnData,
  isBoardDndEventData,
} from '../../../client/components/board/board-dnd-context'

describe('isBoardDndEventData', () => {
  it('should return false if no data is provided', () => {
    expect(isBoardDndEventData(undefined)).toEqual(false)
  })

  it('should return false if no object is provided', () => {
    expect(isBoardDndEventData(42)).toEqual(false)
  })

  it('should return false if no type property is provided', () => {
    expect(isBoardDndEventData({})).toEqual(false)
  })

  it('should return false if the type property is not a string', () => {
    expect(
      isBoardDndEventData({
        type: 42,
      }),
    ).toEqual(false)
  })

  it('should return true if the type is a card', () => {
    expect(
      isBoardDndEventData({
        type: BoardDndEventTypes.CARD,
      }),
    ).toEqual(true)
  })

  it('should return true if the type is a column', () => {
    expect(
      isBoardDndEventData({
        type: BoardDndEventTypes.COLUMN,
      }),
    ).toEqual(true)
  })
})

describe('isBoardDndCardData', () => {
  it('should return false if the type is not a card', () => {
    expect(
      isBoardDndCardData({
        type: BoardDndEventTypes.COLUMN,
      }),
    ).toEqual(false)
  })

  it('should return true if the type is a card', () => {
    expect(
      isBoardDndCardData({
        type: BoardDndEventTypes.CARD,
      }),
    ).toEqual(true)
  })
})

describe('isBoardDndColumnData', () => {
  it('should return false if the type is not a column', () => {
    expect(
      isBoardDndColumnData({
        type: BoardDndEventTypes.CARD,
      }),
    ).toEqual(false)
  })

  it('should return true if the type is a column', () => {
    expect(
      isBoardDndColumnData({
        type: BoardDndEventTypes.COLUMN,
      }),
    ).toEqual(true)
  })
})
