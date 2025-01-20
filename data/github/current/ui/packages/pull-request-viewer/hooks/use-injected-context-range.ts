import {useCallback} from 'react'
import {commitLocalUpdate, useRelayEnvironment} from 'react-relay'

export interface DiffLineRange {
  start: number
  end: number
}

type InjectedContextLinesDiffView = 'SingleDiffView' | 'ListDiffView'
type InjectedContextLinesDiffViewField = 'injectedContextLinesSingleDiffView' | 'injectedContextLinesListDiffView'
type HasInjectedContextLinesDiffViewField =
  | 'hasInjectedContextLinesSingleDiffView'
  | 'hasInjectedContextLinesListDiffView'

const singleDiffView = 'SingleDiffView'
const singleDiffViewInjectedContextlines = 'injectedContextLinesSingleDiffView'
const listDiffViewInjectedContextlines = 'injectedContextLinesListDiffView'
const singleDiffViewHasInjectedContextlines = 'hasInjectedContextLinesSingleDiffView'
const listDiffViewHasInjectedContextlines = 'hasInjectedContextLinesListDiffView'

let tempId = 0

const getInjectedContextLinesFieldName = (view: InjectedContextLinesDiffView): InjectedContextLinesDiffViewField =>
  view === singleDiffView ? singleDiffViewInjectedContextlines : listDiffViewInjectedContextlines

const getHasInjectedContextLinesFieldName = (
  view: InjectedContextLinesDiffView,
): HasInjectedContextLinesDiffViewField =>
  view === singleDiffView ? singleDiffViewHasInjectedContextlines : listDiffViewHasInjectedContextlines

export default function useInjectedContextLines(): {
  addInjectedContextLines: (patchId: string, range: DiffLineRange, view: InjectedContextLinesDiffView) => void
  clearInjectedContextLines: (patchId: string, view: InjectedContextLinesDiffView) => void
} {
  const environment = useRelayEnvironment()
  const addInjectedContextLines = useCallback(
    (patchId: string, range: DiffLineRange, view: InjectedContextLinesDiffView) => {
      commitLocalUpdate(environment, store => {
        const patch = store.get(patchId)
        if (!patch) return

        const dataID = `client:DiffLineRange:${patchId}:${tempId++}`
        const relayRange = store.create(dataID, 'DiffLineRange')
        relayRange.setValue(range.start, 'start')
        relayRange.setValue(range.end, 'end')

        const injectedContextLinesFieldName = getInjectedContextLinesFieldName(view)
        const patchRanges = patch.getLinkedRecords(injectedContextLinesFieldName) ?? []
        patch.setLinkedRecords(patchRanges.concat(relayRange), injectedContextLinesFieldName)
        patch.setValue(true, getHasInjectedContextLinesFieldName(view))
      })
    },
    [environment],
  )

  const clearInjectedContextLines = useCallback(
    (patchId: string, view: InjectedContextLinesDiffView) => {
      commitLocalUpdate(environment, store => {
        const patch = store.get(patchId)
        const injectedContextLinesFieldName = getInjectedContextLinesFieldName(view)
        const injectedContextLines = patch?.getLinkedRecords(injectedContextLinesFieldName)
        if (!injectedContextLines || !patch) return

        for (const range of injectedContextLines) {
          store.delete(range.getDataID())
        }

        patch.setLinkedRecords([], injectedContextLinesFieldName)
        patch.setValue(true, getHasInjectedContextLinesFieldName(view))
      })
    },
    [environment],
  )

  return {addInjectedContextLines, clearInjectedContextLines}
}
