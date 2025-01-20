import {setup} from '../setup'
import {SoftNavSuccessEvent} from '../events'
import {announce} from '@github-ui/aria-live'

jest.mock('@github-ui/aria-live', () => ({
  announce: jest.fn(),
}))

describe('soft-nav announcement', () => {
  beforeEach(() => {
    setup()
    jest.resetAllMocks()
  })

  it('announces when a Turbo Drive navigation succeeds', async () => {
    document.dispatchEvent(new SoftNavSuccessEvent('turbo', 1))

    expect(announce).toHaveBeenCalled()
  })

  it('does not announce when mechanism is not Turbo', async () => {
    document.dispatchEvent(new SoftNavSuccessEvent('turbo.frame', 1))
    document.dispatchEvent(new SoftNavSuccessEvent('react', 1))

    expect(announce).not.toHaveBeenCalled()
  })
})
