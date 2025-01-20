import {graphql, readInlineData, useFragment} from 'react-relay'
import type React from 'react'
import {Suspense, useCallback, useMemo, useState, useId, useDeferredValue, type PropsWithChildren} from 'react'
import {SelectPanel} from '@primer/react/drafts'
import type {SelectPanelProps, SelectPanelSecondaryActionProps} from '@primer/react/drafts'
import {ActionList, Spinner} from '@primer/react'
import {testIdProps} from '@github-ui/test-id-props'
import {useDebounce} from '@github-ui/use-debounce'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {SearchIcon} from '@primer/octicons-react'
import {GlobalCommands} from '@github-ui/ui-commands'
import {ActionListItemProjectSkeleton} from '@github-ui/action-list-items/ActionListItemProject'

import {matchesQuery} from '../common/matchesQuery'
import {
  ItemPickerDoesNotExistErrorFullMessage,
  ItemPickerErrorLoadingFullMessage,
  ItemPickerErrorLoadingInlineMessage,
} from '../common/ErrorMessages'
import type {ItemPickerProjectsItem_FragmentKey, SubmittedProject} from './types'
import {ItemPickerProjectsSearchProvider, useItemPickerProjectsSearch} from './SearchContext'
import {ItemPickerProjectsGraphQLVariablesProvider} from './GraphQLVariablesContext'
import {
  ItemPickerProjectsClassicItem,
  ItemPickerProjectsItem_ClassicProjectFragment,
  ItemPickerProjectsItem_ProjectV2Fragment,
  ItemPickerProjectsV2Item,
} from './ItemPickerProjectsItem'
import {ItemPickerProjectsList} from './ItemPickerProjectsList'

import type {ItemPickerProjectsItem_ClassicProjectFragment$key} from './__generated__/ItemPickerProjectsItem_ClassicProjectFragment.graphql'
import type {ItemPickerProjectsItem_ProjectV2Fragment$key} from './__generated__/ItemPickerProjectsItem_ProjectV2Fragment.graphql'
import type {ItemPickerProjects_SelectedClassicProjectCardsFragment$key} from './__generated__/ItemPickerProjects_SelectedClassicProjectCardsFragment.graphql'
import type {ItemPickerProjects_SelectedClassicProjectsFragment$key} from './__generated__/ItemPickerProjects_SelectedClassicProjectsFragment.graphql'
import type {ItemPickerProjects_SelectedProjectsV2Fragment$key} from './__generated__/ItemPickerProjects_SelectedProjectsV2Fragment.graphql'

export type ItemPickerProjectsProps = ItemPickerProjectsInternalProps & {
  repo: string
  owner: string
  /**
   * selectedProjectsV2Key: Optional fragment key to pass in selected projects from outside of the component.
   */
  selectedProjectsV2Key?: ItemPickerProjects_SelectedProjectsV2Fragment$key
  /**
   * selectedClassicProjectsKey: Optional fragment key to pass in selected classic projects from outside of the component.
   */
  selectedClassicProjectsKey?: ItemPickerProjects_SelectedClassicProjectsFragment$key | null
  /**
   * selectedClassicProjectCardsKey: Optional fragment key to pass in selected classic project cards
   * from outside of the component. This is used to show the selected classic projects on an issue.
   */
  selectedClassicProjectCardsKey?: ItemPickerProjects_SelectedClassicProjectCardsFragment$key | null
  /**
   * shortcutEnabled: Option to enable the shortcut to open the item picker
   */
  shortcutEnabled?: boolean
}

type ItemPickerProjectsWithSelectedProjectsKeyProps = ItemPickerProjectsInternalProps &
  Required<Pick<ItemPickerProjectsProps, 'selectedProjectsV2Key'>> &
  Pick<ItemPickerProjectsProps, 'selectedClassicProjectsKey' | 'selectedClassicProjectCardsKey'>

