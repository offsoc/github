import {applyRemoveChildPatch} from '../remove-child-patch'
import {isFeatureEnabled} from '@github-ui/feature-flags'

jest.mock('@github-ui/feature-flags', () => ({
  isFeatureEnabled: jest.fn(),
}))

const mockedIsFeatureEnabled = jest.mocked(isFeatureEnabled)
const originalRemoveChild = Node.prototype.removeChild

describe('remove-child-patch', () => {
  beforeEach(() => {
    Node.prototype.removeChild = originalRemoveChild
  })

  describe('with feature flag disabled', () => {
    it('should not patch the function', () => {
      mockedIsFeatureEnabled.mockReturnValue(false)

      applyRemoveChildPatch()

      expect(Node.prototype.removeChild).toBe(originalRemoveChild)
    })
  })

  describe('with feature flag enabled', () => {
    beforeEach(() => {
      mockedIsFeatureEnabled.mockReturnValue(true)
    })

    it('should patch the function', () => {
      applyRemoveChildPatch()

      expect(Node.prototype.removeChild).not.toBe(originalRemoveChild)
    })

    it('should throw an error if stacktrace doesnt include react-dom', () => {
      applyRemoveChildPatch()

      const node = document.createElement('div')
      const childNode = document.createElement('div')

      expect(() => node.removeChild(childNode)).toThrow('The node to be removed is not a child of this node.')
    })

    it('should not throw an error if stacktrace includes react-dom', () => {
      const mockedThrowFunction = () => {
        const error = new Error('The node to be removed is not a child of this node.')
        error.stack = `at Node.removeChild(/assets/environment-deadbeef.js:1:4866)
        at oH(/assets/react-lib-deadbeef.js:25:84971)
        at oq(/assets/react-lib-deadbeef.js:25:86212)
        at oQ(/assets/react-lib-deadbeef.js:25:86672)
        at oq(/assets/react-lib-deadbeef.js:25:86362)
        at oQ(/assets/react-lib-deadbeef.js:25:86475)
        at oq(/assets/react-lib-deadbeef.js:25:86362)
        at oQ(/assets/react-lib-deadbeef.js:25:86672)
        at oq(/assets/react-lib-deadbeef.js:25:86362)
        at oQ(/assets/react-lib-deadbeef.js:25:86475)`

        throw error
      }

      Node.prototype.removeChild = mockedThrowFunction
      applyRemoveChildPatch()

      const node = document.createElement('div')
      const childNode = document.createElement('div')

      expect(() => node.removeChild(childNode)).not.toThrow('The node to be removed is not a child of this node.')
    })
  })
})
