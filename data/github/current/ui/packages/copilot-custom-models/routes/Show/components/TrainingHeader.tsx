import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {RoutePayload} from '../types'
import {isPipelineCancelable} from '../../../utils'
import {Header} from '../../../components/Header'
import {Breadcrumbs, Button} from '@primer/react'
import {useCancelDialog} from '../../../components/CancelDialogProvider'
import {usePipelineDetails} from '../../../features/PipelineDetails'

export function TrainingHeader() {
  const {
    indexPath,
    organization: {slug},
  } = useRoutePayload<RoutePayload>()
  const {cardPipeline: pipelineDetails} = usePipelineDetails()
  const {cancelPath} = pipelineDetails
  const {openDialogForCancelPath} = useCancelDialog()

  const canCancel = isPipelineCancelable(pipelineDetails)

  return (
    <div>
      <Breadcrumbs>
        <Breadcrumbs.Item href={indexPath}>Custom model</Breadcrumbs.Item>
        <Breadcrumbs.Item selected>Training details</Breadcrumbs.Item>
      </Breadcrumbs>

      <Header
        action={
          canCancel ? (
            <Button onClick={() => openDialogForCancelPath(cancelPath)} variant="danger">
              Cancel training
            </Button>
          ) : undefined
        }
        text={`Training run for ${slug} model`}
      />
    </div>
  )
}
