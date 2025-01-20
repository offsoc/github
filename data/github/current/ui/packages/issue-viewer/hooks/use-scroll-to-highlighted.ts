import {useCallback, useEffect} from 'react'
import type {IssueTimelineFrontPaginated$data} from '../components/__generated__/IssueTimelineFrontPaginated.graphql'
import type {HighlightedTimelineBackwardPaginated$data} from '../components/__generated__/HighlightedTimelineBackwardPaginated.graphql'
import {VALUES} from '../constants/values'

type UseScrollToHighlightedProps = {
  data: IssueTimelineFrontPaginated$data | HighlightedTimelineBackwardPaginated$data
  highlightRef: React.MutableRefObject<HTMLDivElement | null>
  highlightedEventId: string | undefined
  showHighlightedTimeline?: boolean | ''
  highlightedTimelineRef?: React.MutableRefObject<HTMLDivElement | null>
  beforeAndAfterHighlightedItemLoaded?: boolean
}

// Keep track of whether we've scrolled already, because we only ever want to scroll once.
let scrolledToLoading = false
let scrolledToHighlighted = false
let isHighlightedItemVisible = false

export const useScrollToHighlighted = ({
  data,
  highlightRef,
  highlightedEventId,
  showHighlightedTimeline,
  highlightedTimelineRef,
  beforeAndAfterHighlightedItemLoaded,
}: UseScrollToHighlightedProps) => {
  const scrollToHighlightedEvent = useCallback(async () => {
    if (!data) return
    if (!highlightRef.current) return
    if (isHighlightedItemVisible) return
    if (scrolledToHighlighted) return
    if (beforeAndAfterHighlightedItemLoaded !== undefined && !beforeAndAfterHighlightedItemLoaded) return

    await mediaLoaded()

    highlightRef.current.scrollIntoView({behavior: 'instant'})
    window.scrollBy({top: -VALUES.stickyHeaderHeight, behavior: 'instant'})

    scrolledToHighlighted = true
  }, [beforeAndAfterHighlightedItemLoaded, data, highlightRef])

  // Observe, whether the highlighted item is visible.
  useEffect(() => {
    if (!highlightRef.current) return

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        if (!entry) return
        isHighlightedItemVisible = entry.isIntersecting
      },
      {rootMargin: `-${VALUES.stickyHeaderHeight}px 0px 0px 0px`, threshold: 1},
    )

    const header = highlightRef.current.children[0]
    if (!header) return

    observer.observe(header)

    return () => {
      observer.disconnect()
    }
  }, [highlightRef])

  // If the highlighted timeline is still loading, scroll to the loading indicator.
  useEffect(() => {
    if (
      showHighlightedTimeline === true &&
      !highlightRef.current &&
      !scrolledToLoading &&
      highlightedTimelineRef?.current
    ) {
      highlightedTimelineRef.current.scrollIntoView({behavior: 'instant'})
      scrolledToLoading = true
    }
  }, [showHighlightedTimeline, highlightRef, highlightedTimelineRef])

  // Scroll to the highlighted item if it's loaded.
  useEffect(() => {
    scrollToHighlightedEvent()
  }, [scrollToHighlightedEvent, highlightedEventId])
}

// Copied from: app/assets/modules/github/behaviors/timeline/progressive.ts.
// resolves when comment body videos have loaded enough data to render the preview image
async function videosReady(): Promise<unknown> {
  const videos: NodeListOf<HTMLVideoElement> = document.querySelectorAll(VALUES.commentVideo)
  const videoLoads = Array.from(videos).map(v => {
    return new Promise<HTMLVideoElement>(resolve => {
      if (v.readyState >= v.HAVE_METADATA) {
        resolve(v)
      } else {
        // don't wait forever :)
        const timeout = setTimeout(() => resolve(v), VALUES.scrollWaitMediaTimeout)
        const done = () => {
          clearTimeout(timeout)
          resolve(v)
        }
        v.addEventListener('loadeddata', () => {
          if (v.readyState >= v.HAVE_METADATA) done()
        })
        v.addEventListener('error', () => done())
      }
    })
  })
  return Promise.all(videoLoads)
}

// Copied from: app/assets/modules/github/behaviors/timeline/progressive.ts.
// resolves when comment body images are loaded
async function imagesReady(): Promise<unknown> {
  const images: NodeListOf<HTMLImageElement> = document.querySelectorAll(VALUES.commentImage)
  const imageLoads = Array.from(images).map(i => {
    new Promise<HTMLImageElement>(resolve => {
      if (i.complete) {
        resolve(i)
      } else {
        const timeout = setTimeout(() => resolve(i), VALUES.scrollWaitMediaTimeout)
        const done = () => {
          clearTimeout(timeout)
          resolve(i)
        }
        i.addEventListener('load', () => done())
        i.addEventListener('error', () => done())
      }
    })
  })
  return Promise.all(imageLoads)
}

// Copied from: app/assets/modules/github/behaviors/timeline/progressive.ts.
async function mediaLoaded(): Promise<unknown> {
  return Promise.all([videosReady(), imagesReady()])
}
