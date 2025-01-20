import {KeyboardKey} from '@github-ui/keyboard-key'
import {testIdProps} from '@github-ui/test-id-props'
import {PlusIcon} from '@primer/octicons-react'
import {
  Box,
  type BoxProps,
  Button,
  Heading,
  IconButton,
  Popover,
  themeGet,
  useRefObjectAsForwardedRef,
} from '@primer/react'
import {clsx} from 'clsx'
import {forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react'
import {flushSync} from 'react-dom'
import styled, {keyframes} from 'styled-components'

import {ItemType} from '../../api/memex-items/item-type'
import type {RepositoryItem, SuggestedRepository} from '../../api/repository/contracts'
import type {GroupingMetadataWithSource} from '../../features/grouping/types'
import {useApplyTemplate} from '../../features/templates/hooks/use-apply-template'
import {replaceShortCodesWithEmojis} from '../../helpers/emojis'
import {getInitialState} from '../../helpers/initial-state'
import {ViewType} from '../../helpers/view-type'
import {useAddMemexItem, type UseAddMemexItemProps} from '../../hooks/use-add-memex-item'
import {useViewType} from '../../hooks/use-view-type'
import type {MemexItemModel} from '../../models/memex-item-model'
import {useCreateMemexItem} from '../../state-providers/memex-items/use-create-memex-item'
import {useRepositories} from '../../state-providers/repositories/use-repositories'
import {useTemplateDialog} from '../../state-providers/template-dialog/use-template-dialog'
import {Resources} from '../../strings'
import {BorderlessTextInput} from '../common/borderless-text-input'
import {DiscoverySuggestions} from '../discovery-suggestions'
import {useStartIssueCreator} from '../issue-creator'
import {CELL_HEIGHT} from '../react_table/constants'
import {clearFocus, useStableTableNavigation} from '../react_table/navigation'
import {RepoSearcher} from '../react_table/repo-searcher'
import {
  type ADD_MULTIPLE_ITEMS,
  ADD_MULTIPLE_ITEMS_KEY,
  type CREATE_ISSUE,
  CREATE_ISSUE_KEY,
} from '../suggested-item-list'
import type {RenderInput} from '../suggested-item-picker'
import {SuggestionsForRepository} from '../suggestions-for-repository'
import useToasts, {ToastType} from '../toasts/use-toasts'
import {draftsUnsupported, getDraftItemsWarningMessage} from './helpers'
import type {OmnibarItemAttrs} from './types'

// This was originally `CELL_HEIGHT + 8`, but that no longer makes sense as this
// is not a table-specific component.
export const OMNIBAR_HEIGHT = 45

// Padding used to offset the omnibar from the bottom of the viewport.
export const OMNIBAR_SIBLING_PADDING_BOTTOM = `${OMNIBAR_HEIGHT + 24}px`

type OmnibarProps = {
  /** Reference to the current scrollable body */
  scrollRef?: React.RefObject<HTMLElement>
  /** A callback called when a new item was added to the Memex via the Omnibar */
  onAddItem?: (model: MemexItemModel) => void
  /** What field, if any, to set on new items, and what their previous item ID is */
  newItemAttributes?: OmnibarItemAttrs
  /** Is the omnibar fixed to the bottom of the table view */
  isFixed?: boolean
  /** The default placeholder to show when the omnibar does not have focus */
  defaultPlaceholder: React.ReactNode
  /** Grouped-by metadata, such as repo **/
  groupingMetadata?: GroupingMetadataWithSource
  /** Is the omnibar input disabled */
  disabled?: boolean
  /** Callback for when the input within the Omnibar receives focus */
  onInputFocus?: () => void
  /**
   * An aria role passed to the children of the omnibar wrapper.
   *
   * useful when passing a role to the omnibar that requires specific
   * child roles, like `row` requiring `cell` or `gridcell` type children
   */
  childElementRole?: string
}

export type OmnibarRef = {
  /** Focus the omnibar's input. */
  focus: () => void
  /** Blur the omnibar's input. */
  blur: () => void
  /** Whether or not the target passed is the input element of the omnibar */
  isInputElement: (target: EventTarget | null) => boolean
}

export const Omnibar = memo(
  forwardRef<OmnibarRef, OmnibarProps & BoxProps>(({onAddItem, newItemAttributes, scrollRef, ...props}, ref) => {
    const {addToast} = useToasts()
    const {createMemexItem} = useCreateMemexItem()

    const wrappedOnAddItem: BaseOmnibarProps['onAddItem'] = useCallback(
      (
        item,
        repositoryId,
        memexProjectColumnValues,
        localColumnValues,
        previousMemexProjectItemId,
        groupId,
        secondaryGroupId,
      ) =>
        createMemexItem(
          {
            contentType: item.type,
            content: {id: item.id, repositoryId},
            memexProjectColumnValues,
            localColumnValues,
            previousMemexProjectItemId,
          },
          groupId,
          secondaryGroupId,
        ).then(model => {
          onAddItem?.(model)
          return model
        }),
      [createMemexItem, onAddItem],
    )

    const wrappedOnAddDraftItem: BaseOmnibarProps['onAddDraftItem'] = useCallback(
      async (
        text,
        memexProjectColumnValues,
        localColumnValues,
        previousMemexProjectItemId,
        groupId,
        secondaryGroupId,
      ) => {
        const textValue = text.trim()

        const {updateColumnActions = []} = newItemAttributes ?? {}

        if (textValue) {
          const model = await createMemexItem(
            {
              contentType: ItemType.DraftIssue,
              content: {title: replaceShortCodesWithEmojis(textValue)},
              memexProjectColumnValues,
              localColumnValues,
              previousMemexProjectItemId,
            },
            groupId,
            secondaryGroupId,
          )
          onAddItem?.(model)
          for (const updateAction of updateColumnActions) {
            // Some groupings don't support draft items, when they are added the drafts are added to the "no group" group
            // If adding draft text as a link, confirm whether or not added item is an issue
            // before scrolling to "No <Group>" group and displaying toast warning messages
            if (draftsUnsupported(updateAction) && model.contentType !== ItemType.Issue) {
              const message = getDraftItemsWarningMessage(updateAction)
              if (message) {
                // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
                addToast({message, type: ToastType.warning})
              }

              scrollRef?.current?.scrollTo({left: 0, top: scrollRef.current?.scrollHeight, behavior: 'smooth'})
              break
            }
          }
          return model
        }
        return Promise.resolve(null)
      },
      [addToast, createMemexItem, newItemAttributes, onAddItem, scrollRef],
    )

    return (
      <BaseOmnibar
        onAddItem={wrappedOnAddItem}
        onAddDraftItem={wrappedOnAddDraftItem}
        newItemAttributes={newItemAttributes}
        {...props}
        ref={ref}
      />
    )
  }),
)

Omnibar.displayName = 'OmnibarInternal'

type BaseOmnibarProps = Omit<OmnibarProps, 'onAddItem'> &
  BoxProps &
  Pick<UseAddMemexItemProps, 'onAddDraftItem' | 'onAddItem'> & {
    filteredItemIds?: Array<number>
  }

/**
 * The internal content of the Omnibar component
 */
const BaseOmnibar = forwardRef<OmnibarRef, BaseOmnibarProps>(
  (
    {
      onAddItem,
      onAddDraftItem,
      onInputFocus,
      filteredItemIds,
      newItemAttributes,
      isFixed,
      defaultPlaceholder,
      groupingMetadata,
      disabled,
      childElementRole,
      ...props
    },
    fowardedRef,
  ) => {
    const ref = useRef<OmnibarRef>(null)
    useRefObjectAsForwardedRef(fowardedRef, ref)
    const [isFocused, setIsFocused] = useState(false)
    const [showDiscoveryMenu, setShowDiscoveryMenu] = useState<boolean>(false)
    const {navigationDispatch} = useStableTableNavigation()
    const startIssueCreator = useStartIssueCreator()

    const onInputClick = useCallback(() => {
      ref.current?.focus()
    }, [ref])

    const omnibarClassName = clsx({'is-focused': isFocused, 'is-fixed': isFixed})
    const buttonClassName = clsx({'is-focused': isFocused, 'is-disabled': disabled})

    const {isTemplatesDialogOpen} = useTemplateDialog()
    const {copyingDraftsAsync} = useApplyTemplate()
    const [onboardingPopoverOpen, setOnboardingPopoverOpen] = useState(false)
    const {viewType} = useViewType()

    // If the template dialog should be open, then we will show a popover with a hint to start adding items.
    const {showTemplateDialog} = getInitialState()
    useEffect(() => {
      // When template dialog is closed, we will show the onboarding popover. Do not show it if the user is in board view,
      // since the board view has a floating omnibar. Also don't show if copying drafts async, as live updates will soon
      // add items to the project. We also do not show if the omnibar is floating.
      if (
        viewType === ViewType.Table &&
        !isTemplatesDialogOpen &&
        showTemplateDialog &&
        !copyingDraftsAsync.current &&
        !isFixed
      ) {
        setOnboardingPopoverOpen(true)
      }
    }, [copyingDraftsAsync, isFixed, isTemplatesDialogOpen, showTemplateDialog, viewType])

    const newItemButtonOnClick = useCallback(
      (e: React.MouseEvent) => {
        // The event is not bubbled up in order to not trigger blur on the input which would hide the DiscoveryMenu
        e.preventDefault()
        setShowDiscoveryMenu(!showDiscoveryMenu)
        ref.current?.focus()
      },
      [showDiscoveryMenu, setShowDiscoveryMenu],
    )

    const onboardingPopoverDismiss = useCallback(() => setOnboardingPopoverOpen(false), [])
    const onboardingPopoverAddItem = useCallback(
      (event: React.MouseEvent) => {
        onboardingPopoverDismiss()
        newItemButtonOnClick(event)
      },
      [newItemButtonOnClick, onboardingPopoverDismiss],
    )

    const handleBlur = useCallback(() => {
      setShowDiscoveryMenu(false)
      setIsFocused(false)
    }, [setShowDiscoveryMenu])

    const newItemButtonOnEnter = useCallback(() => {
      startIssueCreator?.prefetch()
    }, [startIssueCreator])

    const wrappedOnInputFocus = useCallback(() => {
      if (onInputFocus) {
        onInputFocus()
      }

      setIsFocused(true)
      setOnboardingPopoverOpen(false)
    }, [onInputFocus])

    const newItemButtonOnFocus: React.EventHandler<React.FocusEvent> = useCallback(() => {
      // since the button is within the table, we need to manually
      // unfocus the last cell in the table when this button receives focus
      navigationDispatch(clearFocus())
    }, [navigationDispatch])

    return (
      <StyledOmnibar className={omnibarClassName} {...testIdProps('omnibar')} {...props}>
        <Box role={childElementRole} sx={{height: '100%', padding: '3px 1px 3px 3px'}}>
          <IconButton
            aria-label={Resources.createNewItemOrAddExistingIssueAriaLabel}
            className={buttonClassName}
            onClick={newItemButtonOnClick}
            onFocus={newItemButtonOnFocus}
            onMouseEnter={newItemButtonOnEnter}
            disabled={disabled}
            {...testIdProps('new-item-button')}
            icon={PlusIcon}
            variant="invisible"
            size="small"
            sx={{height: '100%', color: 'fg.subtle'}}
          />
          {onboardingPopoverOpen && (
            <Popover
              relative={false}
              open
              caret="top-left"
              sx={{
                // Move the popover down so it doesn't block the button itself
                top: '45px',
                // Moving the caret to align with the "add item" button
                '& > *::before': {
                  left: '13px !important',
                },
                '& > *::after': {
                  left: '14px !important',
                },
              }}
            >
              <Popover.Content sx={{minWidth: '300px'}}>
                <Heading as="h3" sx={{fontSize: 2, mb: 2}}>
                  Add your first item
                </Heading>
                <p>
                  Click &quot;Add Item&quot; to get started or use the shortcut{' '}
                  <KeyboardKey format="full" keys="Control+Space" />.
                </p>
                <Box sx={{display: 'flex', gap: 2, mt: 2}}>
                  <Button onClick={onboardingPopoverAddItem}>Add item</Button>
                  <Button variant="invisible" onClick={onboardingPopoverDismiss}>
                    OK, dismiss
                  </Button>
                </Box>
              </Popover.Content>
            </Popover>
          )}
        </Box>

        <Box
          role={childElementRole}
          className={omnibarClassName}
          sx={{
            display: 'flex',
            flex: 'auto',
            '&.is-focused': {
              boxShadow: theme => `inset 0 0 0 2px ${theme.colors.accent.emphasis}`,
              borderRadius: '2px',
            },
            '&.is-fixed': {
              boxShadow: theme => `inset 1px 0 0 0 ${theme.colors.border.default}`,
            },
            '&.is-focused.is-fixed': {
              boxShadow: theme => `inset 1px 0 0 0 ${theme.colors.accent.muted}`,
            },
          }}
          onClick={onInputClick}
        >
          <OmnibarInput
            ref={ref}
            isFocused={isFocused}
            filteredItemIds={filteredItemIds}
            showDiscoveryMenu={showDiscoveryMenu}
            setShowDiscoveryMenu={setShowDiscoveryMenu}
            onAddItem={onAddItem}
            onAddDraftItem={onAddDraftItem}
            newItemAttributes={newItemAttributes}
            onFocus={wrappedOnInputFocus}
            onBlur={handleBlur}
            defaultPlaceholder={defaultPlaceholder}
            groupingMetadata={groupingMetadata}
            disabled={disabled}
          />
        </Box>
      </StyledOmnibar>
    )
  },
)

BaseOmnibar.displayName = 'BaseOmnibar'

const fadeInAnimation = keyframes`
  0% {opacity: 0;}
  100% {opacity: 1;}
`

const StyledOmnibar = styled(Box)`
  align-items: stretch;
  display: flex;
  flex: auto;
  height: ${CELL_HEIGHT}px;
  max-height: ${CELL_HEIGHT}px;

  &.is-fixed {
    animation: ${fadeInAnimation} 0.25s ease-in;
    height: ${OMNIBAR_HEIGHT}px;
    max-height: ${OMNIBAR_HEIGHT}px;
    width: 100%;

    background-color: ${themeGet('colors.canvas.overlay')};
    box-shadow:
      inset -1px 0 0 0 ${themeGet('colors.border.default')},
      inset 1px 0 0 0 ${themeGet('colors.border.default')},
      inset 0px 1px 0 0 ${themeGet('colors.border.default')},
      inset 0px -1px 0 0 ${themeGet('colors.border.default')},
      ${themeGet('shadows.shadow.medium')};
    border-radius: var(--borderRadius-medium);

    &.is-focused {
      box-shadow: inset 0 0 0 2px ${themeGet('colors.accent.emphasis')};
    }
  }
`

type OmnibarInputProps = Pick<UseAddMemexItemProps, 'onAddDraftItem' | 'onAddItem'> & {
  /** Additional item ids to filter (supporting non-memex items) */
  filteredItemIds?: Array<number>
  /** A callback called when the input becomes focused */
  onFocus?: () => void
  /** A callback called when the input becomes un-focused */
  onBlur?: () => void
  /** What field, if any, to set on new items, and what their previous item ID is */
  newItemAttributes?: OmnibarItemAttrs
  /** The default placeholder to show when the omnibar does not have focus */
  defaultPlaceholder: React.ReactNode
  /** Grouped-by metadata, such as repo **/
  groupingMetadata?: GroupingMetadataWithSource
  /** Default value for focused state, passed from the Parent to OmnibarInput */
  isFocused?: boolean
  /** Show the initial suggestions menu */
  showDiscoveryMenu?: boolean
  /** Callback to change the discovery menu visibility */
  setShowDiscoveryMenu?: (show: boolean) => void
  /** Whether the input is disabled*/
  disabled?: boolean
} & Pick<BaseOmnibarProps, 'isFixed'>

const defaultFilteredItemIds: Array<number> = []
/**
 * The input element the user types into in the Omnibar
 *
 * Depending on whether a repository is selected, this will either be a search
 * input for the user's repositories, or for the selected repository's issues.
 */
export const OmnibarInput = memo(
  forwardRef<OmnibarRef, OmnibarInputProps>(
    (
      {
        onAddItem,
        onAddDraftItem,
        onFocus,
        onBlur,
        filteredItemIds = defaultFilteredItemIds,
        isFocused,
        showDiscoveryMenu,
        setShowDiscoveryMenu,
        newItemAttributes,
        defaultPlaceholder,
        groupingMetadata,
        disabled,
      },
      ref,
    ) => {
      const inputRef = useRef<HTMLInputElement>(null)
      const {clearCachedSuggestions} = useRepositories()

      const addItem = useAddMemexItem({
        updateActions: newItemAttributes?.updateColumnActions,
        previousItemId: newItemAttributes?.previousItemId,
        onAddItem,
        onAddDraftItem,
        groupId: newItemAttributes?.groupId,
        secondaryGroupId: newItemAttributes?.secondaryGroupId,
      })

      // look for a grouped-by repository and cast it from ExtendedRepository to SuggestedRepository if we find it
      // type ExtendedRepository is only missing a couple of date fields that we don't need here, so it's not a big lie
      const groupingRepository =
        groupingMetadata?.sourceObject.dataType === 'repository' && 'name' in groupingMetadata.sourceObject.value
          ? (groupingMetadata.sourceObject.value as SuggestedRepository)
          : null

      const [repoSearcherText, setRepoSearcherText] = useState('')
      const [selectedRepository, setSelectedRepository] = useState<SuggestedRepository | null>(groupingRepository)
      useEffect(() => {
        // Synchronize changes in the grouping repository with the selected repository, so that if the initial props
        // change, we automatically update the state here (otherwise, omnibar would not reflect passed-in props)
        setSelectedRepository(groupingRepository)
      }, [groupingRepository])

      const selectRepository = useCallback((repository: SuggestedRepository) => {
        flushSync(() => {
          setSelectedRepository(repository)
          setRepoSearcherText('')
        })
        inputRef.current?.focus()
      }, [])

      const resetState = useCallback((defaultValue = '') => {
        setRepoSearcherText(defaultValue)
        setSelectedRepository(null)
      }, [])

      useImperativeHandle(
        ref,
        () => ({
          focus: () => inputRef.current?.focus({preventScroll: true}),
          // eslint-disable-next-line github/no-blur
          blur: () => inputRef.current?.blur(),
          isInputElement: target => target === inputRef.current,
        }),
        [],
      )

      const selectItem = useCallback(
        async (item: RepositoryItem | string | CREATE_ISSUE | ADD_MULTIPLE_ITEMS) => {
          // Adding an item may change which repositories should be
          // suggested for this project.
          // Clearing the cache ensures suggested repos are fetched
          // afresh from the server the next time they're required
          clearCachedSuggestions()
          flushSync(() => {
            setRepoSearcherText('')
          })
          if (item === ADD_MULTIPLE_ITEMS_KEY) return // do nothing
          // Add draft item
          if (typeof item === 'string') return addItem(item)

          if (item?.type === ADD_MULTIPLE_ITEMS_KEY || item?.type === CREATE_ISSUE_KEY) return // do nothing

          // Can't add a (non-draft) issue or PR without having a repo selected
          if (selectedRepository) return addItem({...item, repositoryId: selectedRepository.id})
        },
        [selectedRepository, clearCachedSuggestions, addItem],
      )

      const renderInput: RenderInput = useCallback(
        props => {
          const wrappedOnFocus: React.FocusEventHandler<HTMLInputElement> = e => {
            if (props.onFocus) props.onFocus(e)
            if (onFocus) onFocus()
          }

          const wrappedOnBlur: React.FocusEventHandler<HTMLInputElement> = e => {
            if (props.onBlur) props.onBlur(e)
            if (onBlur) onBlur()
          }
          const {width, size, ...filteredProps} = props

          return (
            <BorderlessTextInput
              {...filteredProps}
              ref={inputRef}
              sx={{color: 'fg.default', paddingLeft: '20px'}}
              onFocus={wrappedOnFocus}
              onBlur={wrappedOnBlur}
              className={disabled ? 'is-disabled' : undefined}
              {...testIdProps('repo-searcher-input')}
            />
          )
        },
        [disabled, onFocus, onBlur],
      )

      const onCloseSuggestions = useCallback(
        (defaultValue?: string): void => {
          if (setShowDiscoveryMenu) {
            setShowDiscoveryMenu(false)
            if (defaultValue !== undefined) {
              flushSync(() => {
                resetState(defaultValue)
              })
            }
            inputRef.current?.focus()
          }
        },
        [setShowDiscoveryMenu, resetState],
      )

      const onCloseIssueCreator = useCallback((): void => {
        setShowDiscoveryMenu?.(true)
      }, [setShowDiscoveryMenu])

      const removePicker = useCallback(() => {
        // don't let the grouping repository be removed from the picker
        if (groupingRepository) {
          return
        }

        flushSync(() => {
          setSelectedRepository(null)
        })
        inputRef.current?.focus()
      }, [groupingRepository])

      // by moving this into the omnibar we can render it inline alongside the
      // text input, which means the positioning now works as expected

      const defaultValue = inputRef.current?.value
      if (!defaultValue && !selectedRepository && showDiscoveryMenu) {
        return (
          <DiscoverySuggestions
            isOpen
            inputRef={inputRef}
            renderInput={renderInput}
            newItemAttributes={newItemAttributes}
            onCloseSuggestions={onCloseSuggestions}
            onCloseIssueCreator={onCloseIssueCreator}
          />
        )
      }

      return selectedRepository ? (
        <SuggestionsForRepository
          onRemovePicker={removePicker}
          filteredItemIds={filteredItemIds}
          newItemAttributes={newItemAttributes}
          onItemSelected={selectItem}
          repository={selectedRepository}
          inputRef={inputRef}
          renderInput={renderInput}
          sx={{
            alignItems: 'center',
            pl: 3,
          }}
        />
      ) : (
        <RepoSearcher
          onItemSelected={selectItem}
          inputRef={inputRef}
          isFocused={isFocused}
          isDisabled={disabled}
          renderInput={renderInput}
          defaultPlaceholder={defaultPlaceholder}
          text={repoSearcherText}
          setText={setRepoSearcherText}
          onRepositorySelected={selectRepository}
          groupingMetadata={groupingMetadata}
        />
      )
    },
  ),
)

OmnibarInput.displayName = 'OmnibarInput'