type ItemPickerProjectsInternalProps = Omit<SelectPanelProps, 'onSubmit' | 'anchorRef' | 'children'> &
  PropsWithChildren<{
    /**
     * hasError: Option to show error message in the project picker
     */
    hasError?: boolean
    projectsButtonRef: React.RefObject<HTMLButtonElement>
    /*
     * secondaryActions: Option to pass in secondary actions to the project picker
     */
    secondaryActions?: React.ReactElement<SelectPanelSecondaryActionProps>
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    onSubmit?: (selectedItems: SubmittedProject[]) => void
    includeClassicProjects?: boolean
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
export function ItemPickerProjects({
  selectedProjectsV2Key,
  selectedClassicProjectsKey,
  selectedClassicProjectCardsKey,
  owner,
  repo,
  shortcutEnabled = true,
  ...props
}: ItemPickerProjectsProps) {
  const Projects = () => {
    if (selectedProjectsV2Key)
      return (
        <ItemPickerProjectsWithSelectedProjectsKey
          selectedProjectsV2Key={selectedProjectsV2Key}
          selectedClassicProjectsKey={selectedClassicProjectsKey}
          selectedClassicProjectCardsKey={selectedClassicProjectCardsKey}
          {...props}
        />
      )
    return <ItemPickerProjectsInternal initialSelectedProjects={[]} {...props} />
  }

  return (
    <ItemPickerProjectsGraphQLVariablesProvider owner={owner} repo={repo}>
      {shortcutEnabled && !props.open && (
        <GlobalCommands commands={{'item-pickers:open-projects': () => props.setOpen(true)}} />
      )}
      <ItemPickerProjectsSearchProvider>{props.open && <Projects />}</ItemPickerProjectsSearchProvider>
    </ItemPickerProjectsGraphQLVariablesProvider>
  )
}

function ItemPickerProjectsWithSelectedProjectsKey({
  selectedProjectsV2Key,
  selectedClassicProjectsKey,
  selectedClassicProjectCardsKey,
  ...props
}: ItemPickerProjectsWithSelectedProjectsKeyProps) {
  const selectedProjectsV2 = useFragment(
    graphql`
      fragment ItemPickerProjects_SelectedProjectsV2Fragment on ProjectV2Connection {
        nodes {
          __typename
          ...ItemPickerProjectsItem_ProjectV2Fragment
        }
      }
    `,
    selectedProjectsV2Key,
  )

  const selectedClassicProjects = useFragment(
    graphql`
      fragment ItemPickerProjects_SelectedClassicProjectsFragment on ProjectConnection {
        nodes {
          __typename
          ...ItemPickerProjectsItem_ClassicProjectFragment
        }
      }
    `,
    selectedClassicProjectsKey ?? null,
  )

  // On an issue, only the ProjectCards node is available for classic projects so
  // to get a list of selected classic projects we need to use the ProjectCardConnection
  const selectedClassicProjectCards = useFragment(
    graphql`
      fragment ItemPickerProjects_SelectedClassicProjectCardsFragment on ProjectCardConnection {
        nodes {
          project {
            __typename
            ...ItemPickerProjectsItem_ClassicProjectFragment
          }
        }
      }
    `,
    selectedClassicProjectCardsKey ?? null,
  )

  let initialSelectedClassicProjects: ItemPickerProjectsItem_ClassicProjectFragment$key[] = []
  if (selectedClassicProjectCardsKey) {
    initialSelectedClassicProjects = (selectedClassicProjectCards?.nodes || []).flatMap(a => (a ? a.project : []))
  } else {
    initialSelectedClassicProjects = (selectedClassicProjects?.nodes || []).flatMap(a => (a ? a : []))
  }
  // remove all null nodes in a TypeScript-friendly way
  const initialSelectedProjectsV2: ItemPickerProjectsItem_ProjectV2Fragment$key[] = (
    selectedProjectsV2?.nodes || []
  ).flatMap(a => (a ? a : []))
  const initialSelectedProjects = props.includeClassicProjects
    ? [...initialSelectedProjectsV2, ...initialSelectedClassicProjects]
    : initialSelectedProjectsV2

  return <ItemPickerProjectsInternal initialSelectedProjects={initialSelectedProjects} {...props} />
}

export function ItemPickerProjectsInternal({
  initialSelectedProjects,
  projectsButtonRef,
  onCancel,
  onSubmit,
  open,
  selectionVariant = 'multiple',
  setOpen,
  title,
  children,
  secondaryActions,
  hasError,
  includeClassicProjects = false,
  initialFilterQuery = '',
  maxSelectableItems = Infinity,
  maxSelectableItemsContent = `You can select up to ${maxSelectableItems} project(s).`,
  ...props
}: ItemPickerProjectsInternalProps & {
  initialSelectedProjects: ItemPickerProjectsItem_FragmentKey[]
}) {
  const {isSearching, setIsSearching} = useItemPickerProjectsSearch()
  const [query, setQuery] = useState(initialFilterQuery)
  // Shows stale content while fresh content is loading
  // https://react.dev/reference/react/Suspense#showing-stale-content-while-fresh-content-is-loading
  const deferredQuery = useDeferredValue(query)
  const idPrefix = useId()
  const uniqueListId = `${idPrefix}-item-picker-projects`

  const initialSelected = useMemo(() => {
    // We retrieve the additional data for the initially selected projects to pass the projects data to the parent `onSubmit`
    const selected = []
    for (const {...fragmentKey} of initialSelectedProjects) {
      if (fragmentKey.__typename === 'Project') {
        // eslint-disable-next-line no-restricted-syntax
        const basicDataClassic = readInlineData<ItemPickerProjectsItem_ClassicProjectFragment$key>(
          ItemPickerProjectsItem_ClassicProjectFragment,
          fragmentKey,
        )

        selected.push({id: basicDataClassic.id, additionalInfo: {title: basicDataClassic.title}} as SubmittedProject)
      } else if (fragmentKey.__typename === 'ProjectV2') {
        // eslint-disable-next-line no-restricted-syntax
        const basicData = readInlineData<ItemPickerProjectsItem_ProjectV2Fragment$key>(
          ItemPickerProjectsItem_ProjectV2Fragment,
          fragmentKey,
        )

        selected.push({id: basicData.id, additionalInfo: {title: basicData.title}} as SubmittedProject)
      }
    }
    return selected
  }, [initialSelectedProjects])

  const [internalSelectedItems, setInternalSelectedItems] = useState<SubmittedProject[]>(initialSelected)
  const internalSelectedItemsIds = useMemo(() => internalSelectedItems.map(item => item.id), [internalSelectedItems])

  const debouncedSetQuery = useDebounce((value: string) => {
    setQuery(value)
    setIsSearching(true)
  }, 300)

  const onSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetQuery(event.target.value)
  }

  const filteredSelectedProjects = useMemo(() => {
    const arr = []
    for (const [index, project] of initialSelected.entries()) {
      const projectData = initialSelectedProjects[index]
      if (matchesQuery(deferredQuery, project.additionalInfo.title) && projectData) {
        arr.push({id: project.id, ...projectData})
      }
    }
    return arr
  }, [initialSelected, initialSelectedProjects, deferredQuery])

  const onItemSelect = useCallback(
    (id: string, additionalInfo: SubmittedProject['additionalInfo']) => {
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
      anchorRef={projectsButtonRef}
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
            <ItemPickerErrorLoadingInlineMessage itemsType="projects" />
          ) : (
            <ItemPickerErrorLoadingFullMessage itemsType="projects" />
          )
        }
      >
        {hasError ? (
          <ItemPickerDoesNotExistErrorFullMessage itemsType="projects" />
        ) : (
          <ActionList showDividers sx={{paddingY: 0}}>
            {filteredSelectedProjects.length > 0 && (
              <ActionList.GroupHeading variant="filled">Selected</ActionList.GroupHeading>
            )}
            {filteredSelectedProjects.map(project =>
              project.__typename === 'Project' ? (
                <ItemPickerProjectsClassicItem
                  key={project.id}
                  projectItem={project}
                  onItemSelect={onItemSelect}
                  selected={internalSelectedItemsIds.includes(project.id)}
                  selectType={selectionVariant}
                  uniqueListId={uniqueListId}
                  disabled={
                    internalSelectedItems.length >= maxSelectableItems && !internalSelectedItemsIds.includes(project.id)
                  }
                />
              ) : project.__typename === 'ProjectV2' ? (
                <ItemPickerProjectsV2Item
                  key={project.id}
                  projectItem={project}
                  onItemSelect={onItemSelect}
                  selected={internalSelectedItemsIds.includes(project.id)}
                  selectType={selectionVariant}
                  uniqueListId={uniqueListId}
                  disabled={
                    internalSelectedItems.length >= maxSelectableItems && !internalSelectedItemsIds.includes(project.id)
                  }
                />
              ) : null,
            )}

            {/* Displays the rest of the suggested projects. `open` controls when the GraphQL query is sent for the list of
        projects. If the ItemPickerProjectsList is rendered then a query is sent. */}
            <Suspense // Minimum of one loading skeleton
              fallback={[1, 2, 3, 4, 5]
                .slice(0, initialSelectedProjects.length < 5 ? 5 - initialSelectedProjects.length : 1)
                .map(index => (
                  <ActionListItemProjectSkeleton key={index} selectType={selectionVariant} />
                ))}
            >
              <ItemPickerProjectsList
                includeClassicProjects={includeClassicProjects}
                initialSelected={initialSelected}
                onItemSelect={onItemSelect}
                query={deferredQuery}
                selectType={selectionVariant}
                selectedItemsIds={internalSelectedItemsIds}
                uniqueListId={uniqueListId}
                maxSelectableItems={maxSelectableItems}
              />
            </Suspense>
          </ActionList>
        )}
        {children}
      </ErrorBoundary>

      <SelectPanel.Footer>{secondaryActions}</SelectPanel.Footer>
    </SelectPanel>
  )
}
