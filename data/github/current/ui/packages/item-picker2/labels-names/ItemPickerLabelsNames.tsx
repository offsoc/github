import {useCallback, useMemo, useState, type PropsWithChildren, useId, useDeferredValue} from 'react'
import {useLazyLoadQuery, graphql, readInlineData} from 'react-relay'
import {SelectPanel} from '@primer/react/drafts'
import {ActionList, Spinner} from '@primer/react'
import {SearchIcon} from '@primer/octicons-react'
import {testIdProps} from '@github-ui/test-id-props'
import {useDebounce} from '@github-ui/use-debounce'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import type {SelectPanelProps, SelectPanelSecondaryActionProps} from '@primer/react/drafts'
import {GlobalCommands} from '@github-ui/ui-commands'

import {ItemPickerErrorLoadingFullMessage, SelectPanelWithErrorMessage} from '../common/ErrorMessages'
import {matchesQuery} from '../common/matchesQuery'
import type {SubmittedLabel} from './types'
import {ItemPickerLabelsGraphQLVariablesProvider, useItemPickerLabelsGraphQLVariables} from './GraphQLVariablesContext'
import {ItemPickerLabelsSearchProvider, useItemPickerLabelsSearch} from './SearchContext'
import {
  ItemPickerLabelsNamesItem,
  ItemPickerLabelsNamesItem_Fragment,
  readInlineAdditionalData,
} from './ItemPickerLabelsNamesItem'
import {ItemPickerLabelsNamesList} from './ItemPickerLabelsNamesList'
import {CreateNewLabelButton} from './CreateNewLabelButton'

import type {ItemPickerLabelsNames_Query} from './__generated__/ItemPickerLabelsNames_Query.graphql'
import type {ItemPickerLabelsNamesItem_Fragment$data} from './__generated__/ItemPickerLabelsNamesItem_Fragment.graphql'

export type ItemPickerLabelsNamesProps = Omit<SelectPanelProps, 'onSubmit' | 'anchorRef' | 'children'> &
  PropsWithChildren<{
    repo: string
    owner: string
    /**
     * hasError: Option to show error message in the label picker
     */
    hasError?: boolean
    labelsButtonRef?: React.RefObject<HTMLButtonElement>
    /*
     * secondaryActions: Option to pass in secondary actions to the label picker
     */
    secondaryActions?: React.ReactElement<SelectPanelSecondaryActionProps>
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    /**
     * preloadLabelsList: Option to preload labels once the component renders instead of waiting for the user to
     * open the item picker
     */
    preloadLabelsList?: boolean
    onSubmit?: (selectedItems: SubmittedLabel[]) => void
    /**
     * fetchLabelsWithPath: Option to return labels with url and resourcePath
     */
    fetchLabelsWithPath?: boolean
    /**
     * fetchLabelsWithDate: Option to return labels with createdAt and updatedAt
     */
    fetchLabelsWithDate?: boolean
    /**
     * onCreateNewLabel: callback function for the create new label method
     */
    onCreateNewLabel?: (labelName: string) => void
    /**
     * selectedLabelsNames: Option to pass in selected labels names from outside of the component.
     */
    selectedLabelsNames: string[]
    /**
     * shortcutEnabled: Option to enable the shortcut to open the item picker
     */
    shortcutEnabled?: boolean
    /**
     * maxSelectableItems: Optional number to limit the number of items that can be selected at once
     */
    maxSelectableItems?: number
    /**
     * maxSelectableItemsContent: Optional string or React node to display when the maxSelectableItems is reached. Message will be displayed in a <SelectPanel.Message> component.
     */
    maxSelectableItemsContent?: string | React.ReactNode
  }>
type ItemPickerLabelsNamesInternalProps = Omit<
  ItemPickerLabelsNamesProps,
  'owner' | 'repo' | 'fetchLabelsWithPath' | 'fetchLabelsWithDate'
> & {
  setQuery: React.Dispatch<React.SetStateAction<string>>
  query: string
}

export function ItemPickerLabelsNames({
  open = false,
  owner,
  repo,
  fetchLabelsWithDate,
  fetchLabelsWithPath,
  shortcutEnabled = true,
  ...props
}: ItemPickerLabelsNamesProps) {
  const [query, setQuery] = useState('')
  // Shows stale content while fresh content is loading
  // https://react.dev/reference/react/Suspense#showing-stale-content-while-fresh-content-is-loading
  const deferredQuery = useDeferredValue(query)

  return (
    <ErrorBoundary
      fallback={
        <SelectPanelWithErrorMessage
          itemsType="labels"
          {...props}
          open={open}
          onSubmit={() => {
            props.setOpen(false)
          }}
          onCancel={() => {
            props.setOpen(false)
          }}
          anchorRef={props.labelsButtonRef}
        />
      }
    >
      <ItemPickerLabelsGraphQLVariablesProvider
        owner={owner}
        repo={repo}
        withDate={!!fetchLabelsWithDate}
        withPath={!!fetchLabelsWithPath}
      >
        <ItemPickerLabelsSearchProvider>
          {shortcutEnabled && !open && (
            <GlobalCommands
              commands={{
                'item-pickers:open-labels': () => props.setOpen(true),
              }}
            />
          )}
          {open && <ItemPickerLabelsNamesInternal open={open} setQuery={setQuery} query={deferredQuery} {...props} />}
        </ItemPickerLabelsSearchProvider>
      </ItemPickerLabelsGraphQLVariablesProvider>
    </ErrorBoundary>
  )
}

