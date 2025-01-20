import {useCallback, useState, useRef, useMemo} from 'react'
import {
  Box,
  Button,
  Overlay,
  Text,
  Heading,
  TextInput,
  IconButton,
  ActionMenu,
  ActionList,
  TreeView,
} from '@primer/react'
import {
  GraphIcon,
  DownloadIcon,
  TrashIcon,
  XIcon,
  SortDescIcon,
  KebabHorizontalIcon,
  DatabaseIcon,
  EyeClosedIcon,
  EyeIcon,
  NoEntryIcon,
  ChevronRightIcon,
} from '@primer/octicons-react'
import {noop} from '@github-ui/noop'
import {PerformancePaneItem} from './PerformancePaneItem'
import type {TraceData} from './types'
import type {SortType} from './DatabaseTreeItem'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {TraceDataKey, TraceDataRefreshCallbackKey} from './index'
import {ClustersDisabler} from './ClustersDisabler'

const topMargin = 110

export const PerformancePane = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isSqlGrouped, setIsSqlGrouped] = useState(false)
  const [sortType, setSortType] = useState<SortType>('none')
  const [threshold, setThreshold] = useState(0)
  const noButtonRef = useRef(null)
  const anchorRef = useRef(null)
  const [showSubscriptionQueries, setShowSubscriptionQueries] = useState(false)
  const [openClustersDisablerMenu, setOpenClustersDisablerMenu] = useState(false)
  const clustersDisablerMenuAnchorRef = useRef(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rootWindowContent = ssrSafeWindow as {[key: string]: any}

  if (!rootWindowContent[TraceDataKey]) {
    rootWindowContent[TraceDataKey] = []
  }

  const [traces, setTraces] = useState<TraceData>([...(rootWindowContent[TraceDataKey] as TraceData)])

  rootWindowContent[TraceDataRefreshCallbackKey] = useCallback(() => {
    // spread the array in a new one to force a re-render since this callback is
    // being used outside of the react world
    setTraces([...(rootWindowContent[TraceDataKey] as TraceData)])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearTraces = useCallback(() => {
    setTraces([])
    rootWindowContent[TraceDataKey] = []
  }, [rootWindowContent])

  const sortLabel = useMemo(() => {
    switch (sortType) {
      case 'duration':
        return 'by duration'
      case 'resultCount':
        return 'by count'
      default:
        return 'by time'
    }
  }, [sortType])

  if (!traces) {
    return null
  }

  if (!isOpen) {
    return (
      <Button
        sx={{position: 'absolute', top: topMargin, right: 5}}
        leadingVisual={GraphIcon}
        onClick={() => setIsOpen(true)}
      >
        API Insights
      </Button>
    )
  }

  return (
    <Overlay
      initialFocusRef={noButtonRef}
      returnFocusRef={anchorRef}
      ignoreClickRefs={[anchorRef]}
      onEscape={() => setIsOpen(!isOpen)}
      onClickOutside={noop}
      aria-labelledby="api insights"
      width="xlarge"
      height="auto"
      top={topMargin}
      // eslint-disable-next-line ssr-friendly/no-dom-globals-in-react-fc
      left={window.innerWidth - 640}
      sx={{zIndex: 9999}}
    >
      <Box sx={{padding: 4, height: '100vh'}}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            alignItems: 'center',
            mb: 1,
          }}
        >
          <GraphIcon />
          <Heading as="h2" sx={{fontSize: 14}}>
            API Insights
          </Heading>

          <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 'auto'}}>
            <TextInput
              name="threshold"
              size="small"
              sx={{width: '120px'}}
              trailingVisual="ms"
              placeholder="threshold"
              onChange={event => {
                const newThreshold = parseFloat(event.target.value)
                setThreshold(isNaN(newThreshold) ? 0 : newThreshold)
              }}
              aria-label="Threshold for filtering items by duration"
            />
            <Button
              size="small"
              onClick={() =>
                setSortType(currentSort => {
                  switch (currentSort) {
                    case 'none':
                      return 'duration'
                    case 'duration':
                      return 'resultCount'
                    case 'resultCount':
                      return 'none'
                  }
                })
              }
              leadingVisual={SortDescIcon}
              sx={{width: '110px'}}
            >
              {sortLabel}
            </Button>

            <ActionMenu>
              <ActionMenu.Anchor>
                {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                <IconButton
                  unsafeDisableTooltip={true}
                  icon={KebabHorizontalIcon}
                  size="small"
                  aria-label="Open more options"
                />
              </ActionMenu.Anchor>

              <ActionMenu.Overlay width="medium">
                <ActionList showDividers>
                  <ActionList.LinkItem onClick={clearTraces}>
                    <TrashIcon />
                    <Text sx={{fontWeight: 'bold', pl: 3}}>Clear</Text>
                  </ActionList.LinkItem>
                  <ActionList.LinkItem
                    href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(traces))}`}
                    download="api-traces.json"
                  >
                    <DownloadIcon />
                    <Text sx={{fontWeight: 'bold', pl: 3}}>Download</Text>
                  </ActionList.LinkItem>
                  <ActionList.LinkItem onClick={() => setShowSubscriptionQueries(!showSubscriptionQueries)}>
                    {showSubscriptionQueries ? <EyeClosedIcon /> : <EyeIcon />}
                    <Text sx={{fontWeight: 'bold', pl: 3}}>
                      {showSubscriptionQueries ? 'Hide subscription queries' : 'Show subscription queries'}
                    </Text>
                  </ActionList.LinkItem>
                  <ActionList.LinkItem onClick={() => setIsSqlGrouped(!isSqlGrouped)}>
                    <DatabaseIcon />
                    <Text sx={{fontWeight: 'bold', pl: 3}}>
                      {isSqlGrouped ? 'Ungroup MySQL queries by cluster' : 'Group MySQL queries by cluster'}
                    </Text>
                  </ActionList.LinkItem>
                  <ActionList.Item
                    ref={clustersDisablerMenuAnchorRef}
                    onSelect={() => {
                      setOpenClustersDisablerMenu(!openClustersDisablerMenu)
                    }}
                  >
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                      <NoEntryIcon />
                      <Text sx={{fontWeight: 'bold', pl: 3, flex: 1}}>Disable Clusters</Text>
                      <ChevronRightIcon />
                    </Box>
                  </ActionList.Item>
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              unsafeDisableTooltip={true}
              size="small"
              onClick={() => setIsOpen(false)}
              icon={XIcon}
              aria-label="Close"
            />

            <ActionMenu
              open={openClustersDisablerMenu}
              onOpenChange={setOpenClustersDisablerMenu}
              anchorRef={clustersDisablerMenuAnchorRef}
            >
              <ActionMenu.Overlay>
                <ClustersDisabler traces={traces} />
              </ActionMenu.Overlay>
            </ActionMenu>
          </Box>
        </Box>
        <Box sx={{overflow: 'auto', height: '100%', mt: 3}}>
          <nav aria-label="Files">
            <TreeView aria-label="Files">
              {traces.map((trace, index) => (
                <PerformancePaneItem
                  key={index}
                  name={trace['query_name'] as string}
                  variables={trace['query_variables'] as object}
                  item={trace}
                  isRoot={true}
                  sortType={sortType}
                  threshold={threshold}
                  showSubscriptionQueries={showSubscriptionQueries}
                  groupSqlByClusters={isSqlGrouped}
                  query_text={trace['query_text'] as string}
                />
              ))}
            </TreeView>
          </nav>
        </Box>
      </Box>
    </Overlay>
  )
}
