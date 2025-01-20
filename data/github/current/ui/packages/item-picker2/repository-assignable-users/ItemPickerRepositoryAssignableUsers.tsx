import {Suspense, useState, type PropsWithChildren, useMemo, useCallback, useDeferredValue} from 'react'
import type {SelectPanelProps} from '@primer/react/drafts'
import {SelectPanel} from '@primer/react/drafts'
import {ActionList, Spinner} from '@primer/react'
import {SearchIcon} from '@primer/octicons-react'
import {testIdProps} from '@github-ui/test-id-props'
import {useDebounce} from '@github-ui/use-debounce'
import {graphql, useFragment} from 'react-relay'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {ActionListItemUserSkeleton} from '@github-ui/action-list-items/ActionListItemUser'

import {matchesQuery} from '../common/matchesQuery'
import {
  ItemPickerDoesNotExistErrorFullMessage,
  ItemPickerErrorLoadingFullMessage,
  ItemPickerErrorLoadingInlineMessage,
} from '../common/ErrorMessages'
import type {SubmittedAssignee} from './types'
import {ItemPickerRepositoryAssignableUsersItem} from './ItemPickerRepositoryAssignableUsersItem'
import {ItemPickerRepositoryAssignableUsersList} from './ItemPickerRepositoryAssignableUsersList'

import type {ItemPickerRepositoryAssignableUsers_SelectedAssigneesFragment$key} from './__generated__/ItemPickerRepositoryAssignableUsers_SelectedAssigneesFragment.graphql'
import type {ItemPickerRepositoryAssignableUsersItem_Fragment$key} from './__generated__/ItemPickerRepositoryAssignableUsersItem_Fragment.graphql'

export type ItemPickerRepositoryAssignableUsersProps = Omit<SelectPanelProps, 'onSubmit' | 'anchorRef' | 'children'> &
  PropsWithChildren<{
    repo: string
    owner: string
    /**
     * selectedAssigneesKey: Relay key to retrieve pre-selected assignees
     */
    selectedAssigneesKey: ItemPickerRepositoryAssignableUsers_SelectedAssigneesFragment$key | null
    /**
     * hasError: Option to show error message in the assignee picker
     */
    hasError?: boolean
    assigneesButtonRef: React.RefObject<HTMLButtonElement>
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    onSubmit?: (selectedItems: SubmittedAssignee[]) => void
    /**
     * maxSelectableItems: Optional number to limit the number of items that can be selected at once
     */
    maxSelectableItems?: number
    /**
     * maxSelectableItemsContent: Optional string or React node to display when the maxSelectableItems is reached. Message will be displayed in a <SelectPanel.Message> component.
     */
    maxSelectableItemsContent?: string | React.ReactNode
  }>

/**
 * This component implements the assignee picker that can be used in issues/show or pull requests/show.
 * The component itself is responsible to load its data using relay, based on a given repo, owner, and issue/pull request number.
 */
