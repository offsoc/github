import type {PropertyConsumerUsage} from '@github-ui/custom-properties-types'
import {AlertIcon, InfoIcon} from '@primer/octicons-react'
import {Box, Flash, Octicon} from '@primer/react'

const DEFINITIONS_LIMIT = 100
export function isDefinitionsLimitReached(defs: unknown[]) {
  return defs.length >= 100
}
export function DefinitionsLimitBanner() {
  return (
    <Flash>
      <Box sx={{display: 'flex', gap: 1}}>
        <div>
          <Octicon icon={InfoIcon} />
        </div>
        <div>The limit of {DEFINITIONS_LIMIT} definitions is reached. You cannot add more.</div>
      </Box>
    </Flash>
  )
}

export function ServerErrorFormBanner({children}: React.PropsWithChildren) {
  return (
    <Flash data-testid="server-error-banner" variant="danger">
      <Box sx={{display: 'flex', gap: 1}}>
        <div>
          <Octicon icon={AlertIcon} />
        </div>
        <div>{children}</div>
      </Box>
    </Flash>
  )
}
interface DefinitionUsageBannerProps {
  name: string
  repoCount: number
  usages: PropertyConsumerUsage[]
}

export function DefinitionUsageBanner({name, repoCount, usages}: DefinitionUsageBannerProps) {
  if (usages.length) {
    const consumerWord = usages.length === 1 ? 'ruleset' : 'rulesets'
    return (
      <Flash sx={{p: 2}} variant="danger" data-testid="usage-banner">
        <span>
          The <strong>{name}</strong> property is referenced in{' '}
          <strong>
            {usages.length} {consumerWord}{' '}
          </strong>
          and cannot be deleted.
        </span>
      </Flash>
    )
  }

  if (repoCount) {
    const reposWord = repoCount === 1 ? 'repository' : 'repositories'
    return (
      <Flash sx={{p: 2}} variant="warning" data-testid="usage-banner">
        <span>
          The <strong>{name}</strong> property is referenced by{' '}
          <strong>
            {repoCount} {reposWord}.
          </strong>
        </span>
      </Flash>
    )
  }

  return (
    <Flash sx={{p: 2}} variant="default" data-testid="usage-banner">
      <span>
        No usages of the <strong>{name}</strong> property found.
      </span>
    </Flash>
  )
}
