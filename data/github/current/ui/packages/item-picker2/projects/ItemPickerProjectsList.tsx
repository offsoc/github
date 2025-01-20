import {useLazyLoadQuery} from 'react-relay'
import {graphql, readInlineData} from 'relay-runtime'
import {useCallback, useEffect, useMemo} from 'react'
import {ActionList} from '@primer/react'

import {matchesQuery} from '../common/matchesQuery'
import {useItemPickerProjectsGraphQLVariables} from './GraphQLVariablesContext'
import {useItemPickerProjectsSearch} from './SearchContext'
import type {SubmittedProject} from './types'
import type {ItemPickerProjectsItem} from './ItemPickerProjectsItem'
import {
  ItemPickerProjectsClassicItem,
  ItemPickerProjectsItem_ClassicProjectFragment,
  ItemPickerProjectsItem_ProjectV2Fragment,
  ItemPickerProjectsV2Item,
} from './ItemPickerProjectsItem'

import type {ItemPickerProjectsList_Query} from './__generated__/ItemPickerProjectsList_Query.graphql'
import type {
  ItemPickerProjectsItem_ProjectV2Fragment$data,
  ItemPickerProjectsItem_ProjectV2Fragment$key,
} from './__generated__/ItemPickerProjectsItem_ProjectV2Fragment.graphql'
import type {
  ItemPickerProjectsItem_ClassicProjectFragment$data,
  ItemPickerProjectsItem_ClassicProjectFragment$key,
} from './__generated__/ItemPickerProjectsItem_ClassicProjectFragment.graphql'

const PROJECTS_PER_CATEGORY = 10
const MAX_NUMBER_OF_ITEMS_IN_PROJECTV2 = 1200

export type ItemPickerProjectsListProps = {
  initialSelected: SubmittedProject[]
  query: string
  selectedItemsIds: string[]
  includeClassicProjects?: boolean
  maxSelectableItems?: number
} & Pick<ItemPickerProjectsItem, 'onItemSelect' | 'selectType' | 'uniqueListId'>

