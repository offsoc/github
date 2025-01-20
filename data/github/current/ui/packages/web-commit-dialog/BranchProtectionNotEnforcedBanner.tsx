import {linkButtonSx} from '@github-ui/code-view-shared/utilities/styles'
import type {ProtectionNotEnforcedInfo} from '@github-ui/code-view-types'
import {FeatureRequest} from '@github-ui/feature-request'
import {testIdProps} from '@github-ui/test-id-props'
import {AlertIcon} from '@primer/octicons-react'
import {Box, Flash, Link, LinkButton, Octicon} from '@primer/react'

export function BranchProtectionNotEnforcedBanner({
  branch,
  protectionNotEnforcedInfo,
}: {
  branch: string
  protectionNotEnforcedInfo: ProtectionNotEnforcedInfo
}) {
  const cta = protectionNotEnforcedInfo.upsellCtaInfo.cta
  const organization = protectionNotEnforcedInfo.organization
  const {branchProtected, rulesetsProtected} = protectionNotEnforcedInfo
  const {showUpgradeButton, askAdmin, ctaPath} = cta

  const BannerMessage = () => {
    function ProtectedBranchOrganizationMessage({branchProtectionPath}: {branchProtectionPath: string}) {
      return (
        <div {...testIdProps('pb-org')}>
          <Octicon icon={AlertIcon} />
          Your {LinkToIf(!askAdmin, 'protected branch rules', branchProtectionPath)} <strong>{branch}</strong>
          {
            " branch won't be enforced on this private repository until you upgrade this organization to a GitHub Team or Enterprise account."
          }
        </div>
      )
    }

    function ProtectedBranchPersonalMessage({branchProtectionPath}: {branchProtectionPath: string}) {
      return (
        <div {...testIdProps('pb-personal')}>
          <Octicon icon={AlertIcon} />
          Your {LinkToIf(!askAdmin, 'protected branch rules', branchProtectionPath)} <strong>{branch}</strong>
          {
            " branch won't be enforced on this private repository until you move to a GitHub Team or Enterprise account."
          }
        </div>
      )
    }

    function RulesetsUpsellPersonalMessage({rulesetsPath}: {rulesetsPath: string}) {
      return (
        <div {...testIdProps('ru-personal')}>
          <Octicon icon={AlertIcon} />
          The {LinkToIf(!askAdmin, 'rulesets', rulesetsPath)}
          {' targeting your '}
          <strong>{branch}</strong>
          {" branch won't be enforced on this private repository until you move to a GitHub Team organization account."}
        </div>
      )
    }

    function RulesetUpsellOrganizationMessage({rulesetsPath}: {rulesetsPath: string}) {
      return (
        <div {...testIdProps('ru-org')}>
          <Octicon icon={AlertIcon} />
          The {LinkToIf(!askAdmin, 'rulesets', rulesetsPath)}
          {' targeting your '}
          <strong>{branch}</strong>
          {!askAdmin
            ? " branch won't be enforced on this private repository until you upgrade this organization to GitHub Team."
            : " branch won't be enforced on this private repository until your organization admins upgrade this organization account to GitHub Team."}
        </div>
      )
    }

    if (organization) {
      if (branchProtected && !rulesetsProtected) {
        return (
          <ProtectedBranchOrganizationMessage
            branchProtectionPath={protectionNotEnforcedInfo.editRepositoryBranchesPath}
          />
        )
      }
      return <RulesetUpsellOrganizationMessage rulesetsPath={protectionNotEnforcedInfo.editRepositoryRulesetsPath} />
    }
    if (branchProtected && !rulesetsProtected) {
      return (
        <ProtectedBranchPersonalMessage branchProtectionPath={protectionNotEnforcedInfo.editRepositoryBranchesPath} />
      )
    }
    return <RulesetsUpsellPersonalMessage rulesetsPath={protectionNotEnforcedInfo.editRepositoryRulesetsPath} />
  }

  function LinkToIf(condition: boolean, text: string, link: string) {
    return condition ? (
      <Link href={link} role="link" {...testIdProps('linked-text')} underline>
        {text}
      </Link>
    ) : (
      text
    )
  }

  return (
    <Flash variant="warning" sx={{alignItems: 'flex-start', display: 'flex', flexDirection: 'column', mt: 2, mb: 3}}>
      <BannerMessage />
      {showUpgradeButton && (
        <LinkButton {...testIdProps('Upgrade-Btn')} href={ctaPath} sx={{mt: 2, ...linkButtonSx}}>
          {'Upgrade'}
        </LinkButton>
      )}
      <Box sx={{mt: 2}}>
        <FeatureRequest
          featureRequestInfo={protectionNotEnforcedInfo.featureRequestInfo}
          requestedMessage="You've successfully submitted a request to your organization's admins for this feature."
        />
      </Box>
    </Flash>
  )
}
