import {createPortal} from 'react-dom'
import {DragAndDrop, type OnDropArgs} from '@github-ui/drag-and-drop'
import React, {useCallback, useMemo, useState, Fragment} from 'react'
import styles from './TaskListItems.module.css'
import {TaskListItem} from './TaskListItem'
import {ListItem} from './ListItem'
import type {TaskItem} from '../constants/types'
import {updateLocalState, updateMarkdown} from '../utils/updaters'

export type TaskListItemsProps = {
  tasklists: Element[]
  markdownValue: string
  tasklistData: Map<Element, TaskItem[]>
  setTasklistData: React.Dispatch<React.SetStateAction<Map<Element, TaskItem[]>>>
  onConvertToIssue?: (task: TaskItem, setIsConverting: (converting: boolean) => void) => void
  externalOnChange?: (value: string) => void | Promise<void>
  nestedItems: Map<string, number | undefined>
  disabled?: boolean
}

type onDropProps = OnDropArgs<string | number> & {
  items: TaskItem[]
  container: Element
}

export const TaskListItems = ({
  tasklists,
  markdownValue,
  externalOnChange,
  onConvertToIssue,
  tasklistData,
  setTasklistData,
  disabled,
}: TaskListItemsProps) => {
  const [isUpdating, setIsUpdating] = useState(false)

  const onDrop = useCallback(
    async ({dragMetadata, dropMetadata, isBefore, items, container}: onDropProps) => {
      if (dragMetadata.id === dropMetadata?.id || disabled) return

      setIsUpdating(true)

      const dragMarkdownIndex = items.find(item => item.id === dragMetadata.id)?.markdownIndex
      const dropMarkdownIndex = items.find(item => item.id === dropMetadata.id)?.markdownIndex

      if (dragMarkdownIndex === undefined || dropMarkdownIndex === undefined) return

      const updatedMarkdown = updateMarkdown(markdownValue, isBefore, dragMarkdownIndex, dropMarkdownIndex)

      const newData = updateLocalState(items, dragMetadata.id, dropMetadata.id, tasklistData, isBefore, container)

      setTasklistData(newData)

      if (externalOnChange) {
        await externalOnChange(updatedMarkdown)
        setIsUpdating(false)
      }
    },
    [disabled, markdownValue, tasklistData, setTasklistData, externalOnChange],
  )

  const onTasklistItemChangeHandler = useCallback(
    async (value: string) => {
      if (externalOnChange) {
        setIsUpdating(true)
        await externalOnChange(value)
        setIsUpdating(false)
      }
    },
    [externalOnChange],
  )

  const tasklistItems = useMemo(() => {
    return (
      <>
        {tasklists.map((container, i): JSX.Element => {
          const items = tasklistData.get(container) || []
          const checkListItems = items.filter(item => !item.isBullet && !item.isNumbered)
          const BaseListItem =
            container.tagName === 'OL'
              ? 'ol'
              : container.tagName === 'UL' &&
                  (!container.classList.contains('contains-task-list') || checkListItems.length !== items.length)
                ? 'ul'
                : 'div'

          return items.length > 0 ? (
            createPortal(
              <li className="base-task-list-item" style={{listStyle: 'none', marginLeft: '-28px'}}>
                <DragAndDrop
                  items={items}
                  onDrop={args => onDrop({...args, items, container})}
                  style={{
                    marginTop: '1px',
                  }}
                  renderOverlay={(item, index) => (
                    <DragAndDrop.Item
                      index={index}
                      id={item.id}
                      key={item.id}
                      title={item.title}
                      hideSortableItemTrigger={true}
                      isDragOverlay
                    >
                      {renderNestedItems(item, 0, container, items.length, false, true)}
                    </DragAndDrop.Item>
                  )}
                  as="div"
                >
                  <BaseListItem
                    className={'base-list-item'}
                    style={{
                      marginLeft: checkListItems.length !== items.length && checkListItems.length ? '5px' : '0px',
                    }}
                  >
                    {items.map((item, index) => {
                      return (
                        <DragAndDrop.Item
                          index={index}
                          id={item.id}
                          key={item.id}
                          title={item.title}
                          hideSortableItemTrigger={true}
                          className={
                            item.isBullet
                              ? styles['bullet-task-item']
                              : item.isNumbered
                                ? styles['numbered-task-item']
                                : styles['task-list-item']
                          }
                          as={showAsLi(item) ? 'li' : 'div'}
                          style={{
                            marginLeft:
                              !item.isBullet && !item.isNumbered && item.hasDifferentListTypes ? '-28px' : '0px',
                            marginRight: '-8px',
                          }}
                        >
                          {renderNestedItems(item, 0, container, items.length, false, false)}
                        </DragAndDrop.Item>
                      )
                    })}
                  </BaseListItem>
                </DragAndDrop>
              </li>,
              container,
              // using index as key is OK here because users can't reorder tasklist, but it's still not great because
              // tasklist order _can_ change if a live update comes in with new Markdown. So we definitely want to add a
              // unique ID per tasklist as well.
              i.toString(),
            )
          ) : (
            <Fragment key={i.toString()} />
          )
        })}
      </>
    )
    // We only want to re-render when the markdownValue or the tasklistData changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdownValue, tasklistData])

  function renderNestedItems(
    item: TaskItem,
    position: number,
    container: Element,
    totalItems: number,
    nested: boolean,
    isDragOverlay: boolean,
  ) {
    const isTaskListItem = !item.isBullet && !item.isNumbered
    const BaseListItem = container.tagName === 'OL' ? 'ol' : container.tagName === 'UL' ? 'ul' : 'div'
    return (
      <React.Fragment key={item.index}>
        {isTaskListItem && (
          <TaskListItem
            markdownValue={markdownValue}
            onChange={onTasklistItemChangeHandler}
            onConvertToIssue={onConvertToIssue}
            nested={nested}
            position={position}
            item={item}
            totalItems={totalItems}
            disabled={disabled || isUpdating}
          />
        )}

        {!isTaskListItem && <ListItem item={item} position={position} />}

        {item.children.length > 0 && (
          <DragAndDrop
            items={item.children}
            onDrop={args => onDrop({...args, items: item.children, container})}
            renderOverlay={(child, index) => (
              <DragAndDrop.Item
                index={index}
                id={child.id}
                key={child.id}
                title={child.title}
                hideSortableItemTrigger={true}
                className={styles['task-list-item']}
                isDragOverlay
                style={{
                  marginLeft: '-30px',
                }}
              >
                {renderNestedItems(child, position + 1, container, item.children.length, true, true)}
              </DragAndDrop.Item>
            )}
            as={'div'}
          >
            <BaseListItem
              className={'base-list-item'}
              style={{listStyleType: 'none', marginLeft: !isTaskListItem ? '-28px' : '12px'}}
            >
              {item.children.map((child, index) => {
                const orderedUnorderedItem = getOrderedUnorderedClass({child, position})
                const nestedTaskList = getNestedClass({child, isDragOverlay})
                const taskListChild = getOverlayClass({child, isDragOverlay})

                return (
                  <DragAndDrop.Item
                    index={index}
                    id={child.id}
                    key={child.id}
                    title={child.title}
                    hideSortableItemTrigger={true}
                    className={`${orderedUnorderedItem} ${nestedTaskList} ${taskListChild}`}
                    as={showAsLi(item) ? 'li' : 'div'}
                  >
                    {renderNestedItems(child, position + 1, container, item.children.length, true, isDragOverlay)}
                  </DragAndDrop.Item>
                )
              })}
            </BaseListItem>
          </DragAndDrop>
        )}
      </React.Fragment>
    )
  }

  return tasklistItems
}

const getOrderedUnorderedClass = ({child, position}: {child: TaskItem; position: number}) => {
  return child.isNumbered
    ? position + 1 < 2
      ? styles['numbered-task-list']
      : styles['numbered-task-list-nested']
    : child.isBullet
      ? position + 1 < 2
        ? styles['unordered-task-list']
        : styles['unordered-task-list-nested']
      : styles['task-list-item']
}

const getNestedClass = ({child, isDragOverlay}: {child: TaskItem; isDragOverlay: boolean}) => {
  return (
    !child.isBullet &&
    !child.isNumbered &&
    (isDragOverlay
      ? styles['nested-overlay-list']
      : !child.parentIsChecklist && !child.hasDifferentListTypes
        ? styles['task-list-item']
        : '')
  )
}

const getOverlayClass = ({child, isDragOverlay}: {child: TaskItem; isDragOverlay: boolean}) => {
  return (child.isBullet || child.isNumbered) && (isDragOverlay ? styles['overlay-task-list-child'] : '')
}

const showAsLi = (item: TaskItem) => {
  return (
    ((item.isNumbered || item.isBullet) && !item.hasDifferentListTypes) ||
    item.hasDifferentListTypes ||
    item.children.length > 0
  )
}
