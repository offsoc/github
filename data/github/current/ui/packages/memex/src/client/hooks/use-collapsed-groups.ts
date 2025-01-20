import omitBy from 'lodash-es/omitBy'
import {useEffect, useState} from 'react'

import {safeLocalStorage} from '../platform/safe-local-storage'
import {useProjectNumber} from '../state-providers/memex/use-project-number'

type ProjectGroups = Record<number, CollapsedGroup>
type CollapsedGroup = Record<number, Array<string>>

const storageKey = 'projects.collapsedGroups'

// get project groups from localstorage
// storage shape
// {[projectNumber]: {
//   [viewNumber]: [groupIds]
// }}
const getProjectGroups = () => {
  const projectGroups = safeLocalStorage.getItem(storageKey)
  if (!projectGroups) return {}
  try {
    const parsedGroups = JSON.parse(projectGroups)
    const isValid = typeof parsedGroups === 'object' && parsedGroups !== null
    if (isValid) {
      return parsedGroups as ProjectGroups
    } else {
      safeLocalStorage.removeItem(storageKey)
      return {}
    }
  } catch (err) {
    safeLocalStorage.removeItem(storageKey)
    return {}
  }
}

const writeProjectGroupsToLocalStorage = (groups: ProjectGroups) => {
  // remove empties so this maybe won't grow forever
  const filteredGroups = omitBy(groups, projectGroup => {
    const filteredGroup = omitBy(projectGroup, group => group.length !== 0)
    return Object.keys(filteredGroup).length !== 0
  })

  if (Object.keys(filteredGroups).length === 0) {
    safeLocalStorage.removeItem(storageKey)
  } else {
    safeLocalStorage.setItem(storageKey, JSON.stringify(filteredGroups))
  }
}

export const useCollapsedGroups = () => {
  const {projectNumber} = useProjectNumber()
  const [collapsedGroups, setCollapsedGroups] = useState<CollapsedGroup>(() => {
    const groups = getProjectGroups()
    return groups[projectNumber] ?? {}
  })

  useEffect(() => {
    const projectGroups = getProjectGroups()
    writeProjectGroupsToLocalStorage({...projectGroups, [projectNumber]: collapsedGroups})
  }, [projectNumber, collapsedGroups])

  return [collapsedGroups, setCollapsedGroups] as const
}
