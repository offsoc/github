import {testIdProps} from '@github-ui/test-id-props'

import {LargerRunnerListItem} from './LargerRunnerListItem'
import {StandardGitHubHostedRunnersItem} from './StandardGitHubHostedRunnersItem'
import {EmptyState} from './EmptyState'
import {SkeletonList} from './SkeletonList'
import {RunnerList} from './RunnerList'
import {RunnerListItem} from './RunnerListItem'

import type {GitHubHostedRunnersResponse} from '../types'
import {useRunners} from '../hooks/use-runners'

export interface GitHubHostedRunnersProps {
  fetchRunnersBasePath: string
  setUpRunnersLink?: string
}

export function GitHubHostedRunners({fetchRunnersBasePath, setUpRunnersLink, ...props}: GitHubHostedRunnersProps) {
  const {runnersResponse, isLoading, error} = useRunners(`${fetchRunnersBasePath}/github_hosted_runners`)
  if (isLoading || error) {
    return <SkeletonList />
  }
  const {largerRunners, showLargerRunnerBanner, hasHostedRunnerGroup} = runnersResponse as GitHubHostedRunnersResponse

  const numberOfRunners = largerRunners.length + (hasHostedRunnerGroup ? 1 : 0)
  if (numberOfRunners === 0 && !showLargerRunnerBanner) {
    return <EmptyState selectedTab="github-hosted" setUpRunnersLink={setUpRunnersLink} />
  }

  return (
    <RunnerList data-hpc numberOfRunners={numberOfRunners} {...testIdProps('github-hosted-runners')} {...props}>
      {showLargerRunnerBanner && <LargerRunnerListItem setUpRunnersLink={setUpRunnersLink} />}
      {hasHostedRunnerGroup && <StandardGitHubHostedRunnersItem />}
      {largerRunners.map(runner => {
        return (
          <RunnerListItem
            key={runner.name}
            name={runner.name}
            os={runner.os}
            description={runner.description}
            labels={runner.labels}
            source={runner.source}
            runnerType="larger_runner"
          />
        )
      })}
    </RunnerList>
  )
}
