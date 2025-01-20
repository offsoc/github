import {createContext, useContext, useMemo, useState, useCallback, type PropsWithChildren, useEffect} from 'react'
import type {BaseRepo} from './types'
import noop from 'lodash-es/noop'
import uniqBy from 'lodash-es/uniqBy'

interface ISelectedReposContext {
  count: number
  fetchSelected?: () => void
  isLoadingSelected: boolean
  remove: (repo: BaseRepo) => void
  selected: BaseRepo[] | undefined
  setAll: (newList: BaseRepo[]) => void
}

const SelectedReposContext = createContext<ISelectedReposContext>({
  count: 0,
  isLoadingSelected: false,
  remove: noop,
  selected: [],
  setAll: noop,
})

interface Props extends PropsWithChildren {
  fetchSelected?: () => void
  initialRepoCount: number
  initialSelected?: BaseRepo[]
  isLoadingSelected?: boolean
}

export function SelectedReposProvider({
  children,
  fetchSelected,
  initialRepoCount,
  initialSelected,
  isLoadingSelected = false,
}: Props) {
  const [selected, setSelected] = useState<BaseRepo[] | undefined>(initialSelected)
  const count = useMemo(() => selected?.length ?? initialRepoCount, [initialRepoCount, selected])

  // `initialSelected` will load in async, so this will set the initial value for `selected`
  // unless it has already been picked by the user
  useEffect(() => {
    if (selected) return
    setSelected(initialSelected)
  }, [selected, initialSelected])

  const setAll = useCallback((newList: BaseRepo[]) => {
    const uniq = uniqBy(newList, 'nameWithOwner')
    setSelected(uniq)
  }, [])
  const remove = useCallback(
    (repo: BaseRepo) => {
      const updatedList = selected?.filter(r => r.nameWithOwner !== repo.nameWithOwner)
      setSelected(updatedList)
    },
    [selected],
  )

  const value: ISelectedReposContext = useMemo(
    () => ({
      count,
      fetchSelected,
      isLoadingSelected,
      remove,
      selected,
      setAll,
    }),
    [count, fetchSelected, isLoadingSelected, remove, selected, setAll],
  )

  return <SelectedReposContext.Provider value={value}>{children}</SelectedReposContext.Provider>
}

export function useSelectedRepos(): ISelectedReposContext {
  const context = useContext(SelectedReposContext)

  if (!context) {
    throw new Error('useSelectedRepos must be used within <SelectedReposProvider />.')
  }

  return context
}