export function ItemPickerProjectsList({
  query,
  selectedItemsIds,
  includeClassicProjects = false,
  initialSelected,
  maxSelectableItems = Infinity,
  ...props
}: ItemPickerProjectsListProps) {
  const {setIsSearching} = useItemPickerProjectsSearch()
  const {owner, repo} = useItemPickerProjectsGraphQLVariables()
  const initialSelectedItemIds = useMemo(() => initialSelected.map(item => item.id), [initialSelected])

  const projectsData = useLazyLoadQuery<ItemPickerProjectsList_Query>(
    graphql`
      query ItemPickerProjectsList_Query($repo: String!, $owner: String!, $query: String, $count: Int!) {
        repository(owner: $owner, name: $repo) {
          projects(first: $count, search: $query, orderBy: {field: UPDATED_AT, direction: DESC}) {
            nodes {
              updatedAt
              ...ItemPickerProjectsItem_ClassicProjectFragment
            }
          }
          projectsV2(first: $count, query: $query, orderBy: {field: UPDATED_AT, direction: DESC}) {
            nodes {
              items {
                totalCount
              }
              updatedAt
              ...ItemPickerProjectsItem_ProjectV2Fragment
            }
          }

          owner {
            ... on Organization {
              projects(first: $count, search: $query, orderBy: {field: UPDATED_AT, direction: DESC}) {
                nodes {
                  updatedAt
                  ...ItemPickerProjectsItem_ClassicProjectFragment
                }
              }
              projectsV2(first: $count, orderBy: {field: UPDATED_AT, direction: DESC}, query: $query) {
                edges {
                  node {
                    items {
                      totalCount
                    }
                    updatedAt
                    ...ItemPickerProjectsItem_ProjectV2Fragment
                  }
                }
              }
            }
            ... on User {
              projects(first: $count, search: $query, orderBy: {field: UPDATED_AT, direction: DESC}) {
                nodes {
                  ...ItemPickerProjectsItem_ClassicProjectFragment
                }
              }
              projectsV2(first: $count, orderBy: {field: UPDATED_AT, direction: DESC}, query: $query) {
                edges {
                  node {
                    items {
                      totalCount
                    }
                    updatedAt
                    ...ItemPickerProjectsItem_ProjectV2Fragment
                  }
                }
              }
            }
          }
        }
      }
    `,
    {
      repo,
      owner,
      count: PROJECTS_PER_CATEGORY,
      query,
    },
  )

  const filterItems = useCallback(
    (item: ItemPickerProjectsItem_ProjectV2Fragment$data | ItemPickerProjectsItem_ClassicProjectFragment$data) => {
      if (item.__typename === 'ProjectV2') return item.closed === false && !initialSelectedItemIds.includes(item.id)
      return (
        item.closed === false && (item.columns?.edges || []).length > 0 && !initialSelectedItemIds.includes(item.id)
      )
    },
    [initialSelectedItemIds],
  )

  useEffect(() => {
    setIsSearching(false)
    // We disable loading search icon when query changes because we use useDeferredValue on the query
  }, [query, setIsSearching])

  const classicOrganizationProjects = useMemo(
    () =>
      (!includeClassicProjects ? [] : projectsData.repository?.owner?.projects?.nodes || []).flatMap(a =>
        a
          ? [
              // eslint-disable-next-line no-restricted-syntax
              readInlineData<ItemPickerProjectsItem_ClassicProjectFragment$key>(
                ItemPickerProjectsItem_ClassicProjectFragment,
                a,
              ),
            ]
              .filter(item => filterItems(item))
              .map(item => ({...item, ...a}))
          : [],
      ),
    [includeClassicProjects, projectsData.repository?.owner?.projects?.nodes, filterItems],
  )

  const classicRepositoryProjects = useMemo(
    () =>
      (!includeClassicProjects ? [] : projectsData.repository?.projects?.nodes || []).flatMap(a =>
        a
          ? [
              // eslint-disable-next-line no-restricted-syntax
              readInlineData<ItemPickerProjectsItem_ClassicProjectFragment$key>(
                ItemPickerProjectsItem_ClassicProjectFragment,
                a,
              ),
            ]
              .filter(
                item =>
                  filterItems(item) &&
                  !classicOrganizationProjects
                    .slice(0, 5) // slicing org projects to only filter out the visible ones
                    .map(p => p.id)
                    .includes(item.id),
              )
              .map(item => ({...item, ...a}))
          : [],
      ),
    [projectsData.repository?.projects?.nodes, includeClassicProjects, filterItems, classicOrganizationProjects],
  )

  const memexOrganizationProjects = useMemo(
    () =>
      (projectsData.repository?.owner?.projectsV2?.edges || []).flatMap(a => {
        const nodeItem = a?.node
        return nodeItem
          ? [
              // eslint-disable-next-line no-restricted-syntax
              readInlineData<ItemPickerProjectsItem_ProjectV2Fragment$key>(
                ItemPickerProjectsItem_ProjectV2Fragment,
                a.node,
              ),
            ]
              .filter(item => filterItems(item))
              .map(item => ({...item, ...nodeItem}))
          : []
      }),
    [projectsData.repository?.owner?.projectsV2?.edges, filterItems],
  )

  const memexRepositoryProjects = useMemo(
    () =>
      (projectsData.repository?.projectsV2?.nodes || []).flatMap(a =>
        a
          ? [
              // eslint-disable-next-line no-restricted-syntax
              readInlineData<ItemPickerProjectsItem_ProjectV2Fragment$key>(ItemPickerProjectsItem_ProjectV2Fragment, a),
            ]
              .filter(
                item =>
                  filterItems(item) &&
                  !memexOrganizationProjects
                    .slice(0, 5) // slicing org projects to only filter out the visible ones
                    .map(p => p.id)
                    .includes(item.id),
              )
              .map(item => ({...item, ...a}))
          : [],
      ),
    [projectsData.repository?.projectsV2?.nodes, filterItems, memexOrganizationProjects],
  )

  const repositoryProjects = useMemo(
    () => [...classicRepositoryProjects, ...memexRepositoryProjects],
    [classicRepositoryProjects, memexRepositoryProjects],
  )

  const organizationProjects = useMemo(
    () => [...classicOrganizationProjects, ...memexOrganizationProjects],
    [classicOrganizationProjects, memexOrganizationProjects],
  )

  const filteredProjects = useMemo(() => {
    const allProjects = [...repositoryProjects, ...organizationProjects]
    return allProjects
      .filter(project => matchesQuery(query, project.title))
      .sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })
  }, [repositoryProjects, organizationProjects, query])

  // We retrieve 10 projects for each category but slice by 5 to make sure that we account for any duplicates
  // and are still able to show at least 5 for each category
  return (
    <>
      {query.trim().length > 0 ? (
        filteredProjects.map(project => {
          if (project.__typename === 'ProjectV2') {
            return (
              <ItemPickerProjectsV2Item
                key={project.id}
                projectItem={project}
                selected={selectedItemsIds.includes(project.id)}
                disabled={
                  (selectedItemsIds.length >= maxSelectableItems && !selectedItemsIds.includes(project.id)) ||
                  project.items.totalCount >= MAX_NUMBER_OF_ITEMS_IN_PROJECTV2
                }
                {...props}
              />
            )
          } else {
            return (
              <ItemPickerProjectsClassicItem
                key={project.id}
                projectItem={project}
                selected={selectedItemsIds.includes(project.id)}
                disabled={selectedItemsIds.length >= maxSelectableItems && !selectedItemsIds.includes(project.id)}
                {...props}
              />
            )
          }
        })
      ) : (
        <>
          {repositoryProjects.length > 0 && (
            <ActionList.Group>
              <ActionList.GroupHeading variant="filled">Repository</ActionList.GroupHeading>
              {repositoryProjects
                .slice(0, 5)
                .map(project =>
                  project.__typename === 'ProjectV2' ? (
                    <ItemPickerProjectsV2Item
                      key={project.id}
                      projectItem={project}
                      selected={selectedItemsIds.includes(project.id)}
                      disabled={
                        (selectedItemsIds.length >= maxSelectableItems && !selectedItemsIds.includes(project.id)) ||
                        project.items.totalCount >= MAX_NUMBER_OF_ITEMS_IN_PROJECTV2
                      }
                      inactiveText={
                        project.items.totalCount >= MAX_NUMBER_OF_ITEMS_IN_PROJECTV2
                          ? 'Maximum number of items reached. To add more, please archive or delete existing items from the project.'
                          : undefined
                      }
                      {...props}
                    />
                  ) : (
                    <ItemPickerProjectsClassicItem
                      key={project.id}
                      projectItem={project}
                      selected={selectedItemsIds.includes(project.id)}
                      disabled={selectedItemsIds.length >= maxSelectableItems && !selectedItemsIds.includes(project.id)}
                      {...props}
                    />
                  ),
                )}
            </ActionList.Group>
          )}
          {organizationProjects.length > 0 && (
            <ActionList.Group>
              <ActionList.GroupHeading variant="filled">Organization</ActionList.GroupHeading>
              {organizationProjects
                .slice(0, 5)
                .map(project =>
                  project.__typename === 'ProjectV2' ? (
                    <ItemPickerProjectsV2Item
                      key={project.id}
                      projectItem={project}
                      selected={selectedItemsIds.includes(project.id)}
                      disabled={
                        (selectedItemsIds.length >= maxSelectableItems && !selectedItemsIds.includes(project.id)) ||
                        project.items.totalCount >= MAX_NUMBER_OF_ITEMS_IN_PROJECTV2
                      }
                      inactiveText={
                        project.items.totalCount >= MAX_NUMBER_OF_ITEMS_IN_PROJECTV2
                          ? 'Maximum number of items reached. To add more, please archive or delete existing items from the project.'
                          : undefined
                      }
                      {...props}
                    />
                  ) : (
                    <ItemPickerProjectsClassicItem
                      key={project.id}
                      projectItem={project}
                      selected={selectedItemsIds.includes(project.id)}
                      disabled={selectedItemsIds.length >= maxSelectableItems && !selectedItemsIds.includes(project.id)}
                      {...props}
                    />
                  ),
                )}
            </ActionList.Group>
          )}
        </>
      )}
    </>
  )
}
