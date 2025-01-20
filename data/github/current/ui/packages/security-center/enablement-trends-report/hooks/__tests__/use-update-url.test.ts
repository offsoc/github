import type {RangeSelection} from '@github-ui/date-picker'
import {act, renderHook, waitFor} from '@testing-library/react'

import type {Period} from '../../../common/utils/date-period'
import {useUpdateUrl} from '../use-update-url'

describe('useUpdateUrl', () => {
  const URL_BASE = 'http://localhost/orgs/github/security/reports/adoption'

  it('removes the parameters if they are unchanged', async () => {
    window.history.pushState(null, '', `${URL_BASE}?query=archived%3Afalse&period=last30days`)

    renderHook(() =>
      act(() => {
        useUpdateUrl(
          '',
          false, // queryIsDirty
          {period: 'last30days'} as Period,
          false, // dateSpanIsDirty
          '',
          false, // featureIsDirty
        )
      }),
    )

    await waitFor(() => expect(window.location.href).toBe(URL_BASE))
  })

  it('includes the search string', async () => {
    window.history.pushState(null, '', URL_BASE)

    renderHook(() =>
      act(() => {
        useUpdateUrl(
          'foo:bar',
          true, // queryIsDirty
          {period: 'last30days'} as Period,
          false, // dateSpanIsDirty
          '',
          false, // featureIsDirty
        )
      }),
    )

    await waitFor(() => expect(window.location.href).toBe(`${URL_BASE}?query=foo%3Abar`))
  })

  it('uses a period-based date span', async () => {
    window.history.pushState(null, '', URL_BASE)

    renderHook(() =>
      act(() => {
        useUpdateUrl(
          '',
          false, // queryIsDirty
          {period: 'last30days'} as Period,
          true, // dateSpanIsDirty
          '',
          false, // featureIsDirty
        )
      }),
    )

    await waitFor(() => expect(window.location.href).toBe(`${URL_BASE}?period=last30days`))
  })

  it('uses a range-based date span', async () => {
    window.history.pushState(null, '', URL_BASE)

    renderHook(() =>
      act(() => {
        useUpdateUrl(
          '',
          false, // queryIsDirty
          {from: new Date('2024-01-01'), to: new Date('2024-01-31')} as RangeSelection,
          true, // dateSpanIsDirty
          '',
          false, // featureIsDirty
        )
      }),
    )

    await waitFor(() => expect(window.location.href).toBe(`${URL_BASE}?startDate=2024-01-01&endDate=2024-01-31`))
  })

  it('includes the feature tab', async () => {
    window.history.pushState(null, '', URL_BASE)

    renderHook(() =>
      act(() => {
        useUpdateUrl(
          '',
          false, // queryIsDirty
          {period: 'last30days'} as Period,
          false, // dateSpanIsDirty
          'advanced_security',
          true, // featureIsDirty
        )
      }),
    )

    await waitFor(() => expect(window.location.href).toBe(`${URL_BASE}?feature=advanced_security`))
  })
})
