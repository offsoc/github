import {isFeatureEnabled} from '@github-ui/feature-flags'
const {sendStats} = jest.requireActual('../stats')
jest.mock('@github-ui/feature-flags')

describe('sendStats', () => {
  // eslint-disable-next-line compat/compat
  const requestIdleCallbackValue = window.requestIdleCallback
  const sendBeaconValue = navigator.sendBeacon

  afterEach(() => {
    document.head.textContent = ''
    // eslint-disable-next-line compat/compat
    window.requestIdleCallback = requestIdleCallbackValue
    navigator.sendBeacon = sendBeaconValue
    isFeatureEnabledMockValue(false)
  })

  function isFeatureEnabledMockValue(value: boolean) {
    ;(isFeatureEnabled as jest.Mock).mockImplementation(() => value)
  }

  describe('sendStats', () => {
    it('no-ops when killswitch flag is enabled', () => {
      isFeatureEnabledMockValue(true)

      Object.assign(navigator, {
        sendBeacon: () => {
          return null
        },
      })
      Object.assign(window, {
        // eslint-disable-next-line @typescript-eslint/ban-types
        requestIdleCallback: (cb: Function) => {
          cb()
        },
      })

      const navigatorSpy = jest.spyOn(navigator, 'sendBeacon')

      sendStats({timestamp: '12'}, false)

      expect(navigatorSpy).toHaveBeenCalledTimes(0)
    })

    it('reduces large lists into smaller batches', () => {
      document.head.appendChild(
        Object.assign(document.createElement('meta'), {
          name: 'browser-stats-url',
          content: 'https://example.com',
        }),
      )
      Object.assign(navigator, {
        sendBeacon: () => {
          return null
        },
      })
      Object.assign(window, {
        // eslint-disable-next-line @typescript-eslint/ban-types
        requestIdleCallback: (cb: Function) => {
          cb()
        },
      })

      const navigatorSpy = jest.spyOn(navigator, 'sendBeacon')

      // a small message
      sendStats({timestamp: 12345}, false, 1.0)
      sendStats({timestamp: 54321}, false, 1.0)

      // a massive message
      sendStats({timestamp: 'ab'.repeat(64 * 1024)}, true, 1.0)

      expect(navigatorSpy).toHaveBeenCalledTimes(2)
      expect(navigatorSpy).toHaveBeenNthCalledWith(
        1,
        'https://example.com',
        '{"stats": [{"timestamp":12345,"loggedIn":false,"staff":false},{"timestamp":54321,"loggedIn":false,"staff":false}] }',
      )

      expect(navigatorSpy).toHaveBeenNthCalledWith(
        2,
        'https://example.com',
        `{"stats": [{"timestamp":"${'ab'.repeat(64 * 1024)}","loggedIn":false,"staff":false}] }`,
      )
    })

    it('accepts a sampling rate between 0 and 1', () => {
      // expect sendstats to not raise an error
      expect(() => sendStats({timestamp: 12345}, false, 0.5)).not.toThrow()
    })

    it('throws and error if the sampling probability is not between 0 and 1', () => {
      expect(() => sendStats({timestamp: 12345}, false, -0.5)).toThrow(RangeError)
    })
  })
})
