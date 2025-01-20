import type {PipelineItem} from '../../../../types'
import {ListItem} from '@github-ui/list-view/ListItem'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemActionBar} from '@github-ui/list-view/ListItemActionBar'
import {ActionList, Octicon} from '@primer/react'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemLeadingVisual} from '@github-ui/list-view/ListItemLeadingVisual'
import {RepoIcon} from '@primer/octicons-react'
import {ListItemDescriptionItem} from '@github-ui/list-view/ListItemDescriptionItem'
import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {useNavigateWithFlashBanner} from '../../../../features/NavigateWithFlashBanner'
import {isPipelineCancelable} from '../../../../utils'
import {format, formatDistance} from 'date-fns'
import {deployedLeadingVisual, leadingVisualMap} from './leading-visual-map'
import {usePipelinePolling} from '../../../../hooks/use-pipeline-polling'
import {useCancelDialog} from '../../../../components/CancelDialogProvider'
import {ListItemTrailingBadge} from '@github-ui/list-view/ListItemTrailingBadge'

interface Props {
  isDeployedPipeline: boolean
  org: string
  pipeline: PipelineItem
}

const deployedTrailingBadges = [<ListItemTrailingBadge key={0} title="Deployed" variant="success" />]

export function PipelineListItem({isDeployedPipeline, org, pipeline: initialPipeline}: Props) {
  const {navigate} = useNavigateWithFlashBanner()
  const pipeline = usePipelinePolling({pipeline: initialPipeline})
  const {openDialogForCancelPath} = useCancelDialog()

  const {actorLogin, cancelPath, createdAt, repositoryCount, status} = pipeline

  const canCancel = isPipelineCancelable(pipeline)
  const handleClickCancel = () => openDialogForCancelPath(cancelPath)
  const handleClickViewDetails = () => navigate(pipeline.showPath)

  const viewDetails = {
    key: 'view-details',
    render: () => <ActionList.Item onSelect={handleClickViewDetails}>View details</ActionList.Item>,
  }
  const cancel = {
    key: 'cancel',
    render: () => (
      <ActionList.Item onSelect={handleClickCancel} variant="danger">
        Cancel training
      </ActionList.Item>
    ),
  }
  const staticMenuActions = canCancel ? [viewDetails, cancel] : [viewDetails]

  const {color, icon, label} = isDeployedPipeline ? deployedLeadingVisual : leadingVisualMap[status]

  const creator = actorLogin || 'System'
  const timeAgoInWords = createdAt ? formatDistance(Date.parse(createdAt), Date.now(), {addSuffix: true}) : ''
  const createdAtAriaLabel = createdAt ? format(Date.parse(createdAt), "EEEE, MMMM do, yyyy 'at' h:mm aaaa") : ''

  return (
    <ListItem
      aria-label={createdAtAriaLabel ? `Pipeline created on ${createdAtAriaLabel}` : undefined}
      metadata={
        <ListItemMetadata>
          <RepoIcon aria-label="Repository count" size={16} /> {repositoryCount.toLocaleString()}
        </ListItemMetadata>
      }
      secondaryActions={<ListItemActionBar label="pipeline actions" staticMenuActions={staticMenuActions} />}
      title={
        <ListItemTitle
          trailingBadges={isDeployedPipeline ? deployedTrailingBadges : undefined}
          value={`${org} model`}
        />
      }
    >
      <ListItemLeadingContent>
        <ListItemLeadingVisual>
          <Octicon aria-label={label} icon={icon} sx={{color, height: '16px', width: '16px'}} />
        </ListItemLeadingVisual>
      </ListItemLeadingContent>
      <ListItemMainContent>
        <ListItemDescription>
          <ListItemDescriptionItem>
            {creator} created {timeAgoInWords}
          </ListItemDescriptionItem>
        </ListItemDescription>
      </ListItemMainContent>
    </ListItem>
  )
}
