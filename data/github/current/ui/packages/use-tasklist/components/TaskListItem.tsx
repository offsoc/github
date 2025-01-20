import {Box, Checkbox, IconButton, Spinner} from '@primer/react'
import {useCallback, useState} from 'react'
import {IssueOpenedIcon} from '@primer/octicons-react'
import {DragAndDrop} from '@github-ui/drag-and-drop'
import styles from './TaskListItem.module.css'
import {SafeHTMLBox} from '@github-ui/safe-html'
import {TaskListMenu} from './TaskListMenu'
import {LABELS} from '../constants/labels'
import type {TaskItem} from '../constants/types'
import {handleItemToggle} from '../utils/handle-item-toggle'

export type TaskListItemProps = {
  markdownValue: string
  onChange: (markdown: string) => void | Promise<void>
  onConvertToIssue?: (task: TaskItem, setIsConverting: (converting: boolean) => void) => void
  nested?: boolean
  position?: number
  item: TaskItem
  totalItems: number
  disabled?: boolean
}

// Task list items that are already issues are wrapped in a `<span class="reference">
const IS_ISSUE_REGEX = /span class="reference"/

export function TaskListItem({
  markdownValue,
  onChange,
  onConvertToIssue,
  nested = false,
  position = 1,
  item,
  totalItems,
  disabled,
}: TaskListItemProps) {
  const [checked, setChecked] = useState(item.checked)
  const [showTrigger, setShowTrigger] = useState(false)
  const [isConverting, setIsConverting] = useState(false)

  const onToggleItem = useCallback(
    (markdown: string) => {
      setChecked(prev => {
        // this updates the checked state of the item in the tasklist data
        item.checked = !prev
        return !prev
      })

      handleItemToggle({markdownValue: markdown, markdownIndex: item.markdownIndex, onChange})
    },
    [item, onChange],
  )

  const allowDragAndDrop =
    (!nested && !item.hasDifferentListTypes) ||
    (nested && position < 2 && !item.parentIsChecklist && !item.hasDifferentListTypes)

  const isIssue = IS_ISSUE_REGEX.test(item.content)
  const tasklistIstemTestIdBase = `tasklist-item-${position}-${item.markdownIndex}`

  let tasklistItemCssClasses =
    nested && !onConvertToIssue ? styles['no-convert-task-list-item'] : styles['task-list-item']

  tasklistItemCssClasses += ` ${nested && totalItems > 0 ? 'contains-task-list' : ''}`
  tasklistItemCssClasses += disabled ? ` ${styles.disabled}` : ''

  return (
    <div
      className={tasklistItemCssClasses}
      onMouseEnter={() => setShowTrigger(true)}
      onMouseLeave={() => setShowTrigger(false)}
      data-testid={tasklistIstemTestIdBase}
    >
      <div className={styles['left-aligned-content']}>
        <div className={styles['drag-drop-container']}>
          {allowDragAndDrop && !disabled && (
            <DragAndDrop.DragTrigger
              className={`${styles['drag-handle-icon']} ${showTrigger ? styles['show-trigger'] : ''}`}
              style={{
                width: '20px',
                height: '28px',
              }}
            />
          )}
        </div>

        <div className={styles['checkbox-items']}>
          <Checkbox
            checked={checked}
            disabled={disabled}
            onChange={e => {
              e.preventDefault()
              e.stopPropagation()
              onToggleItem(markdownValue)
            }}
            aria-label={`${item.title} checklist item`}
            sx={{
              height: '1em',
              width: '1em',
              mt: '.5em',
              flexShrink: 0,
              ':before': {width: '1em'},
            }}
          />
          <SafeHTMLBox unverifiedHTML={item.content} className={styles['task-list-html']} />
        </div>
      </div>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
          flexBasis: '28px',
          height: '28px',
        }}
      >
        {isConverting && <Spinner size="small" />}
        {!isConverting && !isIssue && !allowDragAndDrop && onConvertToIssue && showTrigger && (
          // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
          <IconButton
            unsafeDisableTooltip={true}
            data-testid={`${tasklistIstemTestIdBase}-convert-button`}
            icon={IssueOpenedIcon}
            aria-label={LABELS.convertToIssue}
            onClick={() => onConvertToIssue(item, setIsConverting)}
            variant="invisible"
            sx={{width: '24px', height: '24px'}}
          />
        )}
        {!isConverting && allowDragAndDrop && item.position && !disabled && (
          <TaskListMenu
            data-testid={`${tasklistIstemTestIdBase}-menu`}
            onConvertToIssue={onConvertToIssue}
            totalItems={totalItems}
            item={item}
            disabled={disabled}
            isIssue={isIssue}
            setIsConverting={setIsConverting}
          />
        )}
      </Box>
    </div>
  )
}
