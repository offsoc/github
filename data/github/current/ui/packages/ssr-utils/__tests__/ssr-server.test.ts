/***
 * @jest-environment node
 */
import {IS_SERVER as MOCK_IS_SERVER, IS_BROWSER as MOCK_IS_BROWSER} from '../ssr'

const mockIsServer = jest.fn()
const mockIsBrowser = jest.fn()
jest.mock('../ssr', () => ({
  get IS_SERVER() {
    return mockIsServer()
  },

  get IS_BROWSER() {
    return mockIsBrowser()
  },
}))

const {wasServerRendered, IS_SERVER, IS_BROWSER} = jest.requireActual('../ssr')

describe('SSR on server', () => {
  afterEach(jest.resetAllMocks)

  describe('IS_SERVER', () => {
    it('returns true in node environment', () => {
      expect(global.document).toBeUndefined()
      expect(IS_SERVER).toBe(true)
    })

    it('can be mocked', () => {
      mockIsServer.mockReturnValue(false)
      expect(MOCK_IS_SERVER).toBe(false)
      expect(IS_SERVER).toBe(true)
      expect(IS_BROWSER).toBe(false)
    })
  })

  describe('IS_BROWSER', () => {
    it('returns false in node environment', () => {
      expect(global.document).toBeUndefined()
      expect(IS_BROWSER).toBe(false)
    })

    it('can be mocked', () => {
      mockIsBrowser.mockReturnValue(true)
      expect(MOCK_IS_BROWSER).toBe(true)
      expect(IS_BROWSER).toBe(false)
      expect(IS_SERVER).toBe(true)
    })
  })

  describe('wasServerRendered', () => {
    it('returns true in node environment', () => {
      expect(global.document).toBeUndefined()
      expect(wasServerRendered()).toBe(true)
    })
  })
})
