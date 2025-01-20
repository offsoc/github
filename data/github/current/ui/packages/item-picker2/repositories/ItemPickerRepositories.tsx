import type React from 'react'
import {Suspense, useState, useDeferredValue, type PropsWithChildren} from 'react'
import {SelectPanel} from '@primer/react/drafts'
import {ActionList, Spinner} from '@primer/react'
import {testIdProps} from '@github-ui/test-id-props'
import {useDebounce} from '@github-ui/use-debounce'
import {ActionListItemRepositorySkeleton} from '@github-ui/action-list-items/ActionListItemRepository'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {SearchIcon} from '@primer/octicons-react'
import type {SelectPanelProps} from '@primer/react/drafts'

import {ItemPickerErrorLoadingFullMessage, ItemPickerErrorLoadingInlineMessage} from '../common/ErrorMessages'
import type {SubmittedRepository} from './types'
import {ItemPickerRepositoriesSearchList} from './ItemPickerRepositoriesSearchList'
import {ItemPickerRepositoriesSearchProvider, useItemPickerRepositoriesSearch} from './SearchContext'
import {ItemPickerRepositoriesList} from './ItemPickerRepositoriesList'

export type ItemPickerRepositoriesProps = ItemPickerRepositoriesInternalProps

type ItemPickerRepositoriesInternalProps = Omit<SelectPanelProps, 'onSubmit' | 'anchorRef' | 'children'> &
  PropsWithChildren<{
    repositoriesButtonRef?: React.RefObject<HTMLButtonElement>
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    onSubmit?: (selectedItem: SubmittedRepository) => void
    /*
     * showTrailingVisual: Option to display trailing arrow visual for each item. Used for two step dialogs
     */
    showTrailingVisual: boolean
  }>

/**
 * This component implements a repository picker that can be used e.g. in issues/show
 * The component itself is responsible to load its data using relay, based on a given repo and owner.
 */
export function ItemPickerRepositories(props: ItemPickerRepositoriesProps) {
  return (
    <ItemPickerRepositoriesSearchProvider>
      {props.open && <ItemPickerRepositoriesInternal {...props} />}
    </ItemPickerRepositoriesSearchProvider>
  )
}

export function ItemPickerRepositoriesInternal({
  repositoriesButtonRef,
  onCancel,
  onSubmit,
  open,
  setOpen,
  title,
  children,
  showTrailingVisual,
  ...props
}: ItemPickerRepositoriesProps) {
  const {isSearching, setIsSearching} = useItemPickerRepositoriesSearch()

  const [query, setQuery] = useState('')

  // Shows stale content while fresh content is loading
  // https://react.dev/reference/react/Suspense#showing-stale-content-while-fresh-content-is-loading
  const deferredQuery = useDeferredValue(query)

  const debouncedSetQuery = useDebounce((value: string) => {
    setQuery(value)
    // Handle case where the user clicks the clear button in the search input
    value !== '' ? setIsSearching(true) : setIsSearching(false)
  }, 300)

  const onSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetQuery(event.target.value)
  }

  const onItemSelect = (id: string, additionalInfo: SubmittedRepository['additionalInfo']) => {
    onSubmit?.({id, additionalInfo})
    setOpen(false)
  }

  return (
    <SelectPanel
      open={open}
      {...props}
      title={title}
      onCancel={() => {
        onCancel?.()
        setOpen(false)
      }}
      anchorRef={repositoriesButtonRef}
    >
      <SelectPanel.Header {...testIdProps('item-picker-repository-search-header')}>
        <SelectPanel.SearchInput
          onChange={onSearchInputChange}
          leadingVisual={
            isSearching ? (
              <Spinner size="small" sx={{display: 'flex'}} {...testIdProps('item-picker-repository-search-loading')} />
            ) : (
              SearchIcon
            )
          }
          {...testIdProps('item-picker-repository-search-input')}
        />
      </SelectPanel.Header>

      <ErrorBoundary
        fallback={
          query ? (
            <ItemPickerErrorLoadingInlineMessage itemsType="repositories" />
          ) : (
            <ItemPickerErrorLoadingFullMessage itemsType="repositories" />
          )
        }
      >
        <ActionList showDividers>
          {/* Displays the rest of the suggested repositories. `open` controls when the GraphQL query is sent for
          the list of repositories. If the ItemPickerRepositoriesList is rendered then a query is sent. */}
          {open && (
            <Suspense // Minimum of one loading skeleton
              fallback={[1, 2, 3, 4, 5].map(index => (
                <ActionListItemRepositorySkeleton
                  key={index}
                  selectType="action"
                  // sx={{px: 3, py: 2}} TODO: convert to using CSS Module and class name
                  {...testIdProps('item-picker-repository-loading-skeleton')}
                />
              ))}
            >
              {deferredQuery ? (
                <ItemPickerRepositoriesSearchList
                  query={deferredQuery}
                  onItemSelect={onItemSelect}
                  showTrailingVisual={showTrailingVisual}
                />
              ) : (
                <ItemPickerRepositoriesList onItemSelect={onItemSelect} showTrailingVisual={showTrailingVisual} />
              )}
            </Suspense>
          )}
        </ActionList>
      </ErrorBoundary>

      {children}
    </SelectPanel>
  )
}
