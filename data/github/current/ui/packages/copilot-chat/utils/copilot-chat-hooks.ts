import {verifiedFetch} from '@github-ui/verified-fetch'
import {useMutation, useQueries, useQueryClient} from '@tanstack/react-query'
import {useCallback, useEffect, useRef, useState} from 'react'

import {copilotLocalStorage} from './copilot-local-storage'
import {useChatPanelReferenceContext, useChatState} from './CopilotChatContext'
import {useChatManager} from './CopilotChatManagerContext'

export interface IndexingState {
  code: TopicIndexStatus
  docs: TopicIndexStatus
  requestStatus: CanIndexStatus
}

interface IndexingStateResponse {
  code_status: TopicIndexStatus
  docs_status: TopicIndexStatus
  can_index: CanIndexStatus
}

export enum TopicIndexStatus {
  Unknown = 'unknown',
  Indexing = 'indexing',
  Indexed = 'indexed',
  Unindexed = 'not_indexed',
}

export enum CanIndexStatus {
  Unknown = 'unknown',
  CanIndex = 'ok',
  NotFound = 'not_found',
  Unauthorized = 'unauthorized',
  Forbidden = 'forbidden',
  ServiceUnavailable = 'service_unavailable',
  Requested = 'requested',
  RequestFailed = 'request_failed',
  QuotaExhausted = 'quota_exhausted',
}

interface FilterWorkerResponse {
  query: string
  list: string[]
}

export const MIN_PANEL_HEIGHT = 256
export const MIN_PANEL_WIDTH = 400

export function useFilter(
  list: string[] | null,
  query: string,
  workerPath: string | undefined,
): [string[], boolean, () => void] {
  const workerRef = useRef<Worker>()
  const lastQueryRef = useRef<string>()
  const lastMatchesRef = useRef<string[]>([])
  const isWorkerWorking = useRef<boolean>(false)
  const [matches, setMatches] = useState<string[]>([])
  const [searching, setSearching] = useState<boolean>(true)

  const clearMatches = useCallback(() => {
    setMatches([])
    setSearching(false)
  }, [])

  const createWorker = useCallback(() => {
    if (!workerPath || !list) return

    try {
      const worker = new Worker(workerPath)
      worker.onmessage = ({data}: {data: FilterWorkerResponse}) => {
        isWorkerWorking.current = false
        setMatches(data.list)
        setSearching(false)
        lastQueryRef.current = data.query
        lastMatchesRef.current = data.list
      }

      workerRef.current = worker
    } catch (e) {
      // TODO: handle when worker cannot be created
      // eslint-disable-next-line no-console
      console.warn('Web workers are not available: ', e)
    }
  }, [workerPath, list])

  const postWorkerMessage = useCallback(
    (newQuery: string) => {
      if (isWorkerWorking.current) {
        workerRef.current?.terminate()
        createWorker()
      }

      const usePreviousMatches =
        lastQueryRef.current && newQuery.startsWith(lastQueryRef.current) && lastMatchesRef.current.length

      setSearching(true)
      isWorkerWorking.current = true
      workerRef.current?.postMessage({baseList: usePreviousMatches ? lastMatchesRef.current : list, query: newQuery})
    },
    [list, createWorker],
  )

  useEffect(() => {
    createWorker()
    return () => workerRef.current?.terminate()
  }, [createWorker])

  useEffect(() => {
    postWorkerMessage(query)
  }, [query, postWorkerMessage])

  if (!workerPath) return [[], false, () => {}]

  return [matches, searching, clearMatches]
}

export function useReposIndexingState(
  nwos: string[],
  isTopicDocset: boolean,
  checkKBStatus: boolean = false,
): [IndexingState, () => void] {
  const client = useQueryClient()

  const invalidateIndexingStatus = useCallback(
    () => Promise.all(nwos.map(nwo => client.invalidateQueries({queryKey: ['repo-indexing-state', nwo]}))),
    [client, nwos],
  )

  const results = useQueries({
    queries: nwos.map(nwo => ({
      queryKey: ['repo-indexing-state', nwo],
      queryFn: () => fetchIndexingStatus(nwo),
      placeholderData: {
        requestStatus: CanIndexStatus.Unknown,
        code: TopicIndexStatus.Unknown,
        docs: TopicIndexStatus.Unknown,
      },
      staleTime: Infinity,
    })),
  })

  const {mutate: triggerIndexingForRepos} = useMutation({
    mutationKey: ['repo-indexing-state'],
    mutationFn: () => triggerIndexing(nwos, isTopicDocset),
    onSuccess: invalidateIndexingStatus,
  })

  const aggregatedIndexingStatus = aggregateResults(
    results.map(r => r.data!),
    checkKBStatus,
  )

  const isIndexingInProgress =
    aggregatedIndexingStatus.requestStatus === CanIndexStatus.Requested ||
    aggregatedIndexingStatus.code === TopicIndexStatus.Indexing ||
    aggregatedIndexingStatus.docs === TopicIndexStatus.Indexing

  useInterval(() => void invalidateIndexingStatus(), isIndexingInProgress ? 10000 : 0)

  return [aggregatedIndexingStatus, () => triggerIndexingForRepos()]
}

