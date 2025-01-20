export interface Runner {
  name: string
  description: string
  os: string
  labels: string[]
  source: string
}

export interface GitHubHostedRunnersResponse {
  largerRunners: Runner[]
  hasHostedRunnerGroup: boolean
  showLargerRunnerBanner: boolean
}

export interface SelfHostedRunnersResponse {
  runners: Runner[]
  total: number
}

export type RunnersResponse = GitHubHostedRunnersResponse | SelfHostedRunnersResponse | undefined
