import {graphql, readInlineData, useFragment} from 'react-relay'
import type React from 'react'
import {Suspense, useCallback, useMemo, useState, useId, useDeferredValue, type PropsWithChildren} from 'react'
import {SelectPanel} from '@primer/react/drafts'
import {ActionList, Spinner} from '@primer/react'
import {testIdProps} from '@github-ui/test-id-props'
import {useDebounce} from '@github-ui/use-debounce'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {ActionListItemLabelSkeleton} from '@github-ui/action-list-items/ActionListItemLabel'
import {SearchIcon} from '@primer/octicons-react'
import type {SelectPanelProps, SelectPanelSecondaryActionProps} from '@primer/react/drafts'
import {GlobalCommands} from '@github-ui/ui-commands'

import {
  ItemPickerDoesNotExistErrorFullMessage,
  ItemPickerErrorLoadingFullMessage,
  ItemPickerErrorLoadingInlineMessage,
} from '../common/ErrorMessages'
import {matchesQuery} from '../common/matchesQuery'
import type {SubmittedLabel} from './types'
import {ItemPickerLabelsSearchProvider, useItemPickerLabelsSearch} from './SearchContext'
import {ItemPickerLabelsGraphQLVariablesProvider, useItemPickerLabelsGraphQLVariables} from './GraphQLVariablesContext'
import {ItemPickerLabelsItem, ItemPickerLabelsItem_Fragment, readInlineAdditionalData} from './ItemPickerLabelsItem'
import {CreateNewLabelButton} from './CreateNewLabelButton'
import {ItemPickerLabelsList} from './ItemPickerLabelsList'

import type {
  ItemPickerLabelsItem_Fragment$data,
  ItemPickerLabelsItem_Fragment$key,
} from './__generated__/ItemPickerLabelsItem_Fragment.graphql'
import type {ItemPickerLabels_SelectedLabelsFragment$key} from './__generated__/ItemPickerLabels_SelectedLabelsFragment.graphql'

export type ItemPickerLabelsProps = ItemPickerLabelsInternalProps & {
  repo: string
  owner: string
  /**
   * fetchLabelsWithPath: Option to return labels with url and resourcePath
   */
  fetchLabelsWithPath?: boolean
  /**
   * fetchLabelsWithDate: Option to return labels with createdAt and updatedAt
   */
  fetchLabelsWithDate?: boolean
  /**
   * selectedLabelsKey: Optional fragment key to pass in selected labels from outside of the component.
   */
  selectedLabelsKey?: ItemPickerLabels_SelectedLabelsFragment$key | null
  /**
   * shortcutEnabled: Option to enable the shortcut to open the item picker
   */
  shortcutEnabled?: boolean
}

type ItemPickerLabelsWithSelectedLabelsKeyProps = ItemPickerLabelsInternalProps &
  Required<Pick<ItemPickerLabelsProps, 'selectedLabelsKey'>>

