import {useCallback, useMemo} from 'react'
import type {Group, GroupTree} from '../types'
import {useOrganization} from '../contexts/OrganizationContext'

export type UseGroupTreeResult = {
  tree?: GroupTree
  groups: Group[]
  getGroup(id: number): Group | undefined
  walkTree(id: number): GroupTree | undefined
}

export const useGroupTree = (groups: Group[]): UseGroupTreeResult => {
  const organization = useOrganization()
  const groupTree: GroupTree | undefined = useMemo(() => {
    if (groups.length === 0) {
      return undefined
    }
    const root = groups[0] as Group
    const tree: GroupTree = {
      id: root.id,
      total_count: root.total_count,
      nodes: {
        [organization.name]: {
          id: root.id,
          total_count: root.total_count,
          repos: root.repos,
        },
      },
    }

    for (const {id, group_path, total_count, repos} of groups.slice(1)) {
      if (group_path === null) {
        // Skip repos not in a group
        continue
      }

      const steps = group_path.split('/')
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      let currentTree = tree.nodes![organization.name] as GroupTree
      for (const step of steps) {
        if (!currentTree.nodes) {
          currentTree.nodes = {
            [step]: {
              id,
              total_count,
              repos,
            },
          }
        } else if (!currentTree.nodes[step]) {
          currentTree.nodes[step] = {
            id,
            total_count,
            repos,
          }
        }
        currentTree = currentTree.nodes[step] as GroupTree
      }
    }

    return tree
  }, [groups, organization])

  const getGroup = useCallback(
    (id: number) => {
      return groups?.find(group => group.id === id)
    },
    [groups],
  )

  const walkTree = useCallback(
    (id: number) => {
      if (!groupTree || !getGroup(id)) {
        return undefined
      }
      function walk(subTree: GroupTree): GroupTree | undefined {
        if (subTree.id === id) {
          return subTree
        }
        if (subTree.nodes) {
          for (const group_path in subTree.nodes) {
            const trail = walk(subTree.nodes[group_path] as GroupTree)
            if (trail) {
              return trail
            }
          }
        }
        return undefined
      }
      return walk(groupTree)
    },
    [groupTree, getGroup],
  )

  return useMemo<UseGroupTreeResult>(
    () => ({
      tree: groupTree,
      groups,
      getGroup,
      walkTree,
    }),
    [groupTree, groups, getGroup, walkTree],
  )
}