function ItemPickerLabelsNamesInternal({
  selectedLabelsNames,
  labelsButtonRef,
  onCancel,
  onSubmit,
  open,
  selectionVariant = 'multiple',
  setOpen,
  title,
  children,
  secondaryActions,
  onCreateNewLabel,
  hasError,
  query,
  setQuery,
  maxSelectableItems = Infinity,
  maxSelectableItemsContent = `You can select up to ${maxSelectableItems} label(s).`,
  ...props
}: ItemPickerLabelsNamesInternalProps) {
  const {owner, repo, withDate, withPath} = useItemPickerLabelsGraphQLVariables()
  const {refetchOnSearch, isSearching, setIsSearching} = useItemPickerLabelsSearch()
  const [showCreateNewLabelButton, setShowCreateNewLabelButton] = useState(false)

  const result = useLazyLoadQuery<ItemPickerLabelsNames_Query>(
    graphql`
      query ItemPickerLabelsNames_Query(
        $repo: String!
        $owner: String!
        $query: String
        $names: String
        $withPath: Boolean!
        $withDate: Boolean!
      ) {
        repository(name: $repo, owner: $owner) {
          selectedLabels: labels(first: 20, names: $names) {
            nodes {
              id
              name
              description
              ...ItemPickerLabelsNamesItem_Fragment @arguments(withPath: $withPath, withDate: $withDate)
            }
          }
          ...ItemPickerLabelsNamesList_Fragment @arguments(withPath: $withPath, withDate: $withDate, query: $query)
        }
      }
    `,
    {
      repo,
      owner,
      query: refetchOnSearch ? query : '',
      names: selectedLabelsNames.toString(),
      withPath,
      withDate,
    },
  )
  // Typecast to always show id exists
  const initialSelectedLabels = (result?.repository?.selectedLabels?.nodes || []).flatMap(a => (a ? a : []))

  if (!result?.repository) throw new Error('Repository not found')

  const initialSelected = useMemo(
    () =>
      // We retrieve the additional data for the initially selected labels to pass the labels data to the parent `onSubmit`
      initialSelectedLabels.map(({id, ...fragmentKey}) => {
        // eslint-disable-next-line no-restricted-syntax
        const basicData = readInlineData(
          ItemPickerLabelsNamesItem_Fragment,
          fragmentKey,
        ) as ItemPickerLabelsNamesItem_Fragment$data
        const additionalInfo = readInlineAdditionalData(basicData, {withPath, withDate})
        return {id, additionalInfo} as SubmittedLabel
      }),
    [initialSelectedLabels, withDate, withPath],
  )

  const [internalSelectedItems, setInternalSelectedItems] = useState<SubmittedLabel[]>(initialSelected)
  const internalSelectedItemsIds = useMemo(() => internalSelectedItems.map(item => item.id), [internalSelectedItems])

  const debouncedSetQuery = useDebounce((value: string) => {
    setQuery(value)
    if (refetchOnSearch) setIsSearching(true)
  }, 300)

  const onSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetQuery(event.target.value)
  }

  const filteredSelectedLabels = useMemo(() => {
    if (query) {
      return initialSelectedLabels.filter(label => matchesQuery(query, label.name, label.description))
    }
    return initialSelectedLabels
  }, [initialSelectedLabels, query])

  const onItemSelect = useCallback(
    (id: string, additionalInfo: SubmittedLabel['additionalInfo']) => {
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

  const idPrefix = useId()
  const uniqueListId = `${idPrefix}-item-picker-labels`

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
      anchorRef={labelsButtonRef}
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
          {...testIdProps('item-picker-search-input')}
        />
      </SelectPanel.Header>
      {internalSelectedItems.length >= maxSelectableItems && (
        <SelectPanel.Message variant="warning" size="inline">
          {maxSelectableItemsContent}
        </SelectPanel.Message>
      )}
      {hasError ? (
        <ItemPickerErrorLoadingFullMessage itemsType="labels" />
      ) : (
        <ActionList showDividers>
          {filteredSelectedLabels.map(label => (
            <ItemPickerLabelsNamesItem
              key={label.id}
              labelItem={label}
              onItemSelect={onItemSelect}
              selected={internalSelectedItemsIds.includes(label.id)}
              selectType={selectionVariant}
              uniqueListId={uniqueListId}
              disabled={
                internalSelectedItems.length >= maxSelectableItems &&
                !internalSelectedItems.some(selectedLabel => selectedLabel.id === label.id)
              }
            />
          ))}

          {/* Displays the rest of the suggested labels. `open` controls when the GraphQL query is sent for the list of
        labels. If the ItemPickerLabelsFetch is rendered then a fetch is sent. */}
          <ItemPickerLabelsNamesList
            query={query}
            initialSelected={initialSelected}
            onItemSelect={onItemSelect}
            selectType={selectionVariant}
            selectedItemsIds={internalSelectedItemsIds}
            setShowCreateNewLabelButton={setShowCreateNewLabelButton}
            uniqueListId={uniqueListId}
            labelList={result.repository}
            maxSelectableItems={maxSelectableItems}
          />
        </ActionList>
      )}

      {onCreateNewLabel && showCreateNewLabelButton && (
        <CreateNewLabelButton onCreateNewLabel={onCreateNewLabel} setOpen={setOpen} query={query} />
      )}

      {children}
      <SelectPanel.Footer>{secondaryActions}</SelectPanel.Footer>
    </SelectPanel>
  )
}