export function useShowTopicPicker() {
  const state = useChatState()
  const manager = useChatManager()

  useEffect(() => {
    manager.showTopicPicker(
      (!state.selectedThreadID || state.mode === 'assistive') && state.messages.length === 0 && !state.currentTopic,
    )
    // When the thread updates, see if we need to show a blank thread.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedThreadID])
}

export function useResizablePanel() {
  const initialPanelHeight = copilotLocalStorage.getPanelHeight()
  const initialPanelWidth = copilotLocalStorage.getPanelWidth()
  const resizeStartY = useRef<number | null>(null)
  const resizeStartHeight = useRef(initialPanelHeight)
  const newHeight = useRef(initialPanelHeight)
  const resizeStartX = useRef<number | null>(null)
  const resizeStartWidth = useRef(initialPanelWidth)
  const newWidth = useRef(initialPanelWidth)
  const [panelHeight, setPanelHeight] = useState(initialPanelHeight)
  const [panelWidth, setPanelWidth] = useState(initialPanelWidth)
  const remSize = useRef(0)

  useEffect(() => {
    remSize.current = parseFloat(getComputedStyle(document.documentElement).fontSize)
  }, [])

  const getPanelHeight = (height: number) => {
    return Math.min(Math.max(height, MIN_PANEL_HEIGHT), window.innerHeight - remSize.current)
  }

  const getPanelWidth = (width: number) => {
    return Math.min(Math.max(width, MIN_PANEL_WIDTH), window.innerWidth - 2 * remSize.current)
  }

  const resize = useCallback((e: MouseEvent) => {
    if (resizeStartY.current !== null) {
      const dy = resizeStartY.current - e.clientY
      const height = getPanelHeight(resizeStartHeight.current + dy)
      setPanelHeight(height)
      newHeight.current = height
    }
    if (resizeStartX.current !== null) {
      const dx = resizeStartX.current - e.clientX
      const width = getPanelWidth(resizeStartWidth.current + dx)
      setPanelWidth(width)
      newWidth.current = width
    }
  }, [])

  const stopResize = useCallback(() => {
    window.removeEventListener('mousemove', resize)
    window.removeEventListener('mouseup', stopResize)
    if (resizeStartY.current !== null) {
      // use newHeight ref since panelHeight might not be updated yet.
      copilotLocalStorage.setPanelHeight(newHeight.current)
      resizeStartY.current = null
    }
    if (resizeStartX.current !== null) {
      copilotLocalStorage.setPanelWidth(newWidth.current)
      resizeStartX.current = null
    }
  }, [resize])

  const startResize = useCallback(
    (e: React.MouseEvent, horizontal: boolean, vertical: boolean) => {
      if (e.button === 0) {
        e.preventDefault()
        if (vertical) {
          resizeStartY.current = e.clientY
          resizeStartHeight.current = panelHeight
        }
        if (horizontal) {
          resizeStartX.current = e.clientX
          resizeStartWidth.current = panelWidth
        }
        window.addEventListener('mousemove', resize)
        window.addEventListener('mouseup', stopResize)
      }
    },
    [panelHeight, panelWidth, resize, stopResize],
  )

  const onResizerKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (e.key === 'ArrowUp') {
        const newPanelHeight = getPanelHeight(panelHeight + 4)
        setPanelHeight(newPanelHeight)
        copilotLocalStorage.setPanelHeight(newPanelHeight)
        e.preventDefault()
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      } else if (e.key === 'ArrowDown') {
        const newPanelHeight = getPanelHeight(panelHeight - 4)
        setPanelHeight(newPanelHeight)
        copilotLocalStorage.setPanelHeight(newPanelHeight)
        e.preventDefault()
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      } else if (e.key === 'ArrowRight') {
        const newPanelWidth = getPanelWidth(panelWidth - 4)
        setPanelWidth(newPanelWidth)
        copilotLocalStorage.setPanelWidth(newPanelWidth)
        e.preventDefault()
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      } else if (e.key === 'ArrowLeft') {
        const newPanelWidth = getPanelWidth(panelWidth + 4)
        setPanelWidth(newPanelWidth)
        copilotLocalStorage.setPanelWidth(newPanelWidth)
        e.preventDefault()
      }
    },
    [panelHeight, panelWidth],
  )

  return {panelWidth, panelHeight, startResize, onResizerKeyDown}
}

