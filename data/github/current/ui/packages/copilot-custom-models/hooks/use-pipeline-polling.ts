import {useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {isPipelinePollable} from '../utils'
import type {PipelineDetails, PipelineItem} from '../types'
import type {ShowPathJsonResponse} from '../routes/Show/types'

interface PipelineItemProps {
  pipeline: PipelineItem
}

interface PipelineDetailsProps {
  pipeline: PipelineDetails
}

type Props = PipelineItemProps | PipelineDetailsProps

const INTERVAL_MS = 10000

// If a PipelineDetails is provided, the response will always be a PipelineDetails because it was a PipelineDetails
// before and after polling.
// If a PipelineItem is provided, the response will be either a PipelineItem (before polling) or a PipelineDetails
// (after polling).
export function usePipelinePolling(props: PipelineDetailsProps): PipelineDetails
export function usePipelinePolling(props: PipelineItemProps): PipelineItem | PipelineDetails

export function usePipelinePolling({pipeline: routePayloadPipeline}: Props) {
  const [initialPipeline] = useState(routePayloadPipeline)

  const isPollingEnabled = isPipelinePollable(initialPipeline)
  const {showPath} = initialPipeline

  const {data: updatedPipeline} = useQuery({
    enabled: !!isPollingEnabled,
    queryKey: ['pipeline-poll', showPath],
    queryFn: async () => {
      const response: Response = await verifiedFetch(showPath)
      if (!response.ok) throw new Error(`HTTP ${response.status}${response.statusText}`)

      const {payload} = (await response.json()) as ShowPathJsonResponse
      return payload.pipelineDetails
    },
    refetchInterval: INTERVAL_MS,
  })

  if (!updatedPipeline) return initialPipeline

  // If polling has stopped, we want to ensure all components are rendered correctly. The simplest way to do this
  // is to reload the page.
  if (!isPipelinePollable(updatedPipeline)) window.location.reload()

  return updatedPipeline
}
