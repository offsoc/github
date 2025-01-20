import type {FC} from 'react'
import {Flash, Heading, Octicon, Link, LinkButton} from '@primer/react'
import {AlertIcon, GitBranchIcon} from '@primer/octicons-react'
import type {RulesetTarget, SourceType} from '../types/rules-types'
import {useClickAnalytics} from '@github-ui/use-analytics'
import {NewRulesetButton} from '../components/NewRulesetButton'
import {useRelativeNavigation} from '../hooks/use-relative-navigation'
import type {FlashAlert} from '@github-ui/dismissible-flash'

type UpsellBannerProps = {
  organization: boolean
  askAdmin: boolean
  ctaPath?: string
  sourceType: SourceType
}

export const FlashUpsellBanner: FC<UpsellBannerProps> = ({organization, askAdmin, ctaPath, sourceType}) => {
  const button = true
  const bannerProps = {organization, askAdmin, ctaPath, button, sourceType}
  const {sendClickAnalyticsEvent} = useClickAnalytics()
  const category = 'rulesets.upsell'
  const action = 'RULESETS_UPSELL_BUTTON_CLICKED'
  return (
    <Flash variant="warning" className="d-flex flex-items-center flex-justify-between">
      <UpsellBannerText {...bannerProps} />
      {!askAdmin && (
        <LinkButton
          className="ml-5"
          href={ctaPath}
          onClick={() =>
            sendClickAnalyticsEvent({
              category,
              action,
              label: 'RULESET_LEARN_MORE_LINK',
            })
          }
        >
          Upgrade
        </LinkButton>
      )}
    </Flash>
  )
}

const UpsellBannerText = ({
  organization,
  askAdmin,
  ctaPath,
  button,
  sourceType,
}: {
  organization: boolean
  askAdmin: boolean
  ctaPath?: string
  button?: boolean
  sourceType: SourceType
}) => {
  const {sendClickAnalyticsEvent} = useClickAnalytics()
  const category = 'rulesets.upsell'
  const action = 'RULESETS_UPGRADE_LINK_CLICKED'
  let message = ''
  let linkText = ''
  if (sourceType === 'organization') {
    message = "Organization rulesets won't be enforced "
    linkText = 'until you upgrade this organization account to GitHub Enterprise.'
  } else {
    message = "Your rulesets won't be enforced on this private repository until"
    if (!askAdmin) {
      message = message.concat(' you ')
      linkText = organization
        ? 'upgrade this organization account to GitHub Team.'
        : 'move to GitHub Team organization account.'
    } else {
      message = message.concat(' your ')
      linkText = 'organization account admins upgrade this organization account to GitHub Team.'
    }
  }

  return (
    <div className="d-flex my-2">
      <div>
        <Octicon icon={AlertIcon} sx={{color: 'attention.fg', mr: 2}} />
      </div>
      {button ? (
        <>
          {message}
          {linkText}
        </>
      ) : (
        <div className={'color-fg-muted'}>
          {askAdmin ? (
            <>
              {message}
              {linkText}
            </>
          ) : (
            <>
              {message}
              <Link
                href={ctaPath}
                onClick={() =>
                  sendClickAnalyticsEvent({
                    category,
                    action,
                    label: 'RULESETS_UPSELL_TEXT_LINK',
                  })
                }
              >
                {linkText}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export const UpsellBanner: FC<{
  headingText: string
  withBorder: boolean
  showNewRulesetButton: boolean
  askAdmin: boolean
  cta: {
    visible: boolean
    path?: string
  }
  infoVariant: 'one' | 'two'
  sourceType: SourceType
  organization: boolean
  setFlashAlert: (flashAlert: FlashAlert) => void
  supportedRulesetTargets: RulesetTarget[]
}> = ({
  headingText,
  withBorder,
  showNewRulesetButton,
  askAdmin,
  cta,
  infoVariant,
  sourceType,
  organization,
  setFlashAlert,
  supportedRulesetTargets,
}) => {
  const borderProps = 'd-md-flex border rounded-2 color-border-default p-3 mb-3'
  const noBorderProps = 'd-flex'
  const upsellBannerProps = {askAdmin, ctaPath: cta.path, organization, sourceType}
  const {resolvePath} = useRelativeNavigation()

  return (
    <div className={withBorder ? borderProps : noBorderProps}>
      <div className="mr-3">
        <span className="branch-action-item-icon completeness-indicator completeness-indicator-problem float-none ml-0">
          <Octicon icon={GitBranchIcon} />
        </span>
      </div>
      <div>
        <Heading as="h2" sx={{fontSize: 2, mb: 2}}>
          {headingText}
        </Heading>
        <InfoVariants infoVariant={infoVariant} supportedRulesetTargets={supportedRulesetTargets} />
        {cta.visible && <UpsellBannerText {...upsellBannerProps} />}
        {showNewRulesetButton && (
          <NewRulesetButton
            rulesetsUrl={resolvePath('./')}
            setFlashAlert={setFlashAlert}
            supportedTargets={supportedRulesetTargets}
          />
        )}
      </div>
    </div>
  )
}

function InfoVariants({
  infoVariant,
  supportedRulesetTargets,
}: {
  infoVariant: 'one' | 'two'
  supportedRulesetTargets: RulesetTarget[]
}) {
  const documentationHref = `https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets`
  const {sendClickAnalyticsEvent} = useClickAnalytics()
  const category = 'rulesets.learn_more'
  const action = 'RULESETS_INFO_LINK_CLICKED'

  let message
  if (supportedRulesetTargets.includes('member_privilege')) {
    message =
      infoVariant === 'one'
        ? ' define whether members can perform operations on repositories such as delete and transfer. '
        : 'Define whether members can perform operations on repositories such as delete and transfer. '
  } else {
    message =
      infoVariant === 'one'
        ? ' define whether collaborators can delete or force push and set requirements for any pushes, such as passing status checks or a linear commit history.'
        : 'Define whether collaborators can delete or force push and set requirements for any pushes, such as passing status checks or a linear commit history. '
  }

  return (
    <p className={'color-fg-muted'}>
      {infoVariant === 'one' ? (
        <>
          <Link
            href={documentationHref}
            onClick={() =>
              sendClickAnalyticsEvent({
                category,
                action,
                label: 'RULESETS_DOC_LINK',
              })
            }
            inline
          >
            Rulesets
          </Link>
          {message}
        </>
      ) : (
        <>
          {message}
          <Link
            href={documentationHref}
            onClick={() =>
              sendClickAnalyticsEvent({
                category,
                action,
                label: 'RULESET_LEARN_MORE_LINK',
              })
            }
            inline
          >
            Learn more about rulesets.
          </Link>
        </>
      )}
    </p>
  )
}
