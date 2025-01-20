import type {DiffAnnotation, NavigationThread} from '@github-ui/conversations'
import {parseAnnotationHash, parseCommentHash} from '@github-ui/diff-lines'
import {createContext, useCallback, useContext, useEffect, useMemo} from 'react'

import type {DiffAnnotationsByPathMap} from '../helpers/annotation-helpers'
import {updateURLHash} from '../helpers/document-hash-helpers'
import {markerSorter} from '../helpers/markers-sorter-helpers'
import {useFetchAnchoredAnnotationData} from '../hooks/use-fetch-anchored-annotation-data'
import {useFetchAnchoredCommentData} from '../hooks/use-fetch-anchored-comment-data'

const PullRequestMarkersContext = createContext<PullRequestMarkersContextData | null>(null)

export interface GlobalMarkerNavigationState {
  activePathDigest: string | undefined
  activeGlobalMarkerID: string | undefined
}

interface PullRequestMarkersContextData {
  annotationMap: DiffAnnotationsByPathMap
  diffAnnotations: DiffAnnotation[]
  filteredAnnotations: DiffAnnotation[]
  filteredMarkers: Array<NavigationThread | DiffAnnotation>
  threads: NavigationThread[]
  incrementActiveMarker: (currentMarkerId: string) => void
  decrementActiveMarker: (currentMarkerId: string) => void
  setActiveGlobalMarkerId: (markerId: string) => void
  onActivateGlobalMarkerNavigation: () => void
}

// Using type predicates, choose the unique non-nullable fields to check the type
function isThread(marker: DiffAnnotation | NavigationThread): marker is NavigationThread {
  return (marker as NavigationThread).isResolved !== undefined
}
function isAnnotation(marker: DiffAnnotation | NavigationThread): marker is DiffAnnotation {
  return (marker as DiffAnnotation).location !== undefined
}

/**
 * Context that stores the navigation thread and annotations information.
 * Annotations are loaded here since they are manually placed in the difflines and because users should be able to navigate through them just like threads.
 */
