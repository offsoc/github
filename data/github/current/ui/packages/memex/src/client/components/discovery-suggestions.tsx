import {testIdProps} from '@github-ui/test-id-props'
import {ArrowRightIcon, type Icon, IssueDraftIcon, IssueOpenedIcon, RepoIcon} from '@primer/octicons-react'
import {ActionList, Box, Octicon, Text, useRefObjectAsForwardedRef} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {forwardRef, Fragment, useCallback, useId, useMemo, useRef, useSyncExternalStore} from 'react'
import {flushSync} from 'react-dom'

import {OmnibarDiscoverSuggestionsUI} from '../api/stats/contracts'
import {type GetItemPropsAdditionalHandlers, useAutocomplete} from '../hooks/common/use-autocomplete'
import {useControlledRef} from '../hooks/common/use-controlled-ref'
import {useSidePanel} from '../hooks/use-side-panel'
import {Resources} from '../strings'
import {PickerItem, PickerList, useAdjustPickerPosition} from './common/picker-list'
import {Portal} from './common/portal'
import {useStartIssueCreator} from './issue-creator'
import {OmnibarPlaceholder} from './omnibar/omnibar-placeholder'
import type {OmnibarItemAttrs} from './omnibar/types'
import type {RenderInput} from './suggested-item-picker'

type DiscoverySuggestionsProps = {
  isOpen: boolean
  inputRef: React.RefObject<HTMLInputElement>
  // This is a render prop that we invoke to render the textbox in the omnibar
  // This allows the components to hook into keyboard events
  renderInput: RenderInput
  newItemAttributes?: OmnibarItemAttrs
  // This is how the component then signals to hide itself (e.g the user presses ESC)
  // defaultValue is carrying the value which will be set in the omnibar
  onCloseSuggestions: (defaultValue?: string) => void
  onCloseIssueCreator: () => void
}

type DiscoveryMenuItem = {
  icon: Icon
  title: string
  shortcut?: string
  shortcutIcon?: Icon
  action: string
  shortcutContent?: JSX.Element | Array<JSX.Element>
}

const itemPickerRelativeStyle: BetterSystemStyleObject = {
  position: 'relative',
  width: '100%',
  cursor: 'text',
  display: 'flex',
}

export const DiscoverySuggestions: React.FC<DiscoverySuggestionsProps> = ({
  isOpen,
  inputRef,
  renderInput,
  newItemAttributes,
  onCloseSuggestions,
  onCloseIssueCreator,
}) => {
  // When we use useRef, containerRef is not getting the correct ref in the board view.
  // Switching it to controlled ref.
  const [containerRef, onContainerRefChange] = useControlledRef<HTMLDivElement>()

  const startIssueCreator = useStartIssueCreator()

  const staticMenuItems: Array<DiscoveryMenuItem> = useMemo(() => {
    const items = []
    if (startIssueCreator) {
      items.push({
        icon: IssueOpenedIcon,
        title: 'Create new issue',
        action: 'createIssue',
      })
    } else {
      items.push({
        icon: IssueDraftIcon,
        title: 'Create a draft',
        action: 'createDraft',
      })
    }
    items.push({
      icon: RepoIcon,
      title: 'Add item from repository',
      shortcutIcon: ArrowRightIcon,
      action: 'openSidePanel',
      shortcutContent: <Octicon icon={ArrowRightIcon} sx={{color: 'fg.muted'}} />,
    })

    return items
  }, [startIssueCreator])

  const coordinates = useCoordinates(inputRef)

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    switch (event.key) {
      case 'Escape':
        onCloseSuggestions('')
        break
      case 'ArrowDown':
      case 'ArrowUp':
        if (isOpen) {
          // Do not propagate arrow key presses when open, as
          // they're used for cell navigation.
          event.stopPropagation()
        }
        break
    }
  }
  const {openPaneBulkAdd} = useSidePanel()

  const onSelectedItemChange = useCallback(
    (item: DiscoveryMenuItem) => {
      if (!item) return

      switch (item.action) {
        case 'createDraft':
          flushSync(() => {
            onCloseSuggestions('')
          })
          inputRef.current?.focus()
          break
        case 'createIssue':
          if (startIssueCreator) {
            startIssueCreator.start({}, newItemAttributes, inputRef, onCloseIssueCreator)
          }
          break
        case 'openSidePanel':
          onCloseSuggestions('')
          openPaneBulkAdd(
            OmnibarDiscoverSuggestionsUI,
            undefined,
            item.title !== 'Add item from repository' ? item.title : undefined,
            newItemAttributes,
          )
          break
      }
    },
    [onCloseSuggestions, openPaneBulkAdd, inputRef, newItemAttributes, startIssueCreator, onCloseIssueCreator],
  )

  // useComboBox is how we get the item selection and keyboard navigation inside the picker list
  const {getInputProps, getListProps, getItemProps} = useAutocomplete<DiscoveryMenuItem>(
    {
      items: staticMenuItems,
      onSelectedItemChange,
      isOpen,
    },
    inputRef,
  )

  // Similarly with the RepoSuggester, we're rendering the omnibar's input
  // and attaching specific functionality for this component.
  // Ideally the code should be refactored into a types-agnostic component and reused for the 3 suggesters we have in the omnibar
  // The future is mysterious and maybe bright
  const inputOnChange = useCallback(() => {
    flushSync(() => {
      onCloseSuggestions(inputRef.current?.value)
    })

    inputRef.current?.focus()
  }, [onCloseSuggestions, inputRef])

  const omnibarDescriptionId = useId()
  return (
    <Box sx={itemPickerRelativeStyle} ref={onContainerRefChange}>
      <OmnibarPlaceholder
        focusedPlaceholder={Resources.newItemPlaceholder}
        inputHasFocus
        value={inputRef.current?.value}
        descriptionId={omnibarDescriptionId}
      />
      {renderInput({
        ...getInputProps({onChange: inputOnChange}),
        fontSize: 1,
        pl: '12px',
        lineHeight: 1.5,
        'aria-label': Resources.newItemPlaceholderAriaLabel,
        'aria-describedby': omnibarDescriptionId,
        autoComplete: 'off',
        onKeyDown,
      })}
      <SuggestedActionsList
        {...getListProps()}
        containerRef={containerRef}
        isOpen={isOpen}
        items={staticMenuItems}
        getItemProps={getItemProps}
        itemOnMouseDown={onSelectedItemChange}
        coordinates={coordinates}
      />
    </Box>
  )
}

