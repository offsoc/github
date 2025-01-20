import {ListView} from '@github-ui/list-view'
import {ListViewMetadata} from '@github-ui/list-view/ListViewMetadata'
import type {PipelineDetails, PipelineItem} from '../../../../types'
import {PipelineListItem} from './PipelineListItem'
import {Box, Text} from '@primer/react'
import {CancelDialogProvider} from '../../../../components/CancelDialogProvider'
import {PipelineBannerListItem} from '../../../../features/PipelineBanner'

interface Props {
  deployedPipeline?: PipelineDetails
  org: string
  pipelines: PipelineItem[]
}

export function PipelineList({deployedPipeline, org, pipelines}: Props) {
  const suffix = pipelines.length === 1 ? 'training run' : 'training runs'
  const title = `${pipelines.length} ${suffix}`

  return (
    <CancelDialogProvider>
      <Box sx={{borderStyle: 'solid', borderWidth: '1px', borderColor: 'border.default', borderRadius: '6px'}}>
        <ListView metadata={<ListViewMetadata title={<Text sx={{fontWeight: 'normal'}}>{title}</Text>} />} title="">
          <PipelineBannerListItem />
          {pipelines.map(pipeline => (
            <PipelineListItem
              key={`${pipeline.id}-${pipeline.status}`}
              isDeployedPipeline={pipeline.id === deployedPipeline?.id}
              org={org}
              pipeline={pipeline}
            />
          ))}
        </ListView>
      </Box>
    </CancelDialogProvider>
  )
}
