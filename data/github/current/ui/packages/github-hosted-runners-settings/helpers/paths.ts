function getRoot(isEnterprise: boolean) {
  return isEnterprise ? '/enterprises/' : '/organizations/'
}

export function createRunnerPath({isEnterprise, entityLogin}: {isEnterprise: boolean; entityLogin: string}) {
  return `${getRoot(isEnterprise)}${entityLogin}/settings/actions/github-hosted-runners/`
}

export function runnerDetailsPath({
  isEnterprise,
  entityLogin,
  runnerId,
}: {
  isEnterprise: boolean
  entityLogin: string
  runnerId: number
}) {
  return `${getRoot(isEnterprise)}${entityLogin}/settings/actions/github-hosted-runners/${runnerId}`
}

export function updateRunnerPath({
  isEnterprise,
  entityLogin,
  runnerId,
}: {
  isEnterprise: boolean
  entityLogin: string
  runnerId: number
}) {
  return `${getRoot(isEnterprise)}${entityLogin}/settings/actions/github-hosted-runners/${runnerId}`
}
