import DataCard from '@github-ui/data-card'
import {useEffect, useState} from 'react'

import {usePaths} from '../../common/contexts/Paths'
import {tryFetchJson} from '../../common/utils/fetch-json'
import type CardProps from '../types/card-props'

interface NoDataResponse {
  noData: string
}

interface CountsResponse {
  suggestionCount: number
}

type FetchResponse = NoDataResponse | CountsResponse

function isNoDataResponse(response: FetchResponse): response is NoDataResponse {
  return response.hasOwnProperty('noData')
}

const defaultSx = Object.freeze({})
export function AutofixSuggestionsCard({startDate, endDate, query = '', sx = defaultSx}: CardProps): JSX.Element {
  const [total, setTotal] = useState(0)
  const [cardState, setCardState] = useState('loading')

  const paths = usePaths()

  useEffect(() => {
    async function fetchSecretsBlocked(): Promise<void> {
      setCardState('loading')

      const url = paths.autofixSuggestionsPath({startDate, endDate, query})
      const data = await tryFetchJson<FetchResponse>(url)

      if (data == null) {
        setCardState('error')
        return
      }

      if (isNoDataResponse(data)) {
        setCardState('no-data')
        return
      }

      setTotal(data.suggestionCount)
      setCardState('done')
    }

    fetchSecretsBlocked()
  }, [paths, query, startDate, endDate])

  return (
    <DataCard
      cardTitle="Copilot Autofix suggestions"
      error={cardState === 'error'}
      loading={cardState === 'loading'}
      noData={cardState === 'no-data'}
      sx={sx}
    >
      <DataCard.Counter count={total} />
      <DataCard.Description>Total autofix suggestions by CodeQL in open and closed pull requests</DataCard.Description>
    </DataCard>
  )
}
