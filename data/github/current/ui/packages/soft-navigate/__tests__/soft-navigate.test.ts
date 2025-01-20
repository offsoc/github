import {visit} from '@github/turbo'
import {softNavigate} from '../soft-navigate'
import {SoftNavStartEvent} from '@github-ui/soft-nav/events'

jest.mock('@github/turbo', () => ({
  visit: jest.fn(),
}))

window.performance.mark = jest.fn()
window.performance.clearResourceTimings = jest.fn()

describe('soft-nav navigate', () => {
  afterEach(jest.resetAllMocks)

  it('starts a soft navigation', async () => {
    const dispatchEventSpy = jest.spyOn(document, 'dispatchEvent')

    softNavigate('https://github.com/test')

    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(SoftNavStartEvent))
    expect(visit).toHaveBeenCalledWith('https://github.com/test', {})
  })
})
