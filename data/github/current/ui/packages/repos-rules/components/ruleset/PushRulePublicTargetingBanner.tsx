import {Flash, Octicon} from '@primer/react'
import {InfoIcon} from '@primer/octicons-react'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'

export const PushRulePublicTargetingBanner = () => {
  const excludePublicReposFromTargeting = useFeatureFlag('rules_exclude_public_repositories_from_targeting')
  if (!excludePublicReposFromTargeting) {
    return null
  }
  return (
    <Flash>
      <div className="d-flex flex-row flex-items-center">
        <Octicon icon={InfoIcon} />
        <span>Push rulesets only apply to private or internal repositories and their forks.</span>
      </div>
    </Flash>
  )
}
