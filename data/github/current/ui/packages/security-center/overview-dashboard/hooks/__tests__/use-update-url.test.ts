import type {RangeSelection} from '@github-ui/date-picker'
import {act, renderHook, waitFor} from '@testing-library/react'

import type {Period} from '../../../common/utils/date-period'
import {useUpdateUrl} from '../use-update-url'

describe('useUpdateUrl', () => {
  const submittedQuery = 'archived:false'
  const queryWasChanged = true
  const dateSpanWasChanged = true
  const startDateString = '2024-01-01'
  const endDateString = '2024-01-10'
  const selectedTable = 'repositories'
  const selectedDateSpan = {period: 'last30days'} as Period

  const URL_BASE = 'http://localhost/orgs/github/security/overview'

  it('deletes the query and date span if they are unchanged', async () => {
    window.history.pushState(null, '', URL_BASE)

    renderHook(() =>
      act(() => {
        useUpdateUrl(
          submittedQuery,
          false, // queryWasChanged
          false, // dateSpanWasChanged
          startDateString,
          endDateString,
          selectedTable,
          selectedDateSpan,
        )
      }),
    )

    await waitFor(() => expect(window.location.href).toBe(URL_BASE))
  })

  it('updates the query if the query was changed', async () => {
    window.history.pushState(null, '', URL_BASE)

    renderHook(() =>
      act(() => {
        useUpdateUrl(
          submittedQuery,
          queryWasChanged,
          false, // dateSpanWasChanged
          startDateString,
          endDateString,
          selectedTable,
          selectedDateSpan,
        )
      }),
    )

    await waitFor(() => expect(window.location.href).toBe(`${URL_BASE}?query=archived%3Afalse`))
  })

  it('updates the date span if the date span was changed', async () => {
    window.history.pushState(null, '', URL_BASE)

    renderHook(() =>
      act(() => {
        useUpdateUrl(
          submittedQuery,
          false, // queryWasChanged
          dateSpanWasChanged,
          startDateString,
          endDateString,
          selectedTable,
          selectedDateSpan,
        )
      }),
    )

    await waitFor(() => expect(window.location.href).toBe(`${URL_BASE}?period=last30days`))
  })

  it('removes the start and end date if the selected date span is a Period', async () => {
    window.history.pushState(null, '', `${URL_BASE}?query=archived%3Afalse&startDate=2024-01-01&endDate=2024-01-10`)

    renderHook(() =>
      act(() => {
        useUpdateUrl(
          submittedQuery,
          queryWasChanged,
          dateSpanWasChanged,
          startDateString,
          endDateString,
          selectedTable,
          selectedDateSpan,
        )
      }),
    )

    await waitFor(() => expect(window.location.href).toBe(`${URL_BASE}?query=archived%3Afalse&period=last30days`))
  })

  it('removes the period if the selected date span is a dateRange', async () => {
    window.history.pushState(null, '', `${URL_BASE}?query=archived%3Afalse&period=last30days`)

    renderHook(() =>
      act(() => {
        useUpdateUrl(
          submittedQuery,
          queryWasChanged,
          dateSpanWasChanged,
          startDateString,
          endDateString,
          selectedTable,
          {from: new Date('2024-01-01'), to: new Date('2024-01-10')} as RangeSelection, //selectedDateSpan
        )
      }),
    )

    await waitFor(() =>
      expect(window.location.href).toBe(`${URL_BASE}?query=archived%3Afalse&startDate=2024-01-01&endDate=2024-01-10`),
    )
  })

  it('removes the selected table if it is the default table', async () => {
    window.history.pushState(null, '', `${URL_BASE}?impactAnalysisTab=sast`)

    renderHook(() =>
      act(() => {
        useUpdateUrl(
          submittedQuery,
          false, // queryWasChanged
          false, // dateSpanWasChanged
          startDateString,
          endDateString,
          selectedTable,
          selectedDateSpan,
        )
      }),
    )

    await waitFor(() => expect(window.location.href).toBe(URL_BASE))
  })

  it('sets the selected table', async () => {
    window.history.pushState(null, '', URL_BASE)

    renderHook(() =>
      act(() => {
        useUpdateUrl(
          submittedQuery,
          false, // queryWasChanged
          false, // dateSpanWasChanged
          startDateString,
          endDateString,
          'sast', // selectedTable
          selectedDateSpan,
        )
      }),
    )

    await waitFor(() => expect(window.location.href).toBe(`${URL_BASE}?impactAnalysisTab=sast`))
  })
})
