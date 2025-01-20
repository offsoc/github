import {Link} from '@github-ui/react-core/link'
import {ScreenSize, useScreenSize} from '@github-ui/screen-size'
import {useNavigate} from '@github-ui/use-navigate'
import {ObservableBox} from '@github-ui/use-sticky-header/ObservableBox'
import {useStickyHeader} from '@github-ui/use-sticky-header/useStickyHeader'
import {FileDiffIcon, GitCommitIcon, HomeIcon, PulseIcon} from '@primer/octicons-react'
import {Box, CounterLabel, NavList, SplitPageLayout} from '@primer/react'
import {memo, useCallback, useEffect, useId, useRef, useState} from 'react'
import {graphql, useFragment} from 'react-relay'
import {useLocation, useMatch, useParams, useResolvedPath} from 'react-router-dom'

import {useNavigationPaneContext} from '../contexts/NavigationPaneContext'
import {stickyHeaderHeight} from '../helpers/sticky-headers'
import {useRouteInfo} from '../hooks/use-route-info'
import {pullRequestActivityUrl, pullRequestCommitsUrl, pullRequestFilesChangedUrl, pullRequestUrl} from '../utils/urls'
import type {Navigation_pullRequest$key} from './__generated__/Navigation_pullRequest.graphql'
import {CommitsDropdown} from './CommitsDropdown'
import {FileFilter} from './diffs/FileFilter'
import FileTree from './FileTree'

interface PullRequestTabNavigationProps {
  condensed?: boolean
  changedFiles?: number
}

/**
 * NavItem returns a Nav.Item for Pull Request Tab Navigation
 * When condensed, it renders as a single column of icons
 *
 * @param condensed - boolean to determine if the navigation is condensed
 * @param to -  the path to navigate to
 * @param icon -  the icon to display beside the title of the navigation item, or, in the case of condensed mode, on its own
 * @param title - name of the navigation item
 * @param trailingVisual - optional trailing visual
 * @param isActiveTab - optional additional matcher for determining if the navigation item should be active
 */
function NavItem({
  condensed,
  to,
  icon,
  title,
  trailingVisual,
  isActiveTab,
}: {
  condensed?: boolean
  to: string
  icon: React.ReactNode
  title: string
  trailingVisual?: React.ReactNode
  isActiveTab?: boolean
}) {
  const resolved = useResolvedPath(to)
  const isCurrent = useMatch({path: resolved.pathname, end: true}) || isActiveTab
  const labelId = useId()

  return (
    <NavList.Item
      aria-current={isCurrent ? 'page' : undefined}
      aria-label={condensed ? title : undefined}
      aria-labelledby={condensed ? undefined : labelId}
      as={Link}
      sx={{mx: 0}}
      to={to}
    >
      <NavList.LeadingVisual sx={condensed ? {mr: 0} : {}}>{icon}</NavList.LeadingVisual>
      {!condensed && (
        <Box as="span" id={labelId} sx={{pl: 1}}>
          {title}
        </Box>
      )}
      {!condensed && trailingVisual && <NavList.TrailingVisual>{trailingVisual}</NavList.TrailingVisual>}
    </NavList.Item>
  )
}

/**
 * PullRequestTabNavigation returns the navigation list for tabs within PRX
 *
 */
const PullRequestTabNavigation = memo(function PullRequestTabNavigation({
  condensed,
  changedFiles,
}: PullRequestTabNavigationProps) {
  const {owner, repo, number} = useParams()
  const location = useLocation()
  const locationSuffix = location.pathname.split('/')[5]
  // This is a bit dirty, but we can't rely on the absence of a location suffix due to voltron
  // https://github.com/github/pull-requests/issues/10929
  const isOverview = locationSuffix !== 'activity' && locationSuffix !== 'commits' && locationSuffix !== 'files'

  return (
    <div>
      <Box sx={{px: 3, pb: 0, pt: condensed ? 2 : 0, display: 'flex', flexDirection: 'column'}}>
        {/* navlist items get 8px of horizontal padding that can't be overridden
            (it's hardcoded on an element we can't pass SX prop to).
            So we add negative margin to the navlist to counteract that. */}
        <NavList sx={{pb: 1, mx: -2, mb: -2}}>
          <NavItem
            condensed={condensed}
            icon={<HomeIcon />}
            isActiveTab={isOverview}
            title="Overview"
            to={pullRequestUrl({owner, repoName: repo, number})}
          />
          <NavItem
            condensed={condensed}
            icon={<PulseIcon />}
            isActiveTab={locationSuffix === 'activity'}
            title="Activity"
            to={pullRequestActivityUrl({owner, repoName: repo, number})}
          />
          <NavItem
            condensed={condensed}
            icon={<GitCommitIcon />}
            isActiveTab={locationSuffix === 'commits'}
            title="Commits"
            to={pullRequestCommitsUrl({owner, repoName: repo, number})}
          />
          <NavItem
            condensed={condensed}
            icon={<FileDiffIcon />}
            isActiveTab={locationSuffix === 'files'}
            title="Files changed"
            to={pullRequestFilesChangedUrl({owner, repoName: repo, number})}
            trailingVisual={changedFiles ? <CounterLabel>{changedFiles}</CounterLabel> : undefined}
          />
        </NavList>
      </Box>
    </div>
  )
})

