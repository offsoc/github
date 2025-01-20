import {Suspense, useState, type PropsWithChildren, useMemo, useCallback, useDeferredValue} from 'react'
import {graphql, useFragment} from 'react-relay'
import type {SelectPanelProps} from '@primer/react/drafts'
import {SelectPanel} from '@primer/react/drafts'
import {ActionList, Spinner} from '@primer/react'
import {SearchIcon} from '@primer/octicons-react'
import {testIdProps} from '@github-ui/test-id-props'
import {useDebounce} from '@github-ui/use-debounce'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {ActionListItemUserSkeleton} from '@github-ui/action-list-items/ActionListItemUser'

import {
  ItemPickerDoesNotExistErrorFullMessage,
  ItemPickerErrorLoadingFullMessage,
  ItemPickerErrorLoadingInlineMessage,
} from '../common/ErrorMessages'
import {matchesQuery} from '../common/matchesQuery'
import type {SubmittedMilestone} from './types'
import {ItemPickerMilestonesItem} from './ItemPickerMilestonesItem'
import {ItemPickerMilestonesList} from './ItemPickerMilestonesList'

import type {ItemPickerMilestones_SelectedMilestoneFragment$key} from './__generated__/ItemPickerMilestones_SelectedMilestoneFragment.graphql'
import type {ItemPickerMilestonesItem_Fragment$key} from './__generated__/ItemPickerMilestonesItem_Fragment.graphql'

export type ItemPickerMilestonesProps = Omit<SelectPanelProps, 'onSubmit' | 'anchorRef' | 'children'> &
  PropsWithChildren<{
    repo: string
    owner: string
    /**
     * hasError: Option to show error message in the milestone picker
     */
    hasError?: boolean
    milestonesButtonRef: React.RefObject<HTMLButtonElement>
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    onSubmit?: (selectedItem: SubmittedMilestone | null) => void
    /**
     * selectedMilestonesKey: Optional fragment key to pass in selected milestones from outside of the component.
     */
    selectedMilestonesKey: ItemPickerMilestones_SelectedMilestoneFragment$key | null
  }>

/**
 * This component implements the milestone picker that can be used in issues/show or pull requests/show.
 * The component itself is responsible to load its data using relay, based on a given repo & owner.
 */
export function ItemPickerMilestones({
  selectedMilestonesKey,
  milestonesButtonRef,
  onCancel,
  onSubmit,
  open,
  owner,
  repo,
  setOpen,
  title,
  children,
  hasError,
  ...props
}: ItemPickerMilestonesProps) {
  const initialSelectedMilestone = useFragment(
    graphql`
      fragment ItemPickerMilestones_SelectedMilestoneFragment on Milestone {
        title
        state
        id
        ...ItemPickerMilestonesItem_Fragment
      }
    `,
    selectedMilestonesKey,
  )

  const initialSelected = useMemo<SubmittedMilestone | null>(
    () =>
      initialSelectedMilestone
        ? {
            id: initialSelectedMilestone.id,
            additionalInfo: {
              title: initialSelectedMilestone.title,
              state: initialSelectedMilestone.state,
            },
          }
        : null,
    [initialSelectedMilestone],
  )

  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  const [isSearching, setIsSearching] = useState(false)

  const [internalSelectedItem, setInternalSelectedItem] = useState<SubmittedMilestone | null>(initialSelected)

  const debouncedSetQuery = useDebounce((value: string) => {
    setQuery(value)
    setIsSearching(true)
  }, 300)

  const onSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetQuery(event.target.value)
  }

  const filteredInitialSelectedMilestone: ({id: string} & ItemPickerMilestonesItem_Fragment$key) | null =
    useMemo(() => {
      if (initialSelectedMilestone && matchesQuery(deferredQuery, initialSelectedMilestone.title)) {
        return initialSelectedMilestone
      }

      return null
    }, [initialSelectedMilestone, deferredQuery])

  const onItemSelect = useCallback((id: string, additionalInfo: SubmittedMilestone['additionalInfo']) => {
    setInternalSelectedItem({id, additionalInfo})
  }, [])

  return (
    <SelectPanel
      open={open}
      {...props}
      title={title}
      onSubmit={() => {
        // Call parent onSubmit and close panel
        onSubmit?.(internalSelectedItem)
        setOpen(false)
      }}
      onCancel={() => {
        // Reset to initial selection and close panel
        setInternalSelectedItem(initialSelected)
        onCancel?.()
        setOpen(false)
      }}
      anchorRef={milestonesButtonRef}
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
      <ErrorBoundary
        fallback={
          query ? (
            <ItemPickerErrorLoadingInlineMessage itemsType="milestones" />
          ) : (
            <ItemPickerErrorLoadingFullMessage itemsType="milestones" />
          )
        }
      >
        {hasError ? (
          <ItemPickerDoesNotExistErrorFullMessage itemsType="milestones" />
        ) : (
          <ActionList selectionVariant="single" showDividers>
            {/* To prevent initial selected milestone from jumping around when selection changes,
             we will keep it at the top of the list. */}
            {filteredInitialSelectedMilestone && (
              <ItemPickerMilestonesItem
                key={filteredInitialSelectedMilestone.id}
                milestoneItem={filteredInitialSelectedMilestone}
                onItemSelect={onItemSelect}
                selected={filteredInitialSelectedMilestone.id === internalSelectedItem?.id}
              />
            )}
            {/* Displays the rest of the suggested milestones. `open` controls when the GraphQL query is sent for the list of
        milestones. If the ItemPickerMilestonesList is rendered then a query is sent. */}
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
                <ItemPickerMilestonesList
                  owner={owner}
                  repo={repo}
                  query={deferredQuery}
                  setIsSearching={setIsSearching}
                  initialSelected={initialSelected}
                  onItemSelect={onItemSelect}
                  selectedItemId={internalSelectedItem?.id}
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
