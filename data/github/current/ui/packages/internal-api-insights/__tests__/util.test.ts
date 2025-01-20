import {getLinkFromBacktrace, tryGetNumber} from '../utils'

describe('tryGetTimingInfo', () => {
  it('should return undefined when no matching value is found', () => {
    const item = {
      data: {
        time: '5.0',
        other: {
          value: '3.0',
        },
      },
    }
    const paths = ['data/notime', 'data/other/nonexistent']
    const threshold = 2.0

    const result = tryGetNumber(item, paths, threshold)

    expect(result).toBeUndefined()
  })

  it('should return undefined when matching value is below the threshold', () => {
    const item = {
      data: {
        time: '2.5',
      },
    }
    const paths = ['data/time']
    const threshold = 3.0

    const result = tryGetNumber(item, paths, threshold)

    expect(result).toBeUndefined()
  })

  it('should return the matching value when it"s equal to the threshold', () => {
    const item = {
      data: {
        time: '5.0',
      },
    }
    const paths = ['data/time']
    const threshold = 5.0

    const result = tryGetNumber(item, paths, threshold)

    expect(result).toBe(5.0)
  })

  it('should return the matching value when it"s above the threshold', () => {
    const item = {
      data: {
        time: '6.0',
      },
    }
    const paths = ['data/time']
    const threshold = 5.0

    const result = tryGetNumber(item, paths, threshold)

    expect(result).toBe(6.0)
  })

  it('should handle arrays', () => {
    const item = {
      data: ['1234'],
    }

    const threshold = 5.0

    const result = tryGetNumber(item, ['data'], threshold)

    expect(result).toBe(undefined)
  })

  it('should return undefined when matching value does not match the path', () => {
    const item = {
      data: {
        time: '3',
      },
    }
    const paths = ['data/other']
    const threshold = 3.0

    const result = tryGetNumber(item, paths, threshold)

    expect(result).toBeUndefined()
  })

  describe('getLinkFromBacktrace', () => {
    it('should return the remote URL from the backtrace array', () => {
      const backtrace = [
        '/workspaces/github/ui/packages/internal-api-insights/utils.ts:10',
        '/workspaces/github/ui/packages/internal-api-insights/utils.ts:20',
      ]

      const result = getLinkFromBacktrace(backtrace)

      expect(result).toBe('https://github.com/github/github/blob/master/ui/packages/internal-api-insights/utils.ts#L10')
    })

    it('should return the remote URL from the backtrace string', () => {
      const backtrace = '/workspaces/github/ui/packages/internal-api-insights/utils.ts:10'

      const result = getLinkFromBacktrace(backtrace)

      expect(result).toBe('https://github.com/github/github/blob/master/ui/packages/internal-api-insights/utils.ts#L10')
    })

    it('should return undefined if backtrace is undefined', () => {
      const backtrace = undefined

      const result = getLinkFromBacktrace(backtrace)

      expect(result).toBeUndefined()
    })

    it('should return undefined if backtrace is an empty array', () => {
      const backtrace: string[] = []

      const result = getLinkFromBacktrace(backtrace)

      expect(result).toBeUndefined()
    })

    it('should return undefined if backtrace is an empty string', () => {
      const backtrace = ''

      const result = getLinkFromBacktrace(backtrace)

      expect(result).toBeUndefined()
    })

    it('should return undefined if backtrace is an object', () => {
      const backtrace = {}

      const result = getLinkFromBacktrace(backtrace)

      expect(result).toBeUndefined()
    })
  })
})