interface SuggestedActionsListProps extends React.HTMLAttributes<HTMLUListElement> {
  isOpen: boolean
  items: Array<DiscoveryMenuItem>
  containerRef: React.RefObject<HTMLDivElement>
  coordinates: {top: number; left: number}
  getItemProps: (
    item: DiscoveryMenuItem,
    index: number,
    additionalHandlers?: GetItemPropsAdditionalHandlers,
  ) => React.LiHTMLAttributes<HTMLLIElement>
  itemOnMouseDown: (item: DiscoveryMenuItem) => void
}

// @shiftkey note:
//
// I copy-pasted this component because the ref and forwardRef here seem required for the flow
// I'd love to remove this this but for now let's get this working...
const SuggestedActionsList = forwardRef<HTMLUListElement, SuggestedActionsListProps>(
  ({items, getItemProps, itemOnMouseDown, isOpen, containerRef, coordinates, ...listProps}, forwardedRef) => {
    const ref = useRef<HTMLUListElement>(null)
    useRefObjectAsForwardedRef(forwardedRef, ref)

    const {adjustPickerPosition} = useAdjustPickerPosition(containerRef, ref, isOpen, [coordinates, items], {
      yAlign: 'bottom',
    })

    return (
      <Portal onMount={adjustPickerPosition}>
        <PickerList
          {...listProps}
          {...testIdProps('discovery-suggestions')}
          ref={ref}
          hidden={!isOpen || !items.length}
          sx={{
            p: [null, 0],
            width: [null, '300px'],
            maxWidth: [null, '300px'],
          }}
          aria-label="Discovery suggestions"
        >
          {isOpen &&
            items.map((item, index) => {
              return (
                <Fragment key={index++}>
                  <PickerItem
                    style={{
                      padding: 14,
                    }}
                    value={item.title}
                    {...testIdProps('issue-picker-item')}
                    {...getItemProps(item, index, {onMouseDown: () => itemOnMouseDown(item)})}
                  >
                    <Box sx={{justifyContent: 'space-between', overflow: 'hidden', flex: 1, display: 'flex'}}>
                      <span>
                        <Octicon icon={item.icon} sx={{ml: 2, color: 'fg.muted'}} />
                        <Text sx={{ml: 2, color: 'fg.muted', fontSize: 1}}>{item.title}</Text>
                      </span>
                      <span style={{display: 'flex', alignItems: 'center'}}>{item.shortcutContent}</span>
                    </Box>
                  </PickerItem>
                  {index !== items.length && <ActionList.Divider sx={{margin: 0}} />}
                </Fragment>
              )
            })}
        </PickerList>
      </Portal>
    )
  },
)

SuggestedActionsList.displayName = 'SuggestedItemList'

const subscribeToDocumentResize = (notify: () => void) => {
  const resizeObserver = new ResizeObserver(notify)
  resizeObserver.observe(document.documentElement)
  return () => {
    resizeObserver.unobserve(document.documentElement)
    resizeObserver.disconnect()
  }
}
function useCoordinates(inputRef: React.RefObject<HTMLDivElement>) {
  const coordinatesCache = useRef({top: 0, left: 0})
  return useSyncExternalStore(subscribeToDocumentResize, () => {
    const previousValue = coordinatesCache.current
    if (inputRef.current) {
      const {top, left} = inputRef.current.getBoundingClientRect()
      if (top !== previousValue.top || left !== previousValue.left) {
        coordinatesCache.current = {top, left}
      }
    }
    return coordinatesCache.current
  })
}
