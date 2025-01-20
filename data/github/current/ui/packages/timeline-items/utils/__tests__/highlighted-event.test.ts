import {getHighlightedEventText} from '../highlighted-event'

const testEventTypes = ['#issuecomment', '#event']

describe('getHightlightedCommentId', () => {
  test('returns undefined for empty hash', () => {
    const hash = ''
    expect(getHighlightedEventText(hash, testEventTypes)).toBeUndefined()
  })

  test('returns undefined for hash with single character', () => {
    const hash = '#'
    expect(getHighlightedEventText(hash, testEventTypes)).toBeUndefined()
  })

  test('returns undefined for hash with more than two parts', () => {
    const hash = '#issuecomment-123-456'
    expect(getHighlightedEventText(hash, testEventTypes)).toBeUndefined()
  })

  test('returns undefined for hash not starting with "#issuecomment"', () => {
    const hash = '#notissuecomment-123'
    expect(getHighlightedEventText(hash, testEventTypes)).toBeUndefined()
  })

  test('returns comment id for valid hash', () => {
    const hash = '#issuecomment-123'
    expect(getHighlightedEventText(hash, testEventTypes)).toEqual('issuecomment-123')
  })

  test('returns event id for valid hash', () => {
    const hash = '#event-123'
    expect(getHighlightedEventText(hash, testEventTypes)).toEqual('event-123')
  })
})
