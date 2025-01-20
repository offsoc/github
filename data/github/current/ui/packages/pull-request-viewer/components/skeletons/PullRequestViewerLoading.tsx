import {ScreenSize, useScreenSize} from '@github-ui/screen-size'
import {SplitPageLayout} from '@primer/react'

import {ActivityContentLoading} from './ActivityContentLoading'
import {FilesChangedContentLoading} from './FilesChangedContentLoading'
import {OverviewContentLoading} from './OverviewContentLoading'
import {SkeletonPullRequestHeader} from './SkeletonPullRequestHeader'
import {SkeletonPullRequestNavigation} from './SkeletonPullRequestNavigation'

/**
 * Common initial page loading component for PRX. Renders a skeleton page resembling the type of page.
 */
export function PullRequestViewerLoading({
  type = 'overview',
}: {
  type?: 'activity' | 'files' | 'single-file' | 'overview'
}): JSX.Element {
  const {screenSize} = useScreenSize()

  const showSidebar = (screenSize > ScreenSize.medium && type === 'files') || screenSize > ScreenSize.xlarge
  const showMainNavigation = screenSize > ScreenSize.xlarge
  const showFiles = type === 'files' || type === 'single-file'

  return (
    <div>
      <SkeletonPullRequestHeader showNavigationInHeader={!showMainNavigation} />
      <SplitPageLayout
        sx={{
          height: '100%',
          '> div': {
            height: '100%',
          },
        }}
      >
        {showSidebar && (
          <SplitPageLayout.Pane
            divider={showFiles ? 'line' : 'none'}
            resizable={showFiles}
            sx={{height: '100vh'}}
            width="small"
            widthStorageKey="pull-request-navigation-pane-width"
          >
            <SkeletonPullRequestNavigation showFiles={showFiles} showMainNavigation={showMainNavigation} />
          </SplitPageLayout.Pane>
        )}
        {type === 'overview' && <OverviewContentLoading />}
        {type === 'activity' && <ActivityContentLoading />}
        {type === 'files' && <FilesChangedContentLoading fileCount={3} />}
        {type === 'single-file' && <FilesChangedContentLoading fileCount={1} />}
      </SplitPageLayout>
    </div>
  )
}
