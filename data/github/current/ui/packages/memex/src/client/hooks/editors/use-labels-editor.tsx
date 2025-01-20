import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'
import type {ItemProps} from '@primer/react/lib-esm/deprecated/ActionList'
import {useCallback} from 'react'

import {MemexColumnDataType} from '../../api/columns/contracts/memex-column'
import type {SuggestedLabel} from '../../api/memex-items/contracts'
import type {SidePanelItem} from '../../api/memex-items/side-panel-item'
import {SanitizedHtml} from '../../components/dom/sanitized-html'
import {useFetchSuggestedLabels} from '../../state-providers/suggestions/use-fetch-suggested-labels'
import {useUpdateItem} from '../use-update-item'

export const getNameHtml = (option: SuggestedLabel) => {
  return option.nameHtml
}

export const convertOptionToItem = (option: SuggestedLabel): ItemProps & SuggestedLabel => {
  const ItemContent = <SanitizedHtml sx={{display: 'block'}}>{option.nameHtml}</SanitizedHtml>
  const color = `#${option.color}`
  return {
    ...option,
    leadingVisual() {
      return (
        <Box
          sx={{
            bg: color,
            borderColor: color,
            width: 14,
            height: 14,
            borderRadius: 10,
            borderWidth: '1px',
            borderStyle: 'solid',
          }}
        />
      )
    },
    children: ItemContent,
    ...testIdProps('table-cell-editor-row'),
  }
}

type UseLabelsEditorProps = {
  model: SidePanelItem
  onSaved?: () => void
}

export function useLabelsEditor({model, onSaved}: UseLabelsEditorProps) {
  const {updateItem} = useUpdateItem()
  const {fetchSuggestedLabels} = useFetchSuggestedLabels()

  const fetchOptions = useCallback(() => {
    fetchSuggestedLabels(model)
  }, [model, fetchSuggestedLabels])

  const saveSelected = useCallback(
    async (nextSelected: Array<SuggestedLabel>) => {
      await updateItem(model, {
        dataType: MemexColumnDataType.Labels,
        value: nextSelected,
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