export function PullRequestMarkersDialogContextProvider({
  children,
  annotationMap,
  diffAnnotations,
  filteredFiles,
  threads,
  setGlobalMarkerNavigationState,
}: {
  annotationMap: DiffAnnotationsByPathMap
  diffAnnotations: DiffAnnotation[]
  children: React.ReactNode
  filteredFiles: Set<string> | undefined
  threads: NavigationThread[]
  setGlobalMarkerNavigationState: (state: GlobalMarkerNavigationState) => void
}) {
  /**
   * Unset the global marker navigation path digest, to indicate opening marker already happened
   */
  const onActivateGlobalMarkerNavigation = useCallback(() => {
    setGlobalMarkerNavigationState({
      activePathDigest: undefined,
      activeGlobalMarkerID: undefined,
    })
  }, [setGlobalMarkerNavigationState])

  const filteredThreads: NavigationThread[] = useMemo(() => {
    return threads.filter(thread => filteredFiles?.has(thread.pathDigest) && !thread.isResolved)
  }, [threads, filteredFiles])

  const filteredThreadsWithResolved = useMemo(() => {
    return threads.filter(thread => filteredFiles?.has(thread.pathDigest))
  }, [threads, filteredFiles])

  const filteredAnnotations: DiffAnnotation[] = useMemo(() => {
    return diffAnnotations.filter(thread => filteredFiles?.has(thread.pathDigest))
  }, [diffAnnotations, filteredFiles])

  const filteredMarkers: Array<DiffAnnotation | NavigationThread> = useMemo(() => {
    return markerSorter([...filteredAnnotations, ...filteredThreads])
  }, [filteredAnnotations, filteredThreads])

  const filteredMarkersWithResolved: Array<DiffAnnotation | NavigationThread> = useMemo(() => {
    return markerSorter([...filteredAnnotations, ...filteredThreadsWithResolved])
  }, [filteredAnnotations, filteredThreadsWithResolved])

  const openMarker = useCallback(
    (marker: NavigationThread | DiffAnnotation) => {
      if (isThread(marker)) {
        setGlobalMarkerNavigationState({
          activePathDigest: marker.pathDigest,
          activeGlobalMarkerID: marker.id,
        })
        updateURLHash(`r${marker.firstReviewCommentId}`)
      } else if (isAnnotation(marker)) {
        setGlobalMarkerNavigationState({
          activePathDigest: marker.pathDigest,
          activeGlobalMarkerID: marker.id,
        })
        updateURLHash(`annotation_${marker.databaseId}`)
      }
    },
    [setGlobalMarkerNavigationState],
  )

  // Move forward in the list of markers, wrapping around to the beginning if necessary.
  const incrementActiveMarker = useCallback(
    function incrementActiveMarker(currentMarkerId: string) {
      const index = filteredMarkers.findIndex(marker => {
        return currentMarkerId === marker.id
      })
      const nextIndex = (index + 1) % filteredMarkers.length
      const nextMarker = filteredMarkers[nextIndex]
      if (nextMarker) {
        openMarker(nextMarker)
      }
    },
    [filteredMarkers, openMarker],
  )

  // Move backwards in the list of markers, wrapping around to the end if necessary.
  const decrementActiveMarker = useCallback(
    function decrementActiveMarker(currentMarkerId: string) {
      const index = filteredMarkers.findIndex(marker => {
        return currentMarkerId === marker.id
      })
      const nextIndex = (index - 1 + filteredMarkers.length) % filteredMarkers.length
      const nextMarker = filteredMarkers[nextIndex]
      if (nextMarker) {
        openMarker(nextMarker)
      }
    },
    [filteredMarkers, openMarker],
  )

  // Set the active global marker id from anywhere
  const setActiveGlobalMarkerId = useCallback(
    (markerId: string) => {
      const index = filteredMarkersWithResolved.findIndex(marker => markerId === marker.id)

      const marker = filteredMarkersWithResolved[index]
      if (marker) {
        openMarker(marker)
      }
    },
    [filteredMarkersWithResolved, openMarker],
  )

  const fetchAnchoredCommentData = useFetchAnchoredCommentData()
  useEffect(() => {
    async function fetchAndSetAnchoredCommentData() {
      const anchoredCommentId = parseCommentHash(location.hash)
      if (!anchoredCommentId) return

      const commentData = await fetchAnchoredCommentData(anchoredCommentId)
      if (!commentData) return

      setGlobalMarkerNavigationState({
        activePathDigest: commentData.threadPathDigest,
        activeGlobalMarkerID: commentData.threadId,
      })
    }

    void fetchAndSetAnchoredCommentData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAnchoredAnnotationData = useFetchAnchoredAnnotationData()
  useEffect(() => {
    async function fetchAndSetAnchoredAnnotationData() {
      const anchoredAnnotationId = parseAnnotationHash(location.hash)
      if (!anchoredAnnotationId) return

      const annotation = await fetchAnchoredAnnotationData(anchoredAnnotationId)

      if (annotation) {
        setGlobalMarkerNavigationState({
          activePathDigest: annotation.pathDigest,
          activeGlobalMarkerID: annotation.id,
        })
      }
    }

    void fetchAndSetAnchoredAnnotationData()
  }, [annotationMap, setGlobalMarkerNavigationState, fetchAnchoredAnnotationData])

  const value = useMemo(() => {
    return {
      annotationMap,
      diffAnnotations,
      filteredAnnotations,
      filteredMarkers,
      threads,
      incrementActiveMarker,
      decrementActiveMarker,
      setActiveGlobalMarkerId,
      onActivateGlobalMarkerNavigation,
    }
  }, [
    annotationMap,
    diffAnnotations,
    filteredAnnotations,
    filteredMarkers,
    threads,
    incrementActiveMarker,
    decrementActiveMarker,
    setActiveGlobalMarkerId,
    onActivateGlobalMarkerNavigation,
  ])

  return <PullRequestMarkersContext.Provider value={value}>{children}</PullRequestMarkersContext.Provider>
}

export function usePullRequestMarkersContext() {
  const context = useContext(PullRequestMarkersContext)
  if (!context) {
    throw new Error('usePullRequestMarkersContext must be used within a PullRequestMarkersDialogContextProvider')
  }
  return context
}
