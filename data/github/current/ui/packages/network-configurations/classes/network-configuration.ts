export type RunnerGroup = {
  id: string
  name: string
  allowPublic: boolean
  visibility: string
  selectedTargetsCount: number
}

export enum ComputeService {
  None = 'none',
  Actions = 'actions',
  Codespaces = 'codespaces',
}

export class NetworkConfiguration {
  id: string
  name: string
  createdOn: string
  computeService: ComputeService
  service: string
  runnerGroups: RunnerGroup[]
  constructor(
    id: string,
    name: string,
    createdOn: string,
    computeService: ComputeService,
    service: string,
    runnerGroups: RunnerGroup[],
  ) {
    this.id = id
    this.name = name
    this.createdOn = createdOn
    this.computeService = computeService
    this.service = service
    this.runnerGroups = runnerGroups
  }
}