export function useSidePanelPositionStyles(open: boolean): {left?: string; bottom?: string} {
  const [positionStyles, setPositionStyles] = useState({})
  const panelRef = useChatPanelReferenceContext()

  useEffect(() => {
    if (open && (panelRef?.current?.clientWidth || 480) + 480 >= window.innerWidth) {
      setPositionStyles({
        left: `${window.innerWidth - (panelRef?.current?.clientWidth || 480)}px !important`,
        bottom: '64px',
      })
    } else {
      setPositionStyles({})
    }
  }, [open, panelRef])

  return positionStyles
}

async function fetchIndexingStatus(nwo: string): Promise<IndexingState> {
  const res = await fetch(`/search/check_indexing_status?nwo=${encodeURIComponent(nwo)}`, {
    headers: {Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest'},
  })

  if (!res.ok) {
    return {
      requestStatus: CanIndexStatus.RequestFailed,
      code: TopicIndexStatus.Unknown,
      docs: TopicIndexStatus.Unknown,
    }
  }

  const data = (await res.json()) as IndexingStateResponse

  return {
    requestStatus: data.can_index,
    code: data.code_status,
    docs: data.docs_status,
  }
}

async function triggerIndexing(nwos: string[], onlyDocs: boolean) {
  const nwosParam =
    nwos.length === 1 ? `nwo=${encodeURIComponent(nwos[0]!)}` : `nwos=${encodeURIComponent(JSON.stringify(nwos))}`

  return verifiedFetch(`/search/index_embeddings?${nwosParam}&index_code=${!onlyDocs}`, {method: 'POST'})
}

function aggregateResults(repoStates: IndexingState[], checkKBStatus: boolean): IndexingState {
  return {
    requestStatus: aggregateCanIndexStatuses(repoStates.map(s => s.requestStatus)),
    code: aggregateTopicIndexStatuses(repoStates.map(s => s.code)),
    docs: checkKBStatus
      ? KBStatusResults(repoStates.map(s => s.docs))
      : aggregateTopicIndexStatuses(repoStates.map(s => s.docs)),
  }
}

function KBStatusResults(statuses: TopicIndexStatus[]): TopicIndexStatus {
  // If all repos are in the process of being indexed or unindexed, the KB is unindexed
  if (statuses.every(s => s === TopicIndexStatus.Indexing || s === TopicIndexStatus.Unindexed))
    return TopicIndexStatus.Unindexed
  // If the above is false, then some repos are indexed (or unknown) and some are indexing, the KB is partially indexed
  if (statuses.some(s => s === TopicIndexStatus.Indexing)) return TopicIndexStatus.Indexing
  return TopicIndexStatus.Unknown
}

function aggregateTopicIndexStatuses(statuses: TopicIndexStatus[]): TopicIndexStatus {
  if (statuses.some(s => s === TopicIndexStatus.Indexed)) return TopicIndexStatus.Indexed
  if (statuses.some(s => s === TopicIndexStatus.Unindexed)) return TopicIndexStatus.Unindexed
  if (statuses.some(s => s === TopicIndexStatus.Indexing)) return TopicIndexStatus.Indexing
  return TopicIndexStatus.Unknown
}

function aggregateCanIndexStatuses(statuses: CanIndexStatus[]): CanIndexStatus {
  if (statuses.length === 0) return CanIndexStatus.Unknown

  if (statuses.every(s => s === CanIndexStatus.CanIndex)) return CanIndexStatus.CanIndex
  if (statuses.some(s => s === CanIndexStatus.Unknown)) return CanIndexStatus.Unknown
  // The remaining statuses are various error conditions - just return the first one
  return statuses.find(s => s !== CanIndexStatus.CanIndex && s !== CanIndexStatus.Unknown)!
}

function useInterval(callback: () => void, delay: number) {
  const intervalRef = useRef<number | undefined>(undefined)
  const savedCallback = useRef(callback)
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])
  useEffect(() => {
    const tick = () => savedCallback.current()
    if (delay > 0) {
      intervalRef.current = window.setInterval(tick, delay)
      return () => window.clearInterval(intervalRef.current)
    }
  }, [delay])
  return intervalRef
}
