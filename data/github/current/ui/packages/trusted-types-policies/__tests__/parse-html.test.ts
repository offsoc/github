import {temporaryPermissiveParseHTMLPolicy} from '../parse-html'

const mockSendEvent = jest.fn()

jest.mock('@github-ui/hydro-analytics', () => ({
  sendEvent: (...args: unknown[]) => mockSendEvent(...args),
}))

afterEach(() => {
  mockSendEvent.mockClear()
})

describe('temporaryPermissiveParseHTMLPolicy', () => {
  it('acts as a noop', async () => {
    const trustedHTML = temporaryPermissiveParseHTMLPolicy.createHTML('<img src=x onerror=alert(1)//>')
    expect(trustedHTML).toEqual('<img src=x onerror=alert(1)//>')
  })
})