export function ItemPickerRepositoryAssignableUsers({
  selectedAssigneesKey,
  assigneesButtonRef,
  onCancel,
  onSubmit,
  open,
  owner,
  repo,
  setOpen,
  title,
  children,
  hasError,
  maxSelectableItems = Infinity,
  maxSelectableItemsContent = `You can select up to ${maxSelectableItems} assignee(s).`,
  ...props
}: ItemPickerRepositoryAssignableUsersProps) {
  const result = useFragment(
    graphql`
      fragment ItemPickerRepositoryAssignableUsers_SelectedAssigneesFragment on UserConnection {
        nodes {
          id
          login
          name
          avatarUrl(size: 64)
          ...ItemPickerRepositoryAssignableUsersItem_Fragment
        }
      }
    `,
    selectedAssigneesKey,
  )

  const initialSelectedAssignees = (result?.nodes || []).flatMap(a => (a ? a : []))
  const initialSelected = useMemo<SubmittedAssignee[]>(
    () =>
      initialSelectedAssignees.map(assignee => ({
        id: assignee.id,
        additionalInfo: {
          login: assignee.login,
          name: assignee.name,
          avatarUrl: assignee.avatarUrl,
        },
      })),
    [initialSelectedAssignees],
  )

  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  const [isSearching, setIsSearching] = useState(false)

  const [internalSelectedItems, setInternalSelectedItems] = useState<SubmittedAssignee[]>(initialSelected)
  const internalSelectedItemsIds = useMemo(() => internalSelectedItems.map(item => item.id), [internalSelectedItems])

  const debouncedSetQuery = useDebounce((value: string) => {
    setQuery(value)
    setIsSearching(true)
  }, 300)

  const onSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetQuery(event.target.value)
  }

  const filteredSelectedAssignees: Array<{id: string} & ItemPickerRepositoryAssignableUsersItem_Fragment$key> =
    useMemo(() => {
      return initialSelectedAssignees.filter(assignee => matchesQuery(deferredQuery, assignee.login, assignee.name))
    }, [initialSelectedAssignees, deferredQuery])

  const onItemSelect = useCallback(
    (id: string, additionalInfo: SubmittedAssignee['additionalInfo']) => {
      if (!internalSelectedItemsIds.includes(id)) {
        setInternalSelectedItems([...internalSelectedItems, {id, additionalInfo}])
      } else {
        setInternalSelectedItems(internalSelectedItems.filter(selectedItem => selectedItem.id !== id))
      }
    },
    [internalSelectedItems, internalSelectedItemsIds],
  )

  return (
    <SelectPanel
      open={open}
      {...props}
      title={title}
      onSubmit={() => {
        // Call parent onSubmit and close panel
        onSubmit?.(internalSelectedItems)
        setOpen(false)
      }}
      onCancel={() => {
        // Reset to initial selection and close panel
        setInternalSelectedItems(initialSelected)
        onCancel?.()
        setOpen(false)
      }}
      anchorRef={assigneesButtonRef}
    >
      <SelectPanel.Header>
        <SelectPanel.SearchInput
          onChange={onSearchInputChange}
          leadingVisual={
            isSearching ? (
              <Spinner size="small" sx={{display: 'flex'}} {...testIdProps('item-picker-search-loading')} />
            ) : (
              SearchIcon
            )
          }
          {...testIdProps('item-picker-search-input')}
        />
      </SelectPanel.Header>
      {internalSelectedItems.length >= maxSelectableItems && (
        <SelectPanel.Message variant="warning" size="inline">
          {maxSelectableItemsContent}
        </SelectPanel.Message>
      )}
      <ErrorBoundary
        fallback={
          query ? (
            <ItemPickerErrorLoadingInlineMessage itemsType="assignees" />
          ) : (
            <ItemPickerErrorLoadingFullMessage itemsType="assignees" />
          )
        }
      >
        {hasError ? (
          <ItemPickerDoesNotExistErrorFullMessage itemsType="assignees" />
        ) : (
          <ActionList>
            {filteredSelectedAssignees.map(assignee => (
              <ItemPickerRepositoryAssignableUsersItem
                key={assignee.id}
                assigneeItem={assignee}
                onItemSelect={onItemSelect}
                selected={internalSelectedItems.some(selectedAssignee => selectedAssignee.id === assignee.id)}
                disabled={
                  internalSelectedItems.length >= maxSelectableItems && !internalSelectedItemsIds.includes(assignee.id)
                }
              />
            ))}

            {/* Displays the rest of the suggested assignees. `open` controls when the GraphQL query is sent for the list of
        assignees. If the ItemPickerRepositoryAssignableUsersList is rendered then a query is sent. */}
            {open && (
              <Suspense // Minimum of one loading skeleton
                fallback={[1, 2, 3, 4, 5].map(index => (
                  <ActionListItemUserSkeleton
                    selectType="multiple"
                    key={index}
                    // sx={{px: 3, py: 2}} TODO: convert to using CSS Module and class name
                    {...testIdProps('loading-skeleton')}
                  />
                ))}
              >
                <ItemPickerRepositoryAssignableUsersList
                  owner={owner}
                  repo={repo}
                  query={deferredQuery}
                  setIsSearching={setIsSearching}
                  initialSelected={initialSelected}
                  onItemSelect={onItemSelect}
                  selectedItemsIds={internalSelectedItemsIds}
                  maxSelectableItems={maxSelectableItems}
                />
              </Suspense>
            )}
          </ActionList>
        )}
      </ErrorBoundary>

      {children}

      <SelectPanel.Footer />
    </SelectPanel>
  )
}
