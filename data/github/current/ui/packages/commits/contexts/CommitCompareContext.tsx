import {noop} from '@github-ui/noop'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import type React from 'react'
import {createContext, useCallback, useContext, useMemo, useState} from 'react'

import type {Commit} from '../types/shared'

type CommitsCompareContextProps = {
  commits: Commit[]
  selectedCommits: string[]
  clearSelectedCommits: () => void
  canCompare: boolean
  addToCompare: (commitOid: string) => void
  removeFromCompare: (commitOid: string) => void
  isCommitSelected: (commitOid: string) => boolean
  getBaseAndCompare: () => {base: string; compare: string}
}

const CompareContext = createContext<CommitsCompareContextProps>({
  commits: [],
  selectedCommits: [],
  clearSelectedCommits: noop,
  canCompare: false,
  addToCompare: noop,
  removeFromCompare: noop,
  isCommitSelected: () => false,
  getBaseAndCompare: () => ({base: '', compare: ''}),
})

export function CompareProvider({commits, children}: React.PropsWithChildren<{commits: Commit[]}>) {
  const [selectedCommits, setSelectedCommits] = useState<string[]>([])
  const canCompare = useFeatureFlag('commits_ux_refresh_compare') && commits.length > 1 && selectedCommits.length < 2

  const addToCompare = useCallback(
    (commitOid: string) => {
      //   // can only compare 2 commits at a time, user needs to deselect one before selecting another
      if (selectedCommits.length === 2 || selectedCommits.includes(commitOid)) {
        return
      }

      setSelectedCommits([...selectedCommits, commitOid])
    },
    [selectedCommits],
  )

  const removeFromCompare = useCallback(
    (commitOid: string) => {
      setSelectedCommits(selectedCommits.filter(oid => oid !== commitOid))
    },
    [selectedCommits],
  )

  const clearSelectedCommits = useCallback(() => {
    setSelectedCommits([])
  }, [])

  const isCommitSelected = useCallback(
    (commitOid: string) => {
      return selectedCommits.includes(commitOid)
    },
    [selectedCommits],
  )

  const getBaseAndCompare = useCallback(() => {
    let base = ''
    let compare = ''

    if (selectedCommits.length === 1) {
      base = selectedCommits[0]!
    }

    if (selectedCommits.length === 2) {
      // given two strings and an ordered list of strings, sort the two strings in the order they appear in the list
      const sortStrings = (a: string, b: string, list: string[]) => {
        const aIndex = list.indexOf(a)
        const bIndex = list.indexOf(b)

        if (aIndex < bIndex) {
          return [a, b]
        }

        return [b, a]
      }

      const [compareSorted, baseSorted] = sortStrings(
        selectedCommits[0]!,
        selectedCommits[1]!,
        commits.map(commit => commit.oid),
      )

      base = baseSorted!
      compare = compareSorted!
    }

    return {base, compare}
  }, [commits, selectedCommits])

  const contextProps = useMemo(
    () => ({
      commits,
      clearSelectedCommits,
      selectedCommits,
      addToCompare,
      removeFromCompare,
      canCompare,
      isCommitSelected,
      getBaseAndCompare,
    }),
    [
      commits,
      clearSelectedCommits,
      selectedCommits,
      addToCompare,
      removeFromCompare,
      canCompare,
      isCommitSelected,
      getBaseAndCompare,
    ],
  )

  return <CompareContext.Provider value={contextProps}>{children}</CompareContext.Provider>
}

export const useCommitCompare = () => {
  return useContext(CompareContext)
}
