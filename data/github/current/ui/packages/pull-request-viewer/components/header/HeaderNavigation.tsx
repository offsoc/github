import {FileDiffIcon, GitCommitIcon, HomeIcon, PulseIcon} from '@primer/octicons-react'
import {Box, UnderlineNav} from '@primer/react'
import {Link, useLocation, useParams} from 'react-router-dom'

import {
  pullRequestActivityUrl,
  pullRequestCommitsUrl,
  pullRequestFilesChangedUrl,
  pullRequestUrl,
} from '../../utils/urls'

function TabNavItem({
  to,
  icon,
  counter,
  children,
  isActive,
  ...rest
}: {
  to: string
  icon: React.FunctionComponent
  children: React.ReactNode
  isActive: boolean
  counter?: number
}) {
  return (
    <UnderlineNav.Item
      aria-current={isActive ? 'page' : undefined}
      as={Link}
      icon={icon}
      to={to}
      {...rest}
      counter={counter}
    >
      {children}
    </UnderlineNav.Item>
  )
}

export const HeaderNavigation = ({changedFiles}: {changedFiles?: number}) => {
  const {owner, repo, number} = useParams()
  const location = useLocation()
  const locationSuffix = location.pathname.split('/')[5]
  // This is a bit dirty, but we can't rely on the absence of a location suffix due to voltron
  // https://github.com/github/pull-requests/issues/10929
  const isOverview = locationSuffix !== 'activity' && locationSuffix !== 'commits' && locationSuffix !== 'files'

  return (
    <Box
      sx={{
        display: ['flex', 'flex', 'flex', 'flex', 'none'],
        width: '100%',
        borderBottom: '1px solid',
        borderBottomColor: 'border.default',
      }}
    >
      <UnderlineNav aria-label="Pull request" sx={{width: '100%', pl: 3, mb: '-1px'}}>
        <TabNavItem icon={HomeIcon} isActive={isOverview} to={pullRequestUrl({owner, repoName: repo, number})}>
          Overview
        </TabNavItem>
        <TabNavItem
          icon={PulseIcon}
          isActive={locationSuffix === 'activity'}
          to={pullRequestActivityUrl({owner, repoName: repo, number})}
        >
          Activity
        </TabNavItem>
        <TabNavItem
          icon={GitCommitIcon}
          isActive={locationSuffix === 'commits'}
          to={pullRequestCommitsUrl({owner, repoName: repo, number})}
        >
          Commits
        </TabNavItem>
        <TabNavItem
          counter={changedFiles}
          icon={FileDiffIcon}
          isActive={locationSuffix === 'files'}
          to={pullRequestFilesChangedUrl({owner, repoName: repo, number})}
        >
          Files changed
        </TabNavItem>
      </UnderlineNav>
    </Box>
  )
}
