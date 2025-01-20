import {useState, useCallback, useId} from 'react'
import {Box, Button, IconButton, ActionList, ActionMenu, Text} from '@primer/react'

import {KebabHorizontalIcon} from '@primer/octicons-react'
import {VALUES} from '../constants/values'
import {LABELS} from '../constants/labels'
import {useLocalStorage} from '@github-ui/use-safe-storage/local-storage'
import {TimelineDivider} from './row/TimelineDivider'
import {announce} from '@github-ui/aria-live'

type TimelineLoadMoreProps = {
  loadMoreTopFn?: (
    count: number,
    options?: {
      onComplete?: () => void
    },
  ) => void
  loadMoreBottomFn?: (
    count: number,
    options?: {
      onComplete?: () => void
    },
  ) => void
  /**
   * Callback run after all items have been loaded
   */
  onLoadAllComplete?: (isLoadMoreFromTop?: boolean) => void
  numberOfTimelineItems: number
  numberOfBackTimelineItems?: number
  firstItemInBackTimelineIsComment?: boolean
  lastItemInFrontTimelineIsComment?: boolean
  type: 'front' | 'highlighted-before' | 'highlighted-after'
}

export function TimelineLoadMore({
  loadMoreTopFn,
  loadMoreBottomFn,
  numberOfTimelineItems,
  numberOfBackTimelineItems,
  firstItemInBackTimelineIsComment,
  lastItemInFrontTimelineIsComment,
  type,
  onLoadAllComplete,
}: TimelineLoadMoreProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isHovering, setIsHovering] = useState<'top' | 'bottom' | undefined>(undefined)
  const [isLoadingFromTop, setIsLoadingFromTop] = useLocalStorage('loadMorePrefence', loadMoreTopFn !== undefined)
  const assertiveAnnounce = (message: string) => announce(message, {assertive: true})

  const loadMore = useCallback(
    (loadAll = false, isLoadingFromTopVar = true) => {
      if (isLoading) return

      const loadCount = loadAll ? numberOfTimelineItems : VALUES.timeline.pageSize
      setIsLoading(true)
      setIsHovering(undefined)
      setIsLoadingFromTop(isLoadingFromTopVar)

      const onComplete = () => {
        setIsLoading(false)

        if (loadAll && onLoadAllComplete) onLoadAllComplete(isLoadingFromTopVar)
      }

      if (isLoadingFromTopVar) {
        loadMoreTopFn &&
          loadMoreTopFn(loadCount, {
            onComplete,
          })
      } else {
        loadMoreBottomFn &&
          loadMoreBottomFn(loadCount, {
            onComplete,
          })
      }
    },
    [isLoading, loadMoreBottomFn, loadMoreTopFn, numberOfTimelineItems, onLoadAllComplete, setIsLoadingFromTop],
  )

  const loadAllMode = numberOfTimelineItems < VALUES.timeline.maxPreloadCount
  const numberOfLoadMoreItems =
    numberOfTimelineItems < VALUES.timeline.maxPreloadCount ? numberOfTimelineItems : VALUES.timeline.maxPreloadCount

  const loadMoreCallback = useCallback(() => {
    if (loadAllMode) assertiveAnnounce(LABELS.timeline.announcements.loadRemaining)
    else assertiveAnnounce(LABELS.timeline.announcements.loadNewer)

    loadMore(loadAllMode, isLoadingFromTop)
  }, [isLoadingFromTop, loadAllMode, loadMore])

  const loadBeforeCallback = useCallback(() => {
    assertiveAnnounce(LABELS.timeline.announcements.loadOlder)
    loadMore(false, true)
  }, [loadMore])

  const loadAfterCallback = useCallback(() => {
    assertiveAnnounce(LABELS.timeline.announcements.loadNewer)
    loadMore(false, false)
  }, [loadMore])

  const showBottomDivider =
    !numberOfBackTimelineItems || numberOfBackTimelineItems === 0 || firstItemInBackTimelineIsComment
  const showTopDivider = lastItemInFrontTimelineIsComment
  const descriptionId = useId()

  return (
    <Box sx={{py: 2, gap: 2, display: 'flex', flexDirection: 'column'}}>
      {showTopDivider && (
        <TimelineDivider isLoading={isLoading && isLoadingFromTop} large isHovered={isHovering === 'top'} />
      )}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
          borderTop: '2px solid',
          borderBottom: '2px solid',
          borderColor: 'border.muted',
          backgroundColor: 'canvas.default',
          boxShadow: 'shadow.small',
          overflowX: 'auto',
          scrollMarginTop: '100px',
          flexGrow: 1,
          py: 4,
          px: 2,
        }}
        data-testid={`issue-timeline-load-more-container-${type}`}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          }}
        >
          <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2}}>
            <Box
              sx={{
                display: 'flex',
                alignSelf: 'center',
              }}
            >
              <Text as="h3" sx={{fontSize: 'unset', fontWeight: 'bold'}} id={descriptionId}>
                <span data-testid={`issue-timeline-load-more-count-${type}`}>{numberOfTimelineItems}</span>
                <span> remaining {numberOfTimelineItems === 1 ? 'item' : 'items'}</span>
              </Text>
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer'}}>
              <Button
                onClick={loadMoreCallback}
                inactive={isLoading}
                aria-disabled={isLoading}
                data-testid={`issue-timeline-load-more-${type}`}
                aria-describedby={descriptionId}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {loadAllMode ? LABELS.timeline.loadAll : LABELS.timeline.loadMore(numberOfLoadMoreItems)}
                </Box>
              </Button>
            </Box>
          </Box>
          {!loadAllMode && (
            <Box sx={{position: 'absolute', alignSelf: 'flex-end'}}>
              <ActionMenu>
                <ActionMenu.Anchor>
                  {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                  <IconButton
                    unsafeDisableTooltip={true}
                    inactive={isLoading}
                    aria-disabled={isLoading}
                    size="small"
                    icon={KebabHorizontalIcon}
                    data-testid={`issue-timeline-load-more-options-${type}`}
                    variant="invisible"
                    aria-label="Load more actions"
                    sx={{color: 'fg.muted'}}
                  />
                </ActionMenu.Anchor>
                <ActionMenu.Overlay>
                  <ActionList sx={{width: '250px'}}>
                    {loadMoreTopFn && (
                      <ActionList.Item
                        disabled={isLoading}
                        onSelect={() => loadBeforeCallback()}
                        onMouseEnter={() => setIsHovering('top')}
                        onMouseLeave={() => setIsHovering(undefined)}
                      >
                        <span>{LABELS.timeline.loadOlder}</span>
                      </ActionList.Item>
                    )}
                    {loadMoreBottomFn && (
                      <ActionList.Item
                        disabled={isLoading}
                        onSelect={() => loadAfterCallback()}
                        onMouseEnter={() => setIsHovering('bottom')}
                        onMouseLeave={() => setIsHovering(undefined)}
                      >
                        <span>{LABELS.timeline.loadNewer}</span>
                      </ActionList.Item>
                    )}
                  </ActionList>
                </ActionMenu.Overlay>
              </ActionMenu>
            </Box>
          )}
        </Box>
      </Box>
      {showBottomDivider && (
        <TimelineDivider isLoading={isLoading && !isLoadingFromTop} large isHovered={isHovering === 'bottom'} />
      )}
    </Box>
  )
}
