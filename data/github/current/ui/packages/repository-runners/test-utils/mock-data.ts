import type {RunnersResponse} from '../types'
import type {RepositoryRunnersProps} from '../RepositoryRunners'

export function getRunnersPayload(
  endpoint: 'github-hosted' | 'repo-self-hosted' | 'shared-runners' | 'scale-sets',
): RunnersResponse {
  if (endpoint === 'github-hosted') {
    const largerRunners = [
      {
        name: 'larger-runner',
        os: 'linux',
        description: 'GitHub-hosted larger runner',
        labels: ['linux', 'github-hosted'],
        source: 'Organization',
      },
    ]

    return {largerRunners, showLargerRunnerBanner: true, hasHostedRunnerGroup: true}
  } else if (endpoint === 'repo-self-hosted') {
    const repoSelfHostedRunners = [
      {
        name: 'repo-self-hosted-runner',
        os: 'linux',
        description: 'Repo self-hosted runner',
        labels: ['linux', 'self-hosted'],
        source: 'Repository',
      },
    ]

    return {runners: repoSelfHostedRunners, total: 1}
  } else if (endpoint === 'shared-runners') {
    const sharedRunners = [
      {
        name: 'self-hosted-runner',
        os: 'linux',
        description: 'Self-hosted runner',
        labels: ['linux', 'self-hosted'],
        source: 'Repository',
      },
    ]

    return {runners: sharedRunners, total: 1}
  } else if (endpoint === 'scale-sets') {
    const scaleSets = [
      {name: 'scale-set', os: 'arc', description: 'Scale set', labels: ['linux', 'scale-set'], source: 'Repository'},
    ]

    return {runners: scaleSets, total: 1}
  }
}

export function getRepositoryRunnersProps(): RepositoryRunnersProps {
  return {
    selectedTab: 'github-hosted',
    githubHostedRunnersPath: '/github/hub/actions/runners',
    selfHostedRunnersPath: '/github/hub/actions/runners?tab=self-hosted',
    fetchRunnersBasePath: '/github/hub/actions/runners',
    setUpRunnersLink: '/organizations/my-org/settings/actions/runners',
  }
}