type ItemPickerLabelsInternalProps = Omit<SelectPanelProps, 'onSubmit' | 'anchorRef' | 'children'> &
  PropsWithChildren<{
    /**
     * hasError: Option to show error message in the label picker
     */
    hasError?: boolean
    labelsButtonRef: React.RefObject<HTMLButtonElement>
    /*
     * secondaryActions: Option to pass in secondary actions to the label picker
     */
    secondaryActions?: React.ReactElement<SelectPanelSecondaryActionProps>
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    onSubmit?: (selectedItems: SubmittedLabel[]) => void

    /**
     * onCreateNewLabel: callback function for the create new label method
     */
    onCreateNewLabel?: (labelName: string) => void
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
 * This component implements a label picker that can be used e.g. in issues/show or pull requests/show.
 * The component itself is responsible to load its data using relay, based on a given repo and owner.
 */
export function ItemPickerLabels({
  selectedLabelsKey,
  owner,
  repo,
  fetchLabelsWithPath,
  fetchLabelsWithDate,
  shortcutEnabled = true,
  ...props
}: ItemPickerLabelsProps) {
  const Labels = () => {
    if (selectedLabelsKey)
      return <ItemPickerLabelsWithSelectedLabelsKey selectedLabelsKey={selectedLabelsKey} {...props} />
    return <ItemPickerLabelsInternal initialSelectedLabels={[]} {...props} />
  }

  return (
    <ItemPickerLabelsGraphQLVariablesProvider
      owner={owner}
      repo={repo}
      withDate={!!fetchLabelsWithDate}
      withPath={!!fetchLabelsWithPath}
    >
      {shortcutEnabled && !props.open && (
        <GlobalCommands
          commands={{
            'item-pickers:open-labels': () => props.setOpen(true),
          }}
        />
      )}
      <ItemPickerLabelsSearchProvider>{props.open && <Labels />}</ItemPickerLabelsSearchProvider>
    </ItemPickerLabelsGraphQLVariablesProvider>
  )
}

function ItemPickerLabelsWithSelectedLabelsKey({
  selectedLabelsKey,
  ...props
}: ItemPickerLabelsWithSelectedLabelsKeyProps) {
  const result = useFragment(
    graphql`
      fragment ItemPickerLabels_SelectedLabelsFragment on LabelConnection
      @argumentDefinitions(
        withPath: {type: "Boolean!", defaultValue: false}
        withDate: {type: "Boolean!", defaultValue: false}
      ) {
        nodes {
          ...ItemPickerLabelsItem_Fragment @arguments(withPath: $withPath, withDate: $withDate)
        }
      }
    `,
    selectedLabelsKey,
  )

  // remove all null nodes in a TypeScript-friendly way
  const initialSelectedLabels = (result?.nodes || []).flatMap(a => (a ? a : []))

  return <ItemPickerLabelsInternal initialSelectedLabels={initialSelectedLabels} {...props} />
}

export function ItemPickerLabelsInternal({
  initialSelectedLabels,
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
  maxSelectableItems = Infinity,
  maxSelectableItemsContent = `You can select up to ${maxSelectableItems} label(s).`,
  ...props
}: ItemPickerLabelsInternalProps & {
  initialSelectedLabels: ItemPickerLabelsItem_Fragment$key[]
}) {
  const {withPath, withDate} = useItemPickerLabelsGraphQLVariables()
  const {isSearching, setIsSearching, refetchOnSearch} = useItemPickerLabelsSearch()
  const [query, setQuery] = useState('')
  const [showCreateNewLabelButton, setShowCreateNewLabelButton] = useState(false)
  // Shows stale content while fresh content is loading
  // https://react.dev/reference/react/Suspense#showing-stale-content-while-fresh-content-is-loading
  const deferredQuery = useDeferredValue(query)
  const idPrefix = useId()
  const uniqueListId = `${idPrefix}-item-picker-labels`

  const initialSelected = useMemo(
    () =>
      // We retrieve the additional data for the initially selected labels to pass the labels data to the parent `onSubmit`
      initialSelectedLabels.map(({...fragmentKey}) => {
        // eslint-disable-next-line no-restricted-syntax
        const basicData: ItemPickerLabelsItem_Fragment$data = readInlineData(ItemPickerLabelsItem_Fragment, fragmentKey)
        const additionalInfo = readInlineAdditionalData(basicData, {withPath, withDate})
        return {id: basicData.id, additionalInfo} as SubmittedLabel
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

  const filteredSelectedLabels: Array<{id: string} & ItemPickerLabelsItem_Fragment$key> = useMemo(() => {
    const arr = []
    for (const [index, label] of initialSelected.entries()) {
      const labelData = initialSelectedLabels[index]
      if (matchesQuery(deferredQuery, label.additionalInfo.name, label.additionalInfo.description) && labelData) {
        arr.push({id: label.id, ...labelData})
      }
    }
    return arr
  }, [initialSelected, initialSelectedLabels, deferredQuery])

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
      <ErrorBoundary
        fallback={
          query ? (
            <ItemPickerErrorLoadingInlineMessage itemsType="labels" />
          ) : (
            <ItemPickerErrorLoadingFullMessage itemsType="labels" />
          )
        }
      >
        {hasError ? (
          <ItemPickerDoesNotExistErrorFullMessage itemsType="labels" />
        ) : (
          <ActionList showDividers>
            {filteredSelectedLabels.map(label => (
              <ItemPickerLabelsItem
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
            <Suspense // Minimum of one loading skeleton
              fallback={[1, 2, 3, 4, 5]
                .slice(0, initialSelectedLabels.length < 5 ? 5 - initialSelectedLabels.length : 1)
                .map(index => (
                  <ActionListItemLabelSkeleton
                    key={index}
                    selectType={selectionVariant}
                    // sx={{px: 3, py: 2}} TODO: convert to using CSS Module and class name
                    {...testIdProps('loading-skeleton')}
                  />
                ))}
            >
              <ItemPickerLabelsList
                query={deferredQuery}
                initialSelected={initialSelected}
                onItemSelect={onItemSelect}
                selectType={selectionVariant}
                selectedItemsIds={internalSelectedItemsIds}
                setShowCreateNewLabelButton={setShowCreateNewLabelButton}
                uniqueListId={uniqueListId}
                maxSelectableItems={maxSelectableItems}
              />
            </Suspense>
          </ActionList>
        )}
      </ErrorBoundary>

      {onCreateNewLabel && showCreateNewLabelButton && (
        <CreateNewLabelButton onCreateNewLabel={onCreateNewLabel} setOpen={setOpen} query={query} />
      )}

      {children}

      <SelectPanel.Footer>{secondaryActions}</SelectPanel.Footer>
    </SelectPanel>
  )
}
