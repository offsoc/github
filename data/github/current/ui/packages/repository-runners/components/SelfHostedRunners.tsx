import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'

import {EmptyState} from './EmptyState'
import {SkeletonList} from './SkeletonList'
import {RunnerList} from './RunnerList'
import {RunnerListItem} from './RunnerListItem'

import type {SelfHostedRunnersResponse} from '../types'
import {useRunners} from '../hooks/use-runners'

export interface SelfHostedRunnersProps {
  fetchRunnersBasePath: string
  setUpRunnersLink?: string
}

export function SelfHostedRunners({fetchRunnersBasePath, setUpRunnersLink}: SelfHostedRunnersProps) {
  const repoSelfHostedApiResponse = useRunners(`${fetchRunnersBasePath}/repository_self_hosted`)
  const repoSelfHostedRunnersResponse = repoSelfHostedApiResponse.runnersResponse as SelfHostedRunnersResponse

  const sharedRunnersApiResponse = useRunners(`${fetchRunnersBasePath}/shared_runners`)
  const sharedRunnersResponse = sharedRunnersApiResponse.runnersResponse as SelfHostedRunnersResponse

  const scaleSetsApiResponse = useRunners(`${fetchRunnersBasePath}/repository_scale_sets`)
  const scaleSetsResponse = scaleSetsApiResponse.runnersResponse as SelfHostedRunnersResponse

  if (repoSelfHostedApiResponse.isLoading || sharedRunnersApiResponse.isLoading || scaleSetsApiResponse.isLoading) {
    return <SkeletonList />
  }

  const {runners: repoSelfHostedRunners, total: repoSelfHostedRunnersCount} = repoSelfHostedRunnersResponse
  const {runners: sharedRunners, total: sharedRunnersCount} = sharedRunnersResponse
  const {runners: scaleSets, total: scaleSetsCount} = scaleSetsResponse

  if (repoSelfHostedRunnersCount === 0 && sharedRunnersCount === 0 && scaleSetsCount === 0) {
    return <EmptyState selectedTab="self-hosted" setUpRunnersLink={setUpRunnersLink} />
  }

  return (
    <Box
      data-hpc
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
      {...testIdProps('self-hosted-runners')}
    >
      {sharedRunners.length > 0 && (
        <RunnerList
          heading="Shared with this repository"
          numberOfRunners={sharedRunners.length}
          {...testIdProps('shared-runners')}
        >
          {sharedRunners.map(runner => {
            return (
              <RunnerListItem
                key={runner.name}
                name={runner.name}
                os={runner.os}
                description={runner.description}
                labels={runner.labels}
                source={runner.source}
                runnerType="shared_runner"
              />
            )
          })}
        </RunnerList>
      )}
      {repoSelfHostedRunnersCount > 0 && (
        <RunnerList
          heading="Repository runners"
          numberOfRunners={repoSelfHostedRunnersCount}
          {...testIdProps('repository-self-hosted-runners')}
        >
          {repoSelfHostedRunners.map(runner => {
            return (
              <RunnerListItem
                key={runner.name}
                name={runner.name}
                os={runner.os}
                description={runner.description}
                labels={runner.labels}
                source={runner.source}
                runnerType="repo_self_hosted"
              />
            )
          })}
        </RunnerList>
      )}
      {scaleSets.length > 0 && (
        <RunnerList heading="Runner scale sets" numberOfRunners={scaleSets.length} {...testIdProps('repo-scale-sets')}>
          {scaleSets.map(runner => {
            return (
              <RunnerListItem
                key={runner.name}
                name={runner.name}
                os={runner.os}
                description={runner.description}
                labels={runner.labels}
                source={runner.source}
                runnerType="repo_scale_set"
              />
            )
          })}
        </RunnerList>
      )}
    </Box>
  )
}
