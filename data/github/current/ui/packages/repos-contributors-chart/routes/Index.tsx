import {Suspense, lazy, useCallback, useEffect, useMemo, useState} from 'react'
import {ActionList, ActionMenu, Label, Link, Spinner} from '@primer/react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {RangeSelection} from '@github-ui/date-picker'
import {RangePicker} from '../components/RangePicker'
import {fetchJsonPoll} from '../helpers/fetch-json-poll'
import type {Axis, Contributor, Metric, RawContributor} from '../repos-contributors-chart-types'
import {mergeWeeksFromContributors} from '../helpers/merge-weeks-from-contributors'

import styles from './Index.module.css'
import {transformWeeks} from '../helpers/transform-weeks'
import {computeMetricsFromWeeks} from '../helpers/compute-metrics-from-weeks'
import {getWeekRangeIndices} from '../helpers/get-week-range-indices'

const ReposContributorsChart = lazy(async () => import('../components/ReposContributorsChart'))

export type IndexProps = {
  graphDataPath: string
  isUsingContributionInsights: boolean
  defaultBranch: string
}

const METRICS: {[key in Metric]: string} = {
  commits: 'Commits',
  additions: 'Additions',
  deletions: 'Deletions',
}

export const Index = () => {
  const [axis, setAxis] = useState<Axis | undefined>()
  const {graphDataPath, isUsingContributionInsights, defaultBranch} = useRoutePayload<IndexProps>()
  const [isLoaded, setIsLoaded] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [contributors, setContributors] = useState<RawContributor[]>([])
  const [selectedMetric, setSelectedMetric] = useState<Metric>('commits')
  const [rangeSelection, setRangeSelection] = useState<RangeSelection | undefined>()
  const {summaryWeeks, summaryMetrics, from, to} = useMemo(() => {
    const weeks = mergeWeeksFromContributors(contributors)
    const range = getWeekRangeIndices({weeks, rangeSelection})
    const slicedWeeks = weeks.slice(range.from, range.to + 1)
    const metrics = computeMetricsFromWeeks(slicedWeeks)
    return {
      summaryWeeks: slicedWeeks,
      summaryMetrics: metrics,
      from: range.from,
      to: range.to,
    }
  }, [contributors, rangeSelection])

  const mappedContributors = useMemo<Contributor[]>(
    () =>
      contributors
        .map(({author, weeks: _weeks}) => {
          const transformedWeeks = transformWeeks(_weeks)
          const slicedWeeks = transformedWeeks.slice(from, to + 1)
          const {totals, metrics} = computeMetricsFromWeeks(slicedWeeks)
          if (totals.commits === 0) {
            return null
          }
          return {
            author,
            weeks: slicedWeeks,
            totals,
            metrics,
          }
        })
        .filter(contributor => !!contributor)
        .sort((a, b) => (a.totals[selectedMetric] - b.totals[selectedMetric] < 0 ? 1 : -1)),
    [contributors, selectedMetric, from, to],
  )

  const indexOfMaxIndividualMetricAuthor = useMemo(() => {
    const maxAuthor = mappedContributors.reduce(
      (currentMax, contributor, index) => {
        const authorMax = Math.max(...contributor.weeks.map(week => week[selectedMetric]))
        if (authorMax > currentMax.max) {
          return {
            index,
            max: authorMax,
          }
        }
        return currentMax
      },
      {max: 0, index: 0},
    )
    return maxAuthor.index
  }, [mappedContributors, selectedMetric])

  const minDate = new Date((contributors[0]?.weeks[0]?.w ?? 0) * 1000)

  useEffect(() => {
    async function getContributors() {
      const response = await fetchJsonPoll(graphDataPath)
      if (response.ok) {
        const results: RawContributor[] = await response.json()
        setContributors(results)
      } else {
        const {unusable} = await response.json()
        if (unusable) {
          setErrorMessage('Data is unusable')
        } else {
          setErrorMessage('There was an error fetching the data')
        }
      }
      setIsLoaded(true)
    }
    getContributors()
  }, [graphDataPath])

  const onRangeChange = useCallback(
    (selection?: RangeSelection | null) => {
      setRangeSelection(selection ?? undefined)
    },
    [setRangeSelection],
  )

  if (errorMessage) {
    return (
      <div className="text-center p-3">
        <div className="msg">
          <p>{errorMessage}</p>
        </div>
      </div>
    )
  }

  if (isLoaded && summaryWeeks.length === 0) {
    return null
  }

  if (!isLoaded) {
    return (
      <div className="text-center p-3">
        <Spinner />
        <div className="graph-loading msg">
          <p>Crunching the latest data, just for you. Hang tight…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex flex-wrap flex-justify-between">
        <div className={styles.titleContainer}>
          <h1 className="h2 d-flex flex-row flex-items-center gap-2 flex-wrap">
            <span>Contributors</span>
            <div className="d-flex flex-items-center gap-1">
              <Label variant="success">Beta</Label>
              <Link href="https://gh.io/repos-charts-feedback" className="f5 text-normal">
                Give feedback
              </Link>
            </div>
          </h1>
          <p className="color-fg-muted">
            {!isUsingContributionInsights ? (
              <>Contributions per week to {defaultBranch}, excluding merge commits</>
            ) : (
              <>
                Contributions per week to {defaultBranch}, line counts have been omitted because commit count exceeds
                10,000.
              </>
            )}
          </p>
        </div>
        <div className="d-flex gap-2">
          <RangePicker value={rangeSelection ?? undefined} onChange={onRangeChange} minDate={minDate} />
          {!isUsingContributionInsights ? (
            <ActionMenu>
              <ActionMenu.Button>
                <span className="color-fg-muted">Contributions:</span> {METRICS[selectedMetric]}
              </ActionMenu.Button>
              <ActionMenu.Overlay width="auto">
                <ActionList selectionVariant="single">
                  {Object.keys(METRICS).map(metric => (
                    <ActionList.Item
                      key={metric}
                      selected={selectedMetric === metric}
                      onSelect={() => {
                        setSelectedMetric(metric as Metric)
                      }}
                    >
                      {METRICS[metric as Metric]}
                    </ActionList.Item>
                  ))}
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          ) : null}
        </div>
      </div>
      <div key={selectedMetric} className="d-flex flex-column gap-3">
        <Suspense>
          <ReposContributorsChart
            selectedMetric={selectedMetric}
            weeks={summaryWeeks}
            onlyCommits={isUsingContributionInsights}
            {...summaryMetrics}
          />
        </Suspense>
        <ul className={styles.chartList}>
          {mappedContributors.map((contributor, index) => (
            <li key={contributor.author.id} className={styles.chartListItem}>
              <Suspense>
                <ReposContributorsChart
                  {...contributor}
                  place={index + 1}
                  selectedMetric={selectedMetric}
                  onlyCommits={isUsingContributionInsights}
                  axis={index === indexOfMaxIndividualMetricAuthor ? undefined : axis}
                  setAxis={index === indexOfMaxIndividualMetricAuthor ? setAxis : undefined}
                />
              </Suspense>
            </li>
          ))}
          {mappedContributors.length % 2 !== 0 && <li className={styles.chartListItem} />}
        </ul>
      </div>
    </div>
  )
}
