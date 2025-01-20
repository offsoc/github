import {graphql, readInlineData, useFragment} from 'react-relay'
import type React from 'react'
import {Suspense, useMemo, useState, useDeferredValue, type PropsWithChildren, useId, useCallback} from 'react'
import {SelectPanel} from '@primer/react/drafts'
import type {SelectPanelProps, SelectPanelSecondaryActionProps} from '@primer/react/drafts'
import {ActionList, Spinner} from '@primer/react'
import {testIdProps} from '@github-ui/test-id-props'
import {useDebounce} from '@github-ui/use-debounce'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {SearchIcon} from '@primer/octicons-react'
import {ActionListItemProjectSkeleton} from '@github-ui/action-list-items/ActionListItemProject'
import {GlobalCommands} from '@github-ui/ui-commands'

import {
  ItemPickerDoesNotExistErrorFullMessage,
  ItemPickerErrorLoadingFullMessage,
  ItemPickerErrorLoadingInlineMessage,
} from '../common/ErrorMessages'
import {matchesQuery} from '../common/matchesQuery'
import {
  ItemPickerPullRequestsAndBranchesSearchProvider,
  useItemPickerPullRequestsAndBranchesSearch,
} from './SearchContext'
import {ItemPickerPullRequestsAndBranchesGraphQLVariablesProvider} from './GraphQLVariablesContext'
import {
  ItemPickerBranchItem,
  ItemPickerPullRequestItem,
  ItemPickerPullRequestsAndBranchesItem_BranchFragment,
  ItemPickerPullRequestsAndBranchesItem_PullRequestFragment,
} from './ItemPickerPullRequestsAndBranchesItem'
import type {ItemPickerPullRequestsAndBranchesItem_FragmentKey, SubmittedPullRequestOrBranch} from './types'

import type {ItemPickerPullRequestsAndBranchesItem_BranchFragment$key} from './__generated__/ItemPickerPullRequestsAndBranchesItem_BranchFragment.graphql'
import type {ItemPickerPullRequestsAndBranchesItem_PullRequestFragment$key} from './__generated__/ItemPickerPullRequestsAndBranchesItem_PullRequestFragment.graphql'
import type {ItemPickerPullRequestsAndBranches_SelectedBranchesFragment$key} from './__generated__/ItemPickerPullRequestsAndBranches_SelectedBranchesFragment.graphql'
import type {ItemPickerPullRequestsAndBranches_SelectedPullRequestsFragment$key} from './__generated__/ItemPickerPullRequestsAndBranches_SelectedPullRequestsFragment.graphql'

export type ItemPickerPullRequestsAndBranchesProps = ItemPickerPullRequestsAndBranchesInternalProps & {
  repo: string
  owner: string
  /**
   * selectedPullRequestsAndBranchesKey: Optional fragment key to pass in selected PRs from outside of the component.
   */
  selectedPullRequestsKey?: ItemPickerPullRequestsAndBranches_SelectedPullRequestsFragment$key | null
  /**
   * selectedPullRequestsAndBranchesKey: Optional fragment key to pass in selected branches from outside of the component.
   */
  selectedBranchesKey?: ItemPickerPullRequestsAndBranches_SelectedBranchesFragment$key | null
  /**
   * shortcutEnabled: Option to enable the shortcut to open the item picker
   */
  shortcutEnabled?: boolean
}

type ItemPickerPullRequestsAndBranchesWithSelectedPullRequestsAndBranchesKeyProps =
  ItemPickerPullRequestsAndBranchesInternalProps &
    Required<Pick<ItemPickerPullRequestsAndBranchesProps, 'selectedBranchesKey' | 'selectedPullRequestsKey'>>

