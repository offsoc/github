import {repositoryPath} from '@github-ui/paths'
import {useEffect, useRef, useState} from 'react'

import {RefType, type Renderer, SearchIndex} from './search-index'

type RefsStatus = 'uninitialized' | 'loading' | 'loaded' | 'failed'

export interface RefsState {
  status: RefsStatus
  refs: string[]
  showCreateAction: boolean
  searchIndex: SearchIndex | null
}

/**
 * Given repo information and filter parameters, returns a filtered list of
 * refs, a state to indicate whether data is currently being loaded from the
 * server, and an boolean to indicate whether an action for creating a branch
 * should be shown.
 *
 * @remarks
 * This reuses the SearchIndex which was created for the <ref-selector> web
 * component. That means that any component using this hook should have
 * approximate behavior parity even though the web component itself is not
 * reused.
 */
export function useRefs(
  cacheKey: string,
  owner: string,
  repo: string,
  refType: 'branch' | 'tag',
  filterText: string,
  canCreate: boolean,
): RefsState {
  const [refsState, setRefsState] = useState<RefsState>({
    status: 'uninitialized',
    refs: [],
    showCreateAction: false,
    searchIndex: null,
  })

  /*
   * The SearchIndex expects something like a reference to a web component which
   * has a render function that can be called imperatively. We don't have access
   * to anything like that, but we can cause the react component using this hook
   * to re-render by updating state. These renderer objects are a bridge between
   * our implementation and the API that SearchIndex expects. It's a bit of a
   * hack, but a pretty reasonable one.
   */
  const branchRendererRef = useRef<Renderer>({
    render: () => {
      setRefsState(getStateFromIndex(branchIndexRef.current, canCreate))
    },
  })
  const tagRendererRef = useRef<Renderer>({
    render: () => {
      setRefsState(getStateFromIndex(tagIndexRef.current, canCreate))
    },
  })

  // Create one index for each ref type so that we can switch back and forth without reloading any data
  const branchIndexRef = useRefWithOneInitialization<SearchIndex>(() =>
    makeIndex(cacheKey, owner, repo, 'branch', branchRendererRef.current),
  )
  const tagIndexRef = useRefWithOneInitialization<SearchIndex>(() =>
    makeIndex(cacheKey, owner, repo, 'tag', tagRendererRef.current),
  )

  // If we point to a new repo we need to make new indices and load data if it is not already loaded.
  useEffect(() => {
    const nameWithOwner = `${owner}/${repo}`

    // If the current indexes do not match the new repo, throw them away and create new ones
    if (branchIndexRef.current.nameWithOwner !== nameWithOwner) {
      branchIndexRef.current = makeIndex(cacheKey, owner, repo, 'branch', branchRendererRef.current)
    }
    if (tagIndexRef.current.nameWithOwner !== nameWithOwner) {
      tagIndexRef.current = makeIndex(cacheKey, owner, repo, 'tag', tagRendererRef.current)
    }

    async function updateIndex() {
      const currentIndex = refType === 'branch' ? branchIndexRef.current : tagIndexRef.current
      currentIndex.render()
      await currentIndex.fetchData()
      currentIndex.search('')
      currentIndex.render()
    }

    updateIndex()
  }, [cacheKey, owner, repo, refType, branchIndexRef, tagIndexRef])

  // When the filter text changes or the tab is changed, search the index for the new text
  useEffect(() => {
    const currentIndex = refType === 'branch' ? branchIndexRef.current : tagIndexRef.current
    currentIndex.search(filterText)
    currentIndex.render()
  }, [filterText, refType, branchIndexRef, tagIndexRef])

  return refsState
}

function makeIndex(
  cacheKey: string,
  owner: string,
  repo: string,
  refType: 'branch' | 'tag',
  renderer: Renderer,
): SearchIndex {
  return new SearchIndex(
    refType === 'branch' ? RefType.Branch : RefType.Tag,
    renderer,
    repositoryPath({owner, repo, action: 'refs'}),
    cacheKey,
    `${owner}/${repo}`,
  )
}

function getStateFromIndex(index: SearchIndex, canCreate: boolean): RefsState {
  const status = index.fetchFailed ? 'failed' : index.isLoading ? 'loading' : 'loaded'
  const refs = index.currentSearchResult
  const showCreateAction =
    index.refType === RefType.Branch && canCreate && index.searchTerm.length > 0 && !index.exactMatchFound

  return {status, refs, showCreateAction, searchIndex: index}
}

function useRefWithOneInitialization<T>(getInitialValue: () => T): React.MutableRefObject<T> {
  const ref = useRef<T>()
  if (!ref.current) {
    ref.current = getInitialValue()
  }
  return ref as React.MutableRefObject<T> // This cast is safe because we're checking the undefined case
}
