import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'
import type {ItemProps} from '@primer/react/lib-esm/deprecated/ActionList'
import {useCallback} from 'react'

import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import type {SuggestedIssueType} from '../../api/memex-items/contracts'
import type {SidePanelItem} from '../../api/memex-items/side-panel-item'
import {ColorDecorator} from '../../components/fields/single-select/color-decorator'
import {useFetchSuggestedIssueTypes} from '../../state-providers/suggestions/use-fetch-suggested-issue-types'
import {useUpdateItem} from '../use-update-item'

export const convertOptionToItem = (option: SuggestedIssueType): ItemProps & SuggestedIssueType => ({
  ...option,
  ...testIdProps('table-cell-editor-row'),
  children: (
    <>
      <Box sx={{display: 'block'}}>{option.name}</Box>
      <Box sx={{display: 'block', color: 'fg.muted', fontSize: '12px', lineHeight: '16px', wordBreak: 'break-word'}}>
        {option.description}
      </Box>
    </>
  ),
  description: '',
  leadingVisual: () => <ColorDecorator color={option.color || 'GRAY'} sx={{height: '14px', width: '14px'}} />,
  descriptionVariant: 'block',
})

export const getName = (option: SuggestedIssueType) => {
  return option.name
}

type UseTypeEditorProps = {
  model: SidePanelItem
  onSaved?: () => void
}

export function useIssueTypeEditor({model, onSaved}: UseTypeEditorProps) {
  const {updateItem} = useUpdateItem()
  const {fetchSuggestedIssueTypes} = useFetchSuggestedIssueTypes()

  const fetchOptions = useCallback(() => {
    fetchSuggestedIssueTypes(model)
  }, [model, fetchSuggestedIssueTypes])

  const saveSelected = useCallback(
    async (nextSelected: Array<SuggestedIssueType>) => {
      await updateItem(model, {
        dataType: MemexColumnDataType.IssueType,
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
