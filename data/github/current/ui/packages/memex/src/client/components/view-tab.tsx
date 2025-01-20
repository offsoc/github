import {InlineAutocomplete} from '@github-ui/inline-autocomplete'
import {testIdProps} from '@github-ui/test-id-props'
import {useDebounce} from '@github-ui/use-debounce'
import {useIgnoreKeyboardActionsWhileComposing} from '@github-ui/use-ignore-keyboard-actions-while-composing'
import {useSyncedState} from '@github-ui/use-synced-state'
import {ProjectIcon, ProjectRoadmapIcon, TableIcon, TrashIcon, TriangleDownIcon} from '@primer/octicons-react'
import {Box, Octicon, Text} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {clsx} from 'clsx'
import {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react'
import {flushSync} from 'react-dom'

import {ViewOptionsMenuUI} from '../api/stats/contracts'
import type {ViewTypeParam} from '../api/view/contracts'
import {getViewTypeFromViewTypeParam, ViewType} from '../helpers/view-type'
import {ViewerPrivileges} from '../helpers/viewer-privileges'
import {useEmojiAutocomplete} from '../hooks/common/use-emoji-autocomplete'
import {useDragWithIds} from '../hooks/drag-and-drop/drag-and-drop'
import type {BaseViewState, ViewIsDirtyStates} from '../hooks/use-view-state-reducer/types'
import {useViews} from '../hooks/use-views'
import {AutosizeTextInput} from './common/autosize-text-input'
import {BorderlessTextInput} from './common/borderless-text-input'
import {menuAnchorStyle} from './view-options/menu-anchor'

interface ViewTabProps {
  view: BaseViewState & ViewIsDirtyStates
  selected: boolean
  viewOptionMenuTriggerRef: React.RefObject<HTMLButtonElement>
  hideViewOptionsMenu: () => void
  showViewOptionsMenu: () => void
  setViewOptionsPlaceholderRef: (placeholder: HTMLDivElement) => void
}

const placeholderStyle: BetterSystemStyleObject = {
  ...menuAnchorStyle,
  backgroundColor: `canvas.subtle`,
  borderRadius: 2,
  borderColor: 'border.subtle',
  borderWidth: '1px',
  borderStyle: 'solid',
  visibility: 'visible',
  opacity: 1,
}

const iconForViewType: Record<ViewType, React.ComponentType> = {
  [ViewType.Board]: ProjectIcon,
  /**
   * List is currently unsupported, so we fallback to the project icon
   */
  [ViewType.List]: ProjectIcon,
  [ViewType.Roadmap]: ProjectRoadmapIcon,
  [ViewType.Table]: TableIcon,
}
const getIcon = (viewType: ViewType, isDeleted?: boolean) => {
  if (isDeleted) {
    return TrashIcon
  }
  return iconForViewType[viewType]
}
const ViewTypeIcon = ({
  selected,
  viewLayout,
  isDeleted,
}: {
  selected?: boolean
  viewLayout: ViewTypeParam
  isDeleted?: boolean
}) => {
  return (
    <Octicon
      icon={getIcon(getViewTypeFromViewTypeParam(viewLayout), isDeleted)}
      sx={{color: isDeleted ? 'fg.subtle' : selected ? 'fg.default' : 'fg.muted'}}
    />
  )
}

const tabBoxStyle: BetterSystemStyleObject = {
  display: 'flex',
  maxWidth: '100%',
  width: '100%',
  gap: 2,
  position: 'relative',
  '&::after, &::before': {
    content: '""',
    display: 'none',
    position: 'absolute',
    top: '-8px',
    width: '4px',
    bg: 'accent.emphasis',
    height: 'calc(100% + 16px)',
    border: 0,
    borderRadius: '6px',
    zIndex: 12,
  },

  'body.is-dragging &.show-sash-view.show-sash-after': {
    '&::after': {
      right: '-20px',
      display: 'block',
    },

    '&.selected::after': {
      right: '-20px',
    },
  },

  'body.is-dragging &.show-sash-view.show-sash-before': {
    '&::before': {
      left: '-18px',
      display: 'block',
    },
    '&.selected::before': {
      right: '-21px',
    },
  },
}

export const ViewTab = forwardRef<HTMLSpanElement, ViewTabProps>(function ViewTab(
  {view, selected, viewOptionMenuTriggerRef, hideViewOptionsMenu, showViewOptionsMenu, setViewOptionsPlaceholderRef},
  forwardedRef,
) {
  const textElementRef = useRef<HTMLSpanElement>(null)
  useImperativeHandle<HTMLSpanElement | null, HTMLSpanElement | null>(forwardedRef, () => textElementRef.current)
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  const dragRef = useRef<any | null>(null)
  const {renameView} = useViews()
  const [localViewName, setLocalViewName] = useSyncedState(view.name)
  const [isEditing, setIsEditing] = useState(false)
  const {hasWritePermissions} = ViewerPrivileges()
  const viewNameInputRef = useRef<HTMLInputElement | null>(null)
  const placeholderRef = useRef<HTMLDivElement>(null)
  const debouncedShowViewOptionsMenu = useDebounce(showViewOptionsMenu, 500, {trailing: true, leading: false})

  useEffect(() => {
    if (selected && placeholderRef.current) {
      setViewOptionsPlaceholderRef(placeholderRef.current)
    }
  }, [selected, setViewOptionsPlaceholderRef])

  const metadata = useMemo(() => ({id: view.id, number: view.number}), [view.id, view.number])
  const drag = useDragWithIds({
    dragAxis: 'horizontal',
    dragID: `${view.number}`,
    dragType: 'view',
    dragIndex: view.number,
    dragRef,
    disable: !hasWritePermissions,
    metadata,
  })

  useEffect(() => {
    if (isEditing) viewNameInputRef.current?.focus()
  }, [isEditing, viewNameInputRef])

  const startEditing = useCallback(
    (event?: React.MouseEvent<HTMLElement>) => {
      // Only allow editing if the tab is currently selected
      if (!selected) return
      // If triggered by a mouse event, ensure that the event is a double click
      if (event && event.detail !== 2) return

      if (hasWritePermissions) {
        setIsEditing(true)
      }
    },
    [hasWritePermissions, selected],
  )

  const stopEditing = useCallback(() => {
    setIsEditing(false)
  }, [setIsEditing])

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      hideViewOptionsMenu()
      setLocalViewName(e.target.value)
      debouncedShowViewOptionsMenu()
    },
    [debouncedShowViewOptionsMenu, hideViewOptionsMenu, setLocalViewName],
  )

  const onMouseDown: React.MouseEventHandler<HTMLInputElement> = useCallback(e => {
    e.stopPropagation()
  }, [])

  const resetViewName = useCallback(() => {
    setLocalViewName(view.name)
  }, [setLocalViewName, view.name])

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      switch (event.key) {
        case 'Enter': {
          if (!isEditing) {
            startEditing()
          }
          if (localViewName.trim().length > 0 && localViewName !== view.name) {
            renameView(view.number, localViewName, {
              ui: ViewOptionsMenuUI,
            })
          }

          event.preventDefault()
          // ensure stopEditing is applied before focusing the trigger
          flushSync(() => {
            stopEditing()
          })

          viewOptionMenuTriggerRef.current?.focus()
          break
        }

        case 'Escape': {
          resetViewName()
          if (isEditing) {
            stopEditing()
          }
          break
        }
      }
    },
    [
      isEditing,
      localViewName,
      view.name,
      view.number,
      viewOptionMenuTriggerRef,
      startEditing,
      renameView,
      stopEditing,
      resetViewName,
    ],
  )
  const inputCompositionProps = useIgnoreKeyboardActionsWhileComposing(onKeyDown)

  const onBlur = useCallback(() => {
    if (document.hasFocus()) {
      if (localViewName.trim().length === 0) {
        resetViewName()
      } else {
        renameView(view.number, localViewName, {
          ui: ViewOptionsMenuUI,
        })
      }
      stopEditing()
    }
  }, [localViewName, resetViewName, stopEditing, renameView, view.number])

  const autocompleteProps = useEmojiAutocomplete()

  // Ideally this would just be the value of `isEditing`; however, due to the bug described in
  // https://github.com/github/memex/issues/16920#issuecomment-1787663003, there is a scenario
  // in which the `isEditing` state of this component is not properly updated after the tab is deselected.
  // By using the `selected` prop, we can ensure that the input (and the correct styles for the container)
  // is only rendered when the tab is selected and in an editing state.
  const renderTextInput = selected && isEditing

  return (
    <Box
      className={clsx({
        selected,
      })}
      ref={dragRef}
      {...drag.props}
      sx={tabBoxStyle}
      {...drag.handle.props}
    >
      <div>
        <ViewTypeIcon selected={selected} viewLayout={view.localViewState.layout} isDeleted={view.isDeleted} />
      </div>

      <Box
        onClick={startEditing}
        sx={
          hasWritePermissions && renderTextInput
            ? {
                px: 1,
                ml: -1,
                '&:focus-within': {
                  boxShadow: 'primer.shadow.focus',
                  borderRadius: '2',
                },
                '&:hover:not(:focus-within)': {
                  boxShadow: 'primer.shadow.focus',
                  borderRadius: '2',
                },
              }
            : {
                pl: 1,
                ml: -1,
                overflow: 'hidden',
              }
        }
      >
        {renderTextInput ? (
          <InlineAutocomplete {...autocompleteProps}>
            <AutosizeTextInput
              as={BorderlessTextInput}
              ref={viewNameInputRef}
              sx={{
                fontSize: 1,
              }}
              autoComplete="off"
              value={localViewName}
              onChange={onChange}
              onMouseDown={onMouseDown}
              onBlur={onBlur}
              aria-label="Change view name"
              disabled={!hasWritePermissions || view.isDeleted}
              {...inputCompositionProps}
              {...testIdProps(`view-name-input`)}
            />
          </InlineAutocomplete>
        ) : (
          <Text
            ref={textElementRef}
            sx={{
              display: 'inline-block',
              color: selected ? 'fg.default' : 'fg.muted',
              '&:hover': {color: 'fg.default'},
              whiteSpace: 'nowrap',
              maxWidth: '100%',
              pr: selected ? '6px' : 0,
            }}
            {...testIdProps(`view-name-static`)}
          >
            {localViewName}
          </Text>
        )}
      </Box>

      {selected ? (
        // This is a placeholder for the view options menu button when editing and position is being updated
        <Box ref={placeholderRef} sx={placeholderStyle} {...testIdProps('view-options-placeholder')}>
          <TriangleDownIcon />
        </Box>
      ) : null}
    </Box>
  )
})
