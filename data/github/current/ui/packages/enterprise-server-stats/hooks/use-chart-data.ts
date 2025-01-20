import {useEffect, useMemo, useState} from 'react'
// eslint-disable-next-line no-restricted-imports
import {reportError} from '@github-ui/failbot'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import type {HeroStatData, SeriesData, TimePeriod} from '../types'

interface Options {
  enterpriseSlug: string
  period: TimePeriod
  server: string
}

interface State {
  loading: boolean
  error?: string
  data?: RawData
}

export enum StatKey {
  Issues = 'issues',
  Pulls = 'pulls',
  Repos = 'repos',
  Users = 'users',
  Orgs = 'orgs',
}

interface ChartConfig {
  title: string
}

const chartsConfig: Record<StatKey, ChartConfig> = {
  [StatKey.Issues]: {
    title: 'Issues',
  },
  [StatKey.Pulls]: {
    title: 'Pull Requests',
  },
  [StatKey.Repos]: {
    title: 'Repositories',
  },
  [StatKey.Users]: {
    title: 'Users',
  },
  [StatKey.Orgs]: {
    title: 'Orgs & Teams',
  },
}

export interface RawData {
  heroStats: HeroStatData[]
  series: SeriesData
}

interface Response {
  data: RawData
}

interface FetchOptions {
  enterpriseSlug: string
  period: string
  server: string
  statKey: StatKey
}

const fetchChartData = async ({enterpriseSlug, period, server, statKey}: FetchOptions): Promise<Response> => {
  try {
    const search = new URLSearchParams({period, server}).toString()
    const res = await verifiedFetchJSON(
      `/enterprises/${enterpriseSlug}/enterprise_installations/server_stats/${statKey}?${search}`,
    )
    if (res.ok) {
      return res.json()
    } else {
      throw new Error(res.statusText)
    }
  } catch (e) {
    reportError(new Error(`error fetching chart data: ${(e as Error)?.message ?? 'unknown error'}`))
    throw e
  }
}

const CHART_LOADING_STATE = {
  data: undefined,
  error: undefined,
  loading: true,
}

export function useChartData(statKey: StatKey, {enterpriseSlug, server, period}: Options) {
  const [chartState, setChartState] = useState<State>(CHART_LOADING_STATE)

  useEffect(() => {
    setChartState(CHART_LOADING_STATE)
    const handleFetch = async () => {
      let data: Response | undefined
      let error = undefined
      try {
        data = await fetchChartData({enterpriseSlug, period, server, statKey})
      } catch (e: unknown) {
        error = (e as Error)?.message || 'error fetching chart data'
      }
      setChartState({error, loading: false, ...data})
    }

    handleFetch()
  }, [enterpriseSlug, period, server, statKey])

  const chartData = useMemo(() => ({...chartState, statKey, title: chartsConfig[statKey].title}), [chartState, statKey])

  return chartData
}
