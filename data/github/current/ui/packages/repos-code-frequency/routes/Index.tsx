import {Suspense, lazy, useEffect, useState} from 'react'
import {Label, Link, Spinner} from '@primer/react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useParams} from 'react-router-dom'
import {fetchJsonPoll} from '../helpers/fetch-json-poll'
import {AGGREGATE_KEY, type AggregateDataPoint, type MetricDataPoint} from '../types'
import styles from './Index.module.css'

const CodeFrequencyChart = lazy(() => import('../components/CodeFrequencyChart'))

export interface IndexPayload {
  graphDataPath: string
  isUsingContributionInsights: boolean
  tooLargeUrl: string
}

const TooLarge = () => {
  const {tooLargeUrl} = useRoutePayload<IndexPayload>()
  return (
    <div className={styles.tooLargeWrapper}>
      <h2 className="h3">There are too many commits to generate this graph.</h2>
      <p>
        More information about this data can be found in the{' '}
        <Link inline href={tooLargeUrl}>
          activity documentation
        </Link>
        .
      </p>
    </div>
  )
}

const ErrorMessage = ({errorMessage}: {errorMessage: string}) => (
  <div className="text-center p-3">
    <div className="msg">
      <p>{errorMessage}</p>
    </div>
  </div>
)

const Loading = () => (
  <div className="text-center p-3">
    <Spinner />
    <div className="graph-loading msg">
      <p>Crunching the latest data, just for you. Hang tight…</p>
    </div>
  </div>
)

export function Index() {
  const {graphDataPath, isUsingContributionInsights} = useRoutePayload<IndexPayload>()
  const {owner, repo} = useParams()
  const [isLoaded, setIsLoaded] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [additions, setAdditions] = useState<MetricDataPoint[]>([])
  const [deletions, setDeletions] = useState<MetricDataPoint[]>([])

  useEffect(() => {
    if (!graphDataPath || isUsingContributionInsights) {
      return
    }
    const fetcher = async () => {
      const response = await fetchJsonPoll(graphDataPath)
      if (response.ok) {
        const data: AggregateDataPoint[] = await response.json()
        setAdditions(
          data.map(aggregate => [aggregate[AGGREGATE_KEY.TIMESTAMP] * 1000, aggregate[AGGREGATE_KEY.ADDITIONS]]),
        )
        setDeletions(
          data.map(aggregate => [aggregate[AGGREGATE_KEY.TIMESTAMP] * 1000, aggregate[AGGREGATE_KEY.DELETIONS]]),
        )
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
    fetcher()
  }, [graphDataPath, isUsingContributionInsights])

  if (isUsingContributionInsights) {
    return <TooLarge />
  }

  if (errorMessage) {
    return <ErrorMessage errorMessage={errorMessage} />
  }

  if (isLoaded && additions.length === 0 && deletions.length === 0) {
    return null
  }

  if (!isLoaded) {
    return <Loading />
  }

  return (
    <>
      <h2 className="mb-4 text-normal d-flex flex-row flex-items-center gap-2 flex-wrap">
        <div>
          <span>Code frequency over the history of </span>
          <strong>
            {owner}/{repo}
          </strong>
        </div>
        <div className="d-flex flex-items-center gap-1">
          <Label variant="success">Beta</Label>
          <Link href="https://gh.io/repos-charts-feedback" className="f5">
            Give feedback
          </Link>
        </div>
      </h2>
      <Suspense>
        <CodeFrequencyChart additions={additions} deletions={deletions} />
      </Suspense>
    </>
  )
}