type ItemPickerPullRequestsAndBranchesInternalProps = Omit<SelectPanelProps, 'onSubmit' | 'anchorRef' | 'children'> &
  PropsWithChildren<{
    /**
     * hasError: Option to show error message in the project picker
     */
    hasError?: boolean
    buttonRef: React.RefObject<HTMLButtonElement>
    /*
     * secondaryActions: Option to pass in secondary actions to the project picker
     */
    secondaryActions?: React.ReactElement<SelectPanelSecondaryActionProps>
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    onSubmit?: (selectedItems: SubmittedPullRequestOrBranch[]) => void
    initialFilterQuery?: string
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
 * This component implements a project picker that can be used e.g. in issues/show or pull requests/show.
 * The component itself is responsible to load its data using relay, based on a given repo and owner.
 */
export function ItemPickerPullRequestsAndBranches({
  selectedPullRequestsKey,
  selectedBranchesKey,
  owner,
  repo,
  shortcutEnabled = true,
  ...props
}: ItemPickerPullRequestsAndBranchesProps) {
  const PullRequestsAndBranches = () => {
    if (selectedPullRequestsKey || selectedBranchesKey)
      return (
        <ItemPickerPullRequestsAndBranchesWithSelectedPullRequestsAndBranchesKey
          selectedPullRequestsKey={selectedPullRequestsKey ?? null}
          selectedBranchesKey={selectedBranchesKey ?? null}
          {...props}
        />
      )
    return <ItemPickerPullRequestsAndBranchesInternal initialSelectedPullRequestsAndBranches={[]} {...props} />
  }

  return (
    <ItemPickerPullRequestsAndBranchesGraphQLVariablesProvider owner={owner} repo={repo}>
      {shortcutEnabled && !props.open && (
        <GlobalCommands commands={{'item-pickers:open-development': () => props.setOpen(true)}} />
      )}
      <ItemPickerPullRequestsAndBranchesSearchProvider>
        {props.open && <PullRequestsAndBranches />}
      </ItemPickerPullRequestsAndBranchesSearchProvider>
    </ItemPickerPullRequestsAndBranchesGraphQLVariablesProvider>
  )
}

function ItemPickerPullRequestsAndBranchesWithSelectedPullRequestsAndBranchesKey({
  selectedPullRequestsKey,
  selectedBranchesKey,
  ...props
}: ItemPickerPullRequestsAndBranchesWithSelectedPullRequestsAndBranchesKeyProps) {
  const selectedBranches = useFragment(
    graphql`
      fragment ItemPickerPullRequestsAndBranches_SelectedBranchesFragment on LinkedBranchConnection {
        nodes {
          ref {
            __typename
            ...ItemPickerPullRequestsAndBranchesItem_BranchFragment
          }
        }
      }
    `,
    selectedBranchesKey,
  )

  const selectedPullRequests = useFragment(
    graphql`
      fragment ItemPickerPullRequestsAndBranches_SelectedPullRequestsFragment on PullRequestConnection {
        nodes {
          __typename
          ...ItemPickerPullRequestsAndBranchesItem_PullRequestFragment
        }
      }
    `,
    selectedPullRequestsKey ?? null,
  )

  const initialSelectedBranches: ItemPickerPullRequestsAndBranchesItem_BranchFragment$key[] = (
    selectedBranches?.nodes || []
  ).flatMap(a => (a?.ref ? a.ref : []))
  // remove all null nodes in a TypeScript-friendly way
  const initialSelectedPullRequests: ItemPickerPullRequestsAndBranchesItem_PullRequestFragment$key[] = (
    selectedPullRequests?.nodes || []
  ).flatMap(a => (a ? a : []))
  const initialSelectedPullRequestsAndBranches = [...initialSelectedBranches, ...initialSelectedPullRequests]

  return (
    <ItemPickerPullRequestsAndBranchesInternal
      initialSelectedPullRequestsAndBranches={initialSelectedPullRequestsAndBranches}
      {...props}
    />
  )
}

export function ItemPickerPullRequestsAndBranchesInternal({
  initialSelectedPullRequestsAndBranches,
  buttonRef,
  onCancel,
  onSubmit,
  open,
  selectionVariant = 'multiple',
  setOpen,
  title,
  children,
  secondaryActions,
  hasError,
  initialFilterQuery = '',
  maxSelectableItems = Infinity,
  maxSelectableItemsContent = `You can select up to ${maxSelectableItems} item(s).`,
  ...props
}: ItemPickerPullRequestsAndBranchesInternalProps & {
  initialSelectedPullRequestsAndBranches: ItemPickerPullRequestsAndBranchesItem_FragmentKey[]
}) {
  const {isSearching, setIsSearching} = useItemPickerPullRequestsAndBranchesSearch()
  const [query, setQuery] = useState(initialFilterQuery)
  // Shows stale content while fresh content is loading
  // https://react.dev/reference/react/Suspense#showing-stale-content-while-fresh-content-is-loading
  const deferredQuery = useDeferredValue(query)
  const idPrefix = useId()
  const uniqueListId = `${idPrefix}-item-picker-projects`

  const initialSelected = useMemo(() => {
    // We retrieve the additional data for the initially selected projects to pass the projects data to the parent `onSubmit`
    const selected = []
    for (const {...fragmentKey} of initialSelectedPullRequestsAndBranches) {
      if (fragmentKey.__typename === 'Ref') {
        // eslint-disable-next-line no-restricted-syntax
        const basicData = readInlineData<ItemPickerPullRequestsAndBranchesItem_BranchFragment$key>(
          ItemPickerPullRequestsAndBranchesItem_BranchFragment,
          fragmentKey,
        )

        selected.push({
          id: basicData.id,
          additionalInfo: {__typename: 'Ref', title: basicData.title},
        } as SubmittedPullRequestOrBranch)
      } else if (fragmentKey.__typename === 'PullRequest') {
        // eslint-disable-next-line no-restricted-syntax
        const basicData = readInlineData<ItemPickerPullRequestsAndBranchesItem_PullRequestFragment$key>(
          ItemPickerPullRequestsAndBranchesItem_PullRequestFragment,
          fragmentKey,
        )

        selected.push({
          id: basicData.id,
          additionalInfo: {__typename: 'PullRequest', title: basicData.title},
        } as SubmittedPullRequestOrBranch)
      }
    }
    return selected
  }, [initialSelectedPullRequestsAndBranches])

  const [internalSelectedItems, setInternalSelectedItems] = useState<SubmittedPullRequestOrBranch[]>(initialSelected)
  const internalSelectedItemsIds = useMemo(() => internalSelectedItems.map(item => item.id), [internalSelectedItems])

  const debouncedSetQuery = useDebounce((value: string) => {
    setQuery(value)
    setIsSearching(true)
  }, 300)

  const onSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetQuery(event.target.value)
  }

  const filteredSelectedPullRequestsAndBranches = useMemo(() => {
    const arr = []
    for (const [index, pullRequestOrBranch] of initialSelected.entries()) {
      let pullRequestOrBranchTitle = null
      const pullRequestOrBranchData = initialSelectedPullRequestsAndBranches[index]
      if (
        pullRequestOrBranchData?.__typename === 'PullRequest' &&
        pullRequestOrBranch.additionalInfo.__typename === 'PullRequest'
      ) {
        pullRequestOrBranchTitle = pullRequestOrBranch.additionalInfo.title
      }
      if (pullRequestOrBranchData?.__typename === 'Ref' && pullRequestOrBranch.additionalInfo.__typename === 'Ref') {
        pullRequestOrBranchTitle = pullRequestOrBranch.additionalInfo.title
      }

      if (
        pullRequestOrBranchData &&
        pullRequestOrBranchTitle !== null &&
        matchesQuery(deferredQuery, pullRequestOrBranchTitle)
      ) {
        arr.push({id: pullRequestOrBranch.id, ...pullRequestOrBranchData})
      }
    }
    return arr
  }, [initialSelected, initialSelectedPullRequestsAndBranches, deferredQuery])

  const onItemSelect = useCallback(
    (id: string, additionalInfo: SubmittedPullRequestOrBranch['additionalInfo']) => {
      if (selectionVariant === 'single' || selectionVariant === 'instant') {
        setInternalSelectedItems([{id, additionalInfo}])
      } else {
        if (!internalSelectedItemsIds.includes(id)) {
          setInternalSelectedItems([...internalSelectedItems, {id, additionalInfo}])
        } else {
          setInternalSelectedItems(internalSelectedItems.filter(selectedItem => selectedItem.id !== id))
        }
      }
    },
    [internalSelectedItems, internalSelectedItemsIds, selectionVariant],
  )

  return (
    <SelectPanel
      open={open}
      selectionVariant={selectionVariant}
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
      anchorRef={buttonRef}
    >
      <SelectPanel.Header {...testIdProps('item-picker-search-header')}>
        <SelectPanel.SearchInput
          onChange={onSearchInputChange}
          leadingVisual={
            isSearching ? (
              <Spinner size="small" sx={{display: 'flex'}} {...testIdProps('item-picker-search-loading')} />
            ) : (
              SearchIcon
            )
          }
          defaultValue={query}
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
            <ItemPickerErrorLoadingInlineMessage itemsType="pull requests and branches" />
          ) : (
            <ItemPickerErrorLoadingFullMessage itemsType="pull requests and branches" />
          )
        }
      >
        {hasError ? (
          <ItemPickerDoesNotExistErrorFullMessage itemsType="pull requests and branches" />
        ) : (
          <ActionList showDividers sx={{paddingY: 0}}>
            {filteredSelectedPullRequestsAndBranches.length > 0 && (
              <ActionList.GroupHeading variant="filled">Selected</ActionList.GroupHeading>
            )}
            {filteredSelectedPullRequestsAndBranches.map(pullRequestOrBranch =>
              pullRequestOrBranch.__typename === 'Ref' ? (
                <ItemPickerBranchItem
                  key={pullRequestOrBranch.id}
                  branchItem={pullRequestOrBranch}
                  onItemSelect={onItemSelect}
                  selected={internalSelectedItemsIds.includes(pullRequestOrBranch.id)}
                  selectType={selectionVariant}
                  uniqueListId={uniqueListId}
                  disabled={
                    internalSelectedItems.length >= maxSelectableItems &&
                    !internalSelectedItemsIds.includes(pullRequestOrBranch.id)
                  }
                />
              ) : pullRequestOrBranch.__typename === 'PullRequest' ? (
                <ItemPickerPullRequestItem
                  key={pullRequestOrBranch.id}
                  pullRequestItem={pullRequestOrBranch}
                  onItemSelect={onItemSelect}
                  selected={internalSelectedItemsIds.includes(pullRequestOrBranch.id)}
                  selectType={selectionVariant}
                  uniqueListId={uniqueListId}
                  disabled={
                    internalSelectedItems.length >= maxSelectableItems &&
                    !internalSelectedItemsIds.includes(pullRequestOrBranch.id)
                  }
                />
              ) : null,
            )}

            {/* Displays the rest of the suggested projects. `open` controls when the GraphQL query is sent for the list of
        projects. If the ItemPickerPullRequestsAndBranchesList is rendered then a query is sent. */}
            <Suspense // Minimum of one loading skeleton
              fallback={[1, 2, 3, 4, 5]
                .slice(
                  0,
                  initialSelectedPullRequestsAndBranches.length < 5
                    ? 5 - initialSelectedPullRequestsAndBranches.length
                    : 1,
                )
                .map(index => (
                  <ActionListItemProjectSkeleton
                    key={index}
                    selectType={selectionVariant}
                    // sx={{px: 3, py: 2}} TODO: convert to using CSS Module and class name
                    {...testIdProps('loading-skeleton')}
                  />
                ))}
            >
              {/* <ItemPickerPullRequestsAndBranchesList
                includeClassicPullRequestsAndBranches={includeClassicPullRequestsAndBranches}
                initialSelected={initialSelected}
                onItemSelect={onItemSelect}
                query={deferredQuery}
                selectType={selectionVariant}
                selectedItemsIds={internalSelectedItemsIds}
                uniqueListId={uniqueListId}
              /> */}
            </Suspense>
          </ActionList>
        )}
        {children}
      </ErrorBoundary>

      <SelectPanel.Footer>{secondaryActions}</SelectPanel.Footer>
    </SelectPanel>
  )
}
