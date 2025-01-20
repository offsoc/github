import {announce} from '@github-ui/aria-live'
import {Box} from '@primer/react'
import {useCallback, useMemo} from 'react'
import {type To, useLocation} from 'react-router-dom'

import type {MemexChartTimePeriod} from '../../../../api/charts/contracts/api'
import {END_DATE_PARAM, PERIOD_PARAM, START_DATE_PARAM} from '../../../../platform/url'
import {Link} from '../../../../router'
import {InsightsResources} from '../../../../strings'

interface PeriodOption {
  value: MemexChartTimePeriod
  text?: string
  ariaLabel?: string
}

const PERIOD_OPTIONS: Array<PeriodOption> = [
  {value: '2W', ariaLabel: 'Last 2 weeks'},
  {value: '1M', ariaLabel: 'Last month'},
  {value: '3M', ariaLabel: 'Last 3 months'},
  {text: 'Max', value: 'max'},
]

function PeriodNavigationLink({
  periodValue,
  selected,
  children,
  'aria-label': ariaLabel,
}: {
  periodValue: MemexChartTimePeriod
  selected: boolean
  children: string
  'aria-label'?: string
}) {
  const location = useLocation()

  const to: To = useMemo(() => {
    const nextParams = new URLSearchParams(location.search)
    nextParams.set(PERIOD_PARAM, periodValue)
    nextParams.delete(START_DATE_PARAM)
    nextParams.delete(END_DATE_PARAM)
    return {
      pathname: location.pathname,
      search: nextParams.toString(),
    }
  }, [periodValue, location.pathname, location.search])

  const announceLink = useCallback(
    () => announce(InsightsResources.periodNavigationLinkAnnouncement(ariaLabel ?? children)),
    [ariaLabel, children],
  )

  return (
    <li>
      <Box
        key={periodValue}
        as={Link}
        aria-current={selected}
        aria-label={ariaLabel}
        to={to}
        onClick={announceLink}
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          borderRadius: '6px',
          minHeight: '30px',
          textDecoration: 'none',
          color: selected ? 'fg.onEmphasis' : 'fg.default',
          backgroundColor: selected ? 'accent.emphasis' : 'transparent',
          borderColor: selected ? 'accent.emphasis' : 'transparent',
          ':focus-visible': {
            outlineOffset: '1px',
          },
          '&:hover': {
            textDecoration: 'none', // Repeated here to ensure it overrides browser default styles
            backgroundColor: selected ? 'accent.emphasis' : 'canvas.subtle',
          },
        }}
      >
        {children}
      </Box>
    </li>
  )
}

export function PeriodNavigation({period}: {period: MemexChartTimePeriod}) {
  return (
    <nav aria-label="Time period">
      <Box as="ul" sx={{listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: 2}}>
        {PERIOD_OPTIONS.map((periodValue, periodIndex) => (
          <PeriodNavigationLink
            key={periodValue.value}
            periodValue={periodValue.value}
            selected={period === periodValue.value || (!period && periodIndex === 0)}
            aria-label={periodValue.ariaLabel}
          >
            {periodValue.text ?? periodValue.value}
          </PeriodNavigationLink>
        ))}
      </Box>
    </nav>
  )
}
