import {testIdProps} from '@github-ui/test-id-props'
import {MilestoneIcon} from '@primer/octicons-react'
import {Octicon} from '@primer/react'
import type {ItemProps} from '@primer/react/lib-esm/deprecated/ActionList'
import {useCallback} from 'react'

import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import {MilestoneState} from '../../api/common-contracts'
import type {SuggestedMilestone} from '../../api/memex-items/contracts'
import type {SidePanelItem} from '../../api/memex-items/side-panel-item'
import {milestoneDueText} from '../../helpers/milestone-due-text'
import {useFetchSuggestedMilestones} from '../../state-providers/suggestions/use-fetch-suggested-milestones'
import {useUpdateItem} from '../use-update-item'

export const getTitle = (option: SuggestedMilestone) => {
  return option.title
}

export const convertOptionToItem = (option: SuggestedMilestone): ItemProps & SuggestedMilestone => {
  const isOpenMilestone = option.state === MilestoneState.Open
  return {
    ...option,
    leadingVisual() {
      return (
        <Octicon
          icon={MilestoneIcon}
          aria-label={isOpenMilestone ? 'Open milestone' : 'Closed milestone'}
          sx={{color: 'fg.muted'}}
        />
      )
    },
    text: option.title,
    description: milestoneDueText(option),
    descriptionVariant: 'block',
    groupId: isOpenMilestone ? 'open' : 'closed',
    ...testIdProps('table-cell-editor-row'),
  }
}

type UseMilestoneEditorProps = {
  model: SidePanelItem
  onSaved?: () => void
}

export function useMilestoneEditor({model, onSaved}: UseMilestoneEditorProps) {
  const {updateItem} = useUpdateItem()
  const {fetchSuggestedMilestones} = useFetchSuggestedMilestones()

  const fetchOptions = useCallback(() => {
    fetchSuggestedMilestones(model)
  }, [model, fetchSuggestedMilestones])

  const saveSelected = useCallback(
    async (nextSelected: Array<SuggestedMilestone>) => {
      await updateItem(model, {
        dataType: MemexColumnDataType.Milestone,
        value: nextSelected[0],
      })
      if (onSaved) {
        onSaved()
      }
    },
    [model, onSaved, updateItem],
  )

  return {
    fetchOptions,
    saveSelected,
  }
}