function TreeBorder({scrollingRef}: {scrollingRef: React.RefObject<HTMLDivElement>}) {
  const [visible, setVisible] = useState(scrollingRef.current && scrollingRef.current.scrollTop > 0)

  useEffect(() => {
    if (scrollingRef.current) {
      const scrollElement = scrollingRef.current
      const scrollHandler = () => {
        if (scrollElement.scrollTop > 0) {
          setVisible(true)
        } else {
          setVisible(false)
        }
      }
      // eslint-disable-next-line github/prefer-observers
      scrollElement.addEventListener('scroll', scrollHandler)
      return () => {
        scrollElement.removeEventListener('scroll', scrollHandler)
      }
    }
  }, [scrollingRef])

  return visible ? (
    <Box
      sx={{
        borderBottom: '1px solid',
        borderColor: 'border.default',
        boxShadow: '0 3px 8px rgba(0, 0, 0, 0.3)',
        zIndex: 1,
      }}
    />
  ) : null
}

interface NavigationProps {
  pullRequest: Navigation_pullRequest$key | null
  showFileTree: boolean
}
/**
 * Handles the left pane navigation in PRX
 *  - manages the user preferences regarding whether it's open or closed by default
 *  - adjusts position based on sticky header
 *  - can be collapsed to show a column of icons or expanded to show the icons beside titles
 *
 */
export function Navigation({pullRequest, showFileTree}: NavigationProps) {
  const pullRequestData = useFragment(
    graphql`
      fragment Navigation_pullRequest on PullRequest {
        comparison(startOid: $startOid, endOid: $endOid, singleCommitOid: $singleCommitOid) {
          summary {
            __typename
          }
        }
        ...FileTree_pullRequest
        ...CommitsDropdown_pullRequest
      }
    `,
    pullRequest,
  )

  const navigate = useNavigate()
  const {isNavigationPaneExpanded} = useNavigationPaneContext()
  const {observe, unobserve} = useStickyHeader()
  const scrollingRef = useRef<HTMLDivElement | null>(null)
  const itemIdentifier = useRouteInfo()

  // This is a stop-gap measure for staff ship
  // Longer term, we should implement a responsive / mobile-friendly design
  const {screenSize} = useScreenSize()
  const showSidebar = (screenSize > ScreenSize.medium && showFileTree) || screenSize > ScreenSize.xlarge
  const showMainNavigation = screenSize > ScreenSize.xlarge
  const changedFilesCount = pullRequestData?.comparison?.summary?.length

  const setScrollingRef = useCallback((element: HTMLDivElement) => {
    scrollingRef.current = element
  }, [])

  const handleCommitRangeUpdated = useCallback(
    (rangeArgs: {startOid?: string; endOid?: string} | {singleCommitOid?: string} | undefined) => {
      if (!itemIdentifier) return

      navigate(
        pullRequestFilesChangedUrl({
          number: itemIdentifier.number.toString(),
          owner: itemIdentifier.owner,
          repoName: itemIdentifier.repo,
          ...rangeArgs,
        }),
      )
    },
    [itemIdentifier, navigate],
  )

  if (!showSidebar) {
    return null
  }

  return (
    <>
      {isNavigationPaneExpanded && (
        <SplitPageLayout.Pane
          divider="line"
          offsetHeader={stickyHeaderHeight}
          padding="none"
          position="start"
          resizable={showFileTree}
          sx={{height: '100vh'}}
          width="small"
          widthStorageKey="pull-request-navigation-pane-width"
        >
          <Box
            aria-label="Pull request navigation"
            as="nav"
            data-testid="pull-request-main-navigation"
            role="navigation"
            sx={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%'}}
          >
            <Box
              sx={{
                maxHeight: '100vh !important',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflowY: 'hidden',
                pt: 2,
              }}
            >
              {showMainNavigation && <PullRequestTabNavigation changedFiles={changedFilesCount} />}
              {showFileTree && pullRequestData && (
                <>
                  <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, py: 2, px: 3}}>
                    <CommitsDropdown pullRequest={pullRequestData} onRangeUpdated={handleCommitRangeUpdated} />
                    <FileFilter />
                  </Box>
                  <TreeBorder scrollingRef={scrollingRef} />
                  <Box ref={setScrollingRef} sx={{overflowY: 'auto', maxHeight: '100% !important', flexGrow: 1, px: 3}}>
                    <FileTree pullRequest={pullRequestData} />
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </SplitPageLayout.Pane>
      )}
      {!isNavigationPaneExpanded && showMainNavigation && (
        <Box sx={{position: 'sticky', top: 0}}>
          <Box
            aria-label="Pull request navigation"
            as="nav"
            role="navigation"
            sx={{
              position: 'sticky',
              top: stickyHeaderHeight,
              bg: 'canvas.default',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <ObservableBox
              sx={{position: 'absolute', top: '-1px', height: '1px', visibility: 'hidden'}}
              onObserve={observe}
              onUnobserve={unobserve}
            />
            <PullRequestTabNavigation condensed changedFiles={changedFilesCount} />
          </Box>
        </Box>
      )}
    </>
  )
}
