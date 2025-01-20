import type {RangeSelection} from '@github-ui/date-picker'
import type {FilterProvider} from '@github-ui/filter'
import {SingleSignOnBanner} from '@github-ui/single-sign-on-banner'
import {useSso} from '@github-ui/use-sso'
import {InfoIcon} from '@primer/octicons-react'
import {Text} from '@primer/react'
import {parseISO} from 'date-fns'
import {useCallback, useMemo, useState} from 'react'

import {
  type DateSpan,
  dateSpansAreEqual,
  isPeriodSelection,
  isRangeSelection,
} from '../common/components/date-span-picker'
import PageLayout from '../common/components/page-layout'
import {useDirtyStateTracking} from '../common/hooks/use-dirty-state-tracking'
import {toUTCDateString} from '../common/utils/date-formatter'
import {calculateDateRangeFromPeriod, type Period} from '../common/utils/date-period'
import {PushProtectionMetrics} from './components/PushProtectionMetrics'
import {useUpdateUrl} from './hooks/use-update-url'

export interface SecretScanningMetricsProps {
  initialQuery?: string
  initialDateSpan?: Period | {from: string; to: string}
  feedbackUrl: string
  feedbackText: string
  showIncompleteDataWarning?: boolean
  incompleteDataWarningDocHref?: string
  filterProviders: FilterProvider[]
  allowOwnerTypeFiltering?: boolean
}

export const DEFAULT_DATE_SPAN: Period = {period: 'last30days'}

// Setting min allowed date with the date (Feb 12th, 2023) at which we started collecting push protection metrics on Cloud.
export const MINIMUM_ALLOWED_DATE = '2023-02-12'

const DEFAULT_QUERY: string = ''

function toDateSpan(dateSpan: DateSpan | {from: string; to: string}): DateSpan {
  if (isPeriodSelection(dateSpan)) {
    return dateSpan
  }

  return {
    from: new Date(dateSpan.from),
    to: new Date(dateSpan.to),
  }
}

export function SecretScanningMetrics({
  initialQuery,
  initialDateSpan,
  feedbackUrl,
  feedbackText,
  showIncompleteDataWarning,
  incompleteDataWarningDocHref,
  filterProviders,
}: SecretScanningMetricsProps): JSX.Element {
  const {ssoOrgs} = useSso()
  const ssoOrgNames: string[] = ssoOrgs.map(o => o['login']).filter((n): n is string => n !== undefined)

  // track selected filter state
  const [query, setQuery] = useState(initialQuery ?? DEFAULT_QUERY)
  const [queryIsDirty, resetQueryIsDirty] = useDirtyStateTracking(query, DEFAULT_QUERY, !!initialQuery)

  // track selected date span state
  const [dateSpan, setDateSpan] = useState<DateSpan>(
    initialDateSpan != null ? toDateSpan(initialDateSpan) : DEFAULT_DATE_SPAN,
  )
  const [dateSpanIsDirty, resetDateSpanIsDirty] = useDirtyStateTracking(
    dateSpan,
    DEFAULT_DATE_SPAN,
    !!initialDateSpan,
    dateSpansAreEqual,
  )
  const dateRange = useMemo(() => {
    if (isRangeSelection(dateSpan)) {
      return dateSpan
    } else {
      return calculateDateRangeFromPeriod(dateSpan)
    }
  }, [dateSpan])
  const minAllowedDate = useMemo(() => new Date(MINIMUM_ALLOWED_DATE), [])
  const noData = useMemo(() => dateRange.to <= minAllowedDate, [dateRange, minAllowedDate])
  const startDateString = useMemo(
    () => toUTCDateString(!noData && dateRange.from < minAllowedDate ? minAllowedDate : dateRange.from),
    [dateRange, noData, minAllowedDate],
  )
  const endDateString = useMemo(() => toUTCDateString(dateRange.to), [dateRange])

  useUpdateUrl(query, queryIsDirty, dateSpan, dateSpanIsDirty)

  const onRevert = (): void => {
    setQuery(DEFAULT_QUERY)
    resetQueryIsDirty()
    setDateSpan(DEFAULT_DATE_SPAN)
    resetDateSpanIsDirty()
  }

  const dateSpanPickerCallback = useCallback((selection: RangeSelection | Period) => {
    if (isRangeSelection(selection) && selection.from === selection.to) {
      setDateSpan(DEFAULT_DATE_SPAN)
    } else {
      setDateSpan(selection)
    }
  }, [])

  const footerNote = 'All data is in UTC (GMT) time.'

  return (
    <PageLayout>
      {ssoOrgNames.length > 0 && (
        <PageLayout.Banners>
          <SingleSignOnBanner protectedOrgs={ssoOrgNames} />
        </PageLayout.Banners>
      )}

      <PageLayout.Header title="Secret scanning" feedbackLink={{text: feedbackText, url: feedbackUrl}} />

      <PageLayout.FilterBar
        filter={<PageLayout.Filter providers={filterProviders} query={query} onSubmit={setQuery} />}
        datePicker={
          <PageLayout.DatePicker
            value={dateSpan}
            onChange={dateSpanPickerCallback}
            watermarkDate={parseISO(MINIMUM_ALLOWED_DATE)}
          />
        }
        revert={<PageLayout.FilterRevert show={queryIsDirty || dateSpanIsDirty} onRevert={onRevert} />}
      />

      <PageLayout.LimitedRepoWarning show={!!showIncompleteDataWarning} href={incompleteDataWarningDocHref || ''} />

      <PageLayout.Content>
        <PushProtectionMetrics startDate={startDateString} endDate={endDateString} query={query} noData={noData} />
      </PageLayout.Content>

      <PageLayout.Footer>
        <Text as="p" className="color-fg-muted" sx={{textAlign: 'center', width: '100%', display: 'block'}}>
          <InfoIcon /> {footerNote}
        </Text>
      </PageLayout.Footer>
    </PageLayout>
  )
}
