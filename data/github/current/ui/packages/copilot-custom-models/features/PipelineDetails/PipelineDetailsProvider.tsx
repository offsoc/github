import {createContext, useContext, useMemo, type PropsWithChildren} from 'react'
import type {PipelineDetails} from '../../types'
import {CancelDialogProvider} from '../../components/CancelDialogProvider'
import {DeleteDialogProvider} from '../../components/DeleteDialogProvider'
import {usePipelinePolling} from '../../hooks/use-pipeline-polling'
import {isPipelineCancelable, isPipelinePollable} from '../../utils'

interface PipelineWithLogic extends PipelineDetails {
  canCancel: boolean
  canDelete: boolean
  canRetrain: boolean
}

interface IContext {
  adminEmail: string
  bannerPipeline: PipelineWithLogic
  canViewDetails: boolean
  cardPipeline: PipelineWithLogic
  hasAnyDeployed: boolean
  isStale: boolean
  isViewingDetails: boolean
  org: string
}

interface Props extends PropsWithChildren {
  adminEmail: string
  hasAnyDeployed: boolean
  isStale?: boolean
  isViewingDetails?: boolean
  org: string
  pipelineForBanner: PipelineDetails
  pipelineForCard: PipelineDetails
  withinRateLimit: boolean
}

const Context = createContext<IContext | null>(null)

export function PipelineDetailsProvider({
  adminEmail,
  children,
  hasAnyDeployed,
  isStale = false,
  isViewingDetails = false,
  org,
  pipelineForBanner: initialPipelineForBanner,
  pipelineForCard: initialPipelineDetails,
  withinRateLimit,
}: Props) {
  const pipelineForBanner = usePipelinePolling({pipeline: initialPipelineForBanner})
  const pipelineForCard = usePipelinePolling({pipeline: initialPipelineDetails})

  const bannerPipeline = useMemo(() => {
    const canCancel = isPipelineCancelable(pipelineForBanner)
    const canDelete = withinRateLimit && pipelineForBanner.status === 'PIPELINE_STATUS_COMPLETED'
    const canRetrain = withinRateLimit && !isPipelinePollable(pipelineForBanner)

    return {...pipelineForBanner, canCancel, canDelete, canRetrain}
  }, [pipelineForBanner, withinRateLimit])

  const cardPipeline = useMemo(() => {
    const canCancel = isPipelineCancelable(pipelineForCard)
    const canDelete = withinRateLimit && pipelineForCard.status === 'PIPELINE_STATUS_COMPLETED'
    const canRetrain = withinRateLimit && !isPipelinePollable(pipelineForCard)

    return {...pipelineForCard, canCancel, canDelete, canRetrain}
  }, [pipelineForCard, withinRateLimit])

  const canViewDetails = !isViewingDetails

  const value = useMemo(
    () => ({
      adminEmail,
      bannerPipeline,
      canViewDetails,
      cardPipeline,
      children,
      hasAnyDeployed,
      isStale,
      isViewingDetails,
      org,
      pipelineForBanner,
      pipelineForCard,
    }),
    [
      adminEmail,
      bannerPipeline,
      canViewDetails,
      cardPipeline,
      children,
      hasAnyDeployed,
      isStale,
      isViewingDetails,
      org,
      pipelineForBanner,
      pipelineForCard,
    ],
  )

  return (
    <CancelDialogProvider>
      <DeleteDialogProvider pipelineDetails={pipelineForCard}>
        <Context.Provider value={value}>{children}</Context.Provider>
      </DeleteDialogProvider>
    </CancelDialogProvider>
  )
}

export function usePipelineDetails() {
  const context = useContext(Context)

  if (!context) {
    throw new Error('usePipelineDetails must be used within <PipelineDetailsProvider />')
  }

  return context
}
