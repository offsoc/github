import {testIdProps} from '@github-ui/test-id-props'
import {TriangleDownIcon} from '@primer/octicons-react'
import {type BoxProps, Button, SelectPanel} from '@primer/react'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import {useCallback, useMemo, useState} from 'react'

import {MemexWorkflowContentType} from '../../api/workflows/contracts'
import {assertNever} from '../../helpers/assert-never'
import {useAutomationGraph} from '../../state-providers/workflows/use-automation-graph'
import {Resources, WorkflowResources} from '../../strings'

function getDisplayTextFromMemexWorkflowContentType(value: MemexWorkflowContentType) {
  switch (value) {
    case MemexWorkflowContentType.PullRequest: {
      return Resources.pullRequest
    }
    case MemexWorkflowContentType.Issue: {
      return Resources.issue
    }
    default: {
      assertNever(value)
    }
  }
}

type ContentTypePickerProps = BoxProps & {
  onContentTypesSelected: (contentTypes: Array<MemexWorkflowContentType>) => void
  contentTypes: Array<MemexWorkflowContentType>
  isEditing?: boolean
  selectedContentTypes: Array<MemexWorkflowContentType>
  testId: string
}

export const ContentTypePicker: React.FC<ContentTypePickerProps> = ({
  selectedContentTypes,
  contentTypes,
  isEditing,
  onContentTypesSelected,
  testId,
  sx,
}) => {
  const {setIsWorkflowValid} = useAutomationGraph()

  const items = useMemo(
    () =>
      contentTypes.map((type: MemexWorkflowContentType) => ({
        text: getDisplayTextFromMemexWorkflowContentType(type),
        id: type,
      })),
    [contentTypes],
  )

  const [filter, setFilter] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const onClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const validate = useCallback(
    (selectedItems: Array<MemexWorkflowContentType>) => {
      if (selectedItems.length === 0) {
        setIsWorkflowValid(false)
      } else {
        setIsWorkflowValid(true)
      }
    },
    [setIsWorkflowValid],
  )

  const onSelectedChange = (selectedItems: Array<ItemInput>) => {
    const mappedItems = selectedItems.map(item => item.id)
    const filteredItems = mappedItems.filter(
      (item): item is MemexWorkflowContentType => item !== undefined && item in MemexWorkflowContentType,
    )
    validate(filteredItems)
    onContentTypesSelected(filteredItems)
  }

  const filteredItems = items.filter(type => type.text.toLowerCase().startsWith(filter.toLowerCase()))
  const selected = items.filter(item => selectedContentTypes.includes(item.id))
  return (
    <SelectPanel
      placeholderText={WorkflowResources.selectContentType}
      open={isOpen}
      onOpenChange={setIsOpen}
      selected={selected}
      onFilterChange={setFilter}
      items={filteredItems}
      onSelectedChange={onSelectedChange}
      renderAnchor={({children, ...anchorProps}) => (
        <Button
          sx={sx}
          disabled={!selected || !isEditing}
          trailingVisual={TriangleDownIcon}
          {...anchorProps}
          {...testIdProps(`${testId}-anchor`)}
        >
          {selected.length > 0 ? children : WorkflowResources.invalidNoContentType}
        </Button>
      )}
      overlayProps={{
        width: 'small',
        onMouseDown: e => e.stopPropagation(),
        height: 'auto',
        onClickOutside: onClose,
        ...testIdProps(`${testId}-panel`),
      }}
    />
  )
}
