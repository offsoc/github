import {TabNav} from '@primer/react'

import {GitHubHostedRunners} from './components/GitHubHostedRunners'
import {SelfHostedRunners} from './components/SelfHostedRunners'

export interface RepositoryRunnersProps {
  selectedTab: 'github-hosted' | 'self-hosted'
  githubHostedRunnersPath: string
  selfHostedRunnersPath: string
  fetchRunnersBasePath: string
  setUpRunnersLink?: string
}

export function RepositoryRunners({
  selectedTab,
  githubHostedRunnersPath,
  selfHostedRunnersPath,
  fetchRunnersBasePath,
  setUpRunnersLink,
}: RepositoryRunnersProps) {
  return (
    <>
      <TabNav aria-label="Navigation" sx={{marginBottom: 3}}>
        <TabNav.Link href={githubHostedRunnersPath} selected={selectedTab === 'github-hosted'}>
          GitHub-hosted runners
        </TabNav.Link>
        <TabNav.Link href={selfHostedRunnersPath} selected={selectedTab === 'self-hosted'}>
          Self-hosted runners
        </TabNav.Link>
      </TabNav>
      {selectedTab === 'github-hosted' ? (
        <GitHubHostedRunners fetchRunnersBasePath={fetchRunnersBasePath} setUpRunnersLink={setUpRunnersLink} />
      ) : (
        <SelfHostedRunners fetchRunnersBasePath={fetchRunnersBasePath} setUpRunnersLink={setUpRunnersLink} />
      )}
    </>
  )
}
