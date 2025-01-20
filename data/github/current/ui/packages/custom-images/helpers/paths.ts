function getRoot(isEnterprise: boolean) {
  return isEnterprise ? '/enterprises/' : '/organizations/'
}

export function imageDefinitionDeletePath({
  imageDefinitionId,
  isEnterprise,
  entityLogin,
}: {
  imageDefinitionId: string
  isEnterprise: boolean
  entityLogin: string
}) {
  return `${getRoot(isEnterprise)}${entityLogin}/settings/actions/custom-images/${imageDefinitionId}`
}

export function imageVersionDeletePath({
  imageDefinitionId,
  version,
  isEnterprise,
  entityLogin,
}: {
  imageDefinitionId: string
  version: string
  isEnterprise: boolean
  entityLogin: string
}) {
  const root = getRoot(isEnterprise)
  return `${root}${entityLogin}/settings/actions/custom-images/${imageDefinitionId}/versions/${version}`
}

export function imageVersionsListPath({
  imageDefinitionId,
  isEnterprise,
  entityLogin,
}: {
  imageDefinitionId: string
  isEnterprise: boolean
  entityLogin: string
}) {
  return `${getRoot(isEnterprise)}${entityLogin}/settings/actions/custom-images/${imageDefinitionId}/versions`
}
