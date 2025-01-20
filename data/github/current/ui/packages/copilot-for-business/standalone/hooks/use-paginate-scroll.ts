import {useRef, useMemo, useCallback, useEffect} from 'react'

const DEFAULT_PAGE_SIZE = 25

type Configs = {
  shouldLoadMore: boolean
  shouldReset: boolean
  loading: boolean
  currentPage: number
  totalItems: number
  onPaginate: (currentPage: number) => void
  pageSize?: number
}

export function usePaginateScroll(configs: Configs) {
  const {
    loading,
    currentPage,
    totalItems,
    pageSize = DEFAULT_PAGE_SIZE,
    onPaginate,
    shouldLoadMore,
    shouldReset,
  } = configs

  const listEndRef = useRef<HTMLDivElement | null>(null)
  const listHeadRef = useRef<HTMLDivElement | null>(null)
  const doReset = useRef(false)

  const hasLoadedAllPages = useMemo(() => {
    return currentPage * pageSize >= totalItems
  }, [currentPage, totalItems, pageSize])

  const loadMore = useCallback(async () => {
    if (loading) return
    if (hasLoadedAllPages) return
    if (!shouldLoadMore) return

    onPaginate(currentPage + 1)
  }, [shouldLoadMore, loading, hasLoadedAllPages, currentPage, onPaginate])

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0]

      if (target?.isIntersecting) {
        loadMore()
      }
    },
    [loadMore],
  )

  useEffect(() => {
    if (!listEndRef.current) return

    const observer = new IntersectionObserver(handleIntersection, {root: listHeadRef.current})

    observer.observe(listEndRef.current)

    return () => {
      observer.disconnect()
    }
  }, [handleIntersection, listHeadRef, loading])

  useEffect(() => {
    if (shouldReset) {
      doReset.current = true
      onPaginate(1)
    }
  }, [onPaginate, shouldReset])

  return {listEndRef, listHeadRef, doReset}
}
