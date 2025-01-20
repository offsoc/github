import {ChecklistIcon} from '@primer/octicons-react'
import {Label, Text} from '@primer/react'

import type {ItemCompletion} from '../../../../api/memex-items/side-panel-item'
import {TracksResources} from '../../../../strings'
import {TracksToken} from '../../../fields/tracks/tracks-token'

type Props = Readonly<{
  completion?: ItemCompletion
}>

export const TracksLabel: React.FC<Props> = ({completion}) => {
  if (!completion || completion.total === 0) {
    return null
  }

  const {completed, total} = completion
  const {tasks} = TracksResources

  const description = tasks(completed, total)
  return !completed ? (
    <Label size="large" variant="secondary" sx={{display: 'flex', height: '25.5px', p: '5px 12px'}}>
      <ChecklistIcon size={16} />
      <Text as="div" sx={{m: '0 4px'}}>
        {description}
      </Text>
    </Label>
  ) : (
    <TracksToken progress={completion} description={description} size="large" />
  )
}
