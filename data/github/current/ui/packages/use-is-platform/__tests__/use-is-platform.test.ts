import {renderHook} from '@testing-library/react'
import {type Platform, useIsPlatform} from '../use-is-platform'

const scenarios: Array<{platforms: Platform[]; userAgent: string; expected: boolean}> = [
  {platforms: ['mac'], userAgent: 'Macintosh', expected: true},
  {platforms: ['windows'], userAgent: 'Windows', expected: true},
  {platforms: ['windows', 'mac'], userAgent: 'Macintosh', expected: true},
  {platforms: ['windows', 'mac'], userAgent: 'Windows', expected: true},
  {platforms: ['windows', 'mac'], userAgent: 'Other', expected: false},
  {platforms: ['windows'], userAgent: 'Macintosh', expected: false},
  {platforms: [], userAgent: 'Macintosh', expected: false},
]

describe('useIsPlatform', () => {
  test.each(scenarios)('useIsPlatform platform: $platforms userAgent: $userAgent', async scenario => {
    jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(scenario.userAgent)
    const {result} = renderHook(() => useIsPlatform(scenario.platforms))
    expect(result.current).toBe(scenario.expected)
  })

  it('should update when the platforms change', async () => {
    jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Macintosh')
    const {result, rerender} = renderHook((platforms: Platform[]) => useIsPlatform(platforms), {
      initialProps: ['mac'],
    })
    expect(result.current).toBe(true)
    rerender(['windows'])
    expect(result.current).toBe(false)
  })
})
