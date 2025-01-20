import {useCallback, useEffect, useRef, useState} from 'react'
import {Label, Link} from '@primer/react'
import {useParams} from 'react-router-dom'
import {ChartCard} from '@github-ui/chart-card'
import {GitHubAvatar} from '@github-ui/github-avatar'
import type {Author, Axis, Metric, SummarizedCommitMetrics, Totals, Week} from '../repos-contributors-chart-types'
import styles from './ReposContributorsChart.module.css'

const chartHeights: {[size: string]: string} = {
  medium: '256px',
  small: '128px',
}

export interface ReposContributorsChartProps {
  author?: Author
  weeks: Week[]
  totals: Totals
  metrics: SummarizedCommitMetrics
  selectedMetric: Metric
  onlyCommits?: boolean
  place?: number
  axis?: Axis
  setAxis?(axis: Axis): void
}

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}
const intersectionObserverOptions = {
  root: null,
  rootMargin: '20px',
  threshold: 0,
}

export default function ReposContributorsChart({
  author,
  weeks,
  totals,
  metrics,
  selectedMetric,
  onlyCommits = false,
  place,
  axis,
  setAxis,
}: ReposContributorsChartProps) {
  const metricDisplayName = `${selectedMetric.slice(0, 1).toUpperCase()}${selectedMetric.slice(1)}`
  const firstDate = weeks[0]?.date
  const lastDate = weeks.at(-1)?.date

  const isAcrossMultipleYears = firstDate?.getFullYear() !== lastDate?.getFullYear()

  const screenReaderTitleSuffix = `'s ${metricDisplayName}`
  const firstDateDisplay = firstDate?.toLocaleDateString(undefined, DATE_FORMAT_OPTIONS)
  const lastDateDisplay = lastDate?.toLocaleDateString(undefined, DATE_FORMAT_OPTIONS)

  const size = author ? 'small' : 'medium'

  const containerRef = useRef(null)
  const [isVisible, setIsVisible] = useState(!author)

  const onObserverUpdate: IntersectionObserverCallback = useCallback(
    entries => {
      const [entry] = entries
      setIsVisible(!!entry?.isIntersecting)
    },
    [setIsVisible],
  )

  useEffect(() => {
    const observer = new IntersectionObserver(onObserverUpdate, intersectionObserverOptions)
    const containerRefCurrent = containerRef.current
    if (containerRefCurrent) {
      if (isVisible) {
        observer.unobserve(containerRefCurrent)
      } else {
        observer.observe(containerRefCurrent)
      }
    }

    return () => {
      if (containerRefCurrent) observer.unobserve(containerRefCurrent)
    }
  }, [containerRef, isVisible, onObserverUpdate])

  return (
    <div ref={containerRef} style={{minHeight: chartHeights[size]}}>
      {isVisible ? (
        <ChartCard size={size}>
          <ChartCard.Title as="h2">
            {author ? (
              <span className="d-flex flex-items-center flex-justify-start">
                <Link href={author.path}>{author.login}</Link>
                <span className="sr-only">{screenReaderTitleSuffix}</span>
              </span>
            ) : (
              <span>{metricDisplayName} over time</span>
            )}
          </ChartCard.Title>
          <ChartCard.Description>
            {author ? (
              <AuthorDescription author={author} totals={totals} onlyCommits={onlyCommits} />
            ) : (
              <span>
                From {firstDateDisplay} to {lastDateDisplay}
              </span>
            )}
          </ChartCard.Description>
          {author ? (
            <ChartCard.LeadingVisual>
              <Link href={author.path} data-hovercard-url={author.hovercard_url}>
                <GitHubAvatar src={author.avatar} size={40} />
                <span className="sr-only">{author.login}</span>
              </Link>
            </ChartCard.LeadingVisual>
          ) : null}
          {place ? (
            <ChartCard.TrailingVisual>
              <Label>#{place}</Label>
            </ChartCard.TrailingVisual>
          ) : null}
          <ChartCard.Chart
            type="areaspline"
            series={[
              {
                type: 'areaspline',
                name: metricDisplayName,
                data: metrics[selectedMetric],
              },
            ]}
            xAxisTitle=""
            yAxisTitle="Contributions"
            plotOptions={{
              series: {
                marker: {
                  enabled: false,
                },
              },
            }}
            xAxisOptions={{
              type: 'datetime',
              labels: {
                format: `{value:%b %e${isAcrossMultipleYears ? ', %Y' : ''}}`,
              },
            }}
            yAxisOptions={{
              ...(axis
                ? {
                    min: axis?.min,
                    max: axis?.ceiling,
                  }
                : {}),
              endOnTick: false,
              tickAmount: author ? 1 : undefined,
              maxPadding: 0.2,
              events: {
                afterSetExtremes({min, max, dataMin, dataMax}) {
                  setAxis?.({floor: min, ceiling: max, min: dataMin, max: dataMax})
                },
              },
            }}
            tooltipOptions={{
              xDateFormat: '%e %b %Y',
            }}
          />
        </ChartCard>
      ) : null}
    </div>
  )
}

type AuthorDescriptionProps = {
  author: Author
  onlyCommits?: boolean
  totals: {
    additions: number
    deletions: number
    commits: number
  }
}
function AuthorDescription({
  author,
  onlyCommits = false,
  totals: {additions, deletions, commits},
}: AuthorDescriptionProps) {
  const {owner, repo} = useParams()
  const [prettyCommits, prettyAdditions, prettyDeletions] = [commits, additions, deletions].map(value =>
    value.toLocaleString(),
  )
  return (
    <div className={styles.authorDescriptionWrapper}>
      <Link href={`/${owner}/${repo}/commits?author=${encodeURIComponent(author.login)}`} muted>
        {prettyCommits} commit{commits > 1 ? 's' : ''}
      </Link>
      {!onlyCommits ? (
        <span className={styles.additionsDeletionsWrapper}>
          <span className="color-fg-success">{prettyAdditions} ++</span>
          <span className="color-fg-danger">{prettyDeletions} --</span>
        </span>
      ) : null}
    </div>
  )
}
