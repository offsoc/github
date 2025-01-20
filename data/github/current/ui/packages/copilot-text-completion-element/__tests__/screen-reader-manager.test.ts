import {ScreenReaderManager} from '../screen-reader-manager'
import {announce} from '@github-ui/aria-live'

jest.mock('@github-ui/aria-live', () => ({
  announce: jest.fn(),
}))

describe('ScreenReaderManager Announcement', () => {
  describe('acceptSuggestion', () => {
    test('announces acceptance', () => {
      const screenReaderManager = new ScreenReaderManager(undefined, undefined, undefined)
      screenReaderManager.acceptSuggestion()
      expect(announce).toHaveBeenCalledWith('Suggestion accepted.')
    })
  })

  describe('announceCompletion', () => {
    let screenReaderManager: ScreenReaderManager
    beforeEach(() => {
      screenReaderManager = new ScreenReaderManager(undefined, undefined, undefined)
    })

    test('completion is less than 250 characters', () => {
      const completion =
        'This line of text is a good line of text. This line of text is a good line of text. This line of text is a good line of text. This line of text is a good line of text. This line of text is a good line of text.'
      screenReaderManager.announceCompletion(completion)

      const expectedAnnouncement = `${completion}, suggestion. Tab to accept. Control i to inspect.`

      expect(announce).toHaveBeenCalledWith(expectedAnnouncement)
    })

    test('completion is over 250 characters', () => {
      const completion =
        'This line of text is a good line of text. This line of text is a good line of text. This line of text is a good line of text. This line of text is a good line of text. This line of text is a good line of text. This line of text is a good line of text.'
      screenReaderManager.announceCompletion(completion)
      const shortenedCompletion =
        'This line of text is a good line of text. This line of text is a good line of text. This line of text is a good line of text. This line of text is a good line of text. This line of text is a good line of text. This line of text is a good line of'
      const expectedAnnouncement = `${shortenedCompletion}..., truncated suggestion. Tab to accept. Control i to inspect.`

      expect(announce).toHaveBeenCalledWith(expectedAnnouncement)
    })
  })
})
