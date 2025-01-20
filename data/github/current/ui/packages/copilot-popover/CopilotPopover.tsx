import {useCurrentRepository} from '@github-ui/current-repository'
import {CancelFeatureRequest, RequestFeature, useFeatureRequest} from '@github-ui/feature-request'
import {testIdProps} from '@github-ui/test-id-props'
import {useClickAnalytics} from '@github-ui/use-analytics'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {CopilotIcon} from '@primer/octicons-react'
import {AnchoredOverlay, Box, Button, Heading, Link, LinkButton, PointerBox} from '@primer/react'
import {useCallback, useState} from 'react'
import {useCurrentUser} from '@github-ui/current-user'
import type {CopilotInfo} from '@github-ui/copilot-common-types'

export const PopoverMessage = {
  ORG_ADMIN: `For an organization, developers writing less boilerplate code means more productivity, while learning
  new technologies means delivering better customers solutions. Try it in Codespaces or your file editor.`,
  ORG_MEMBER: `We noticed that you're personally paying for GitHub Copilot. Instead, ask your organization admin
  to purchase the business version of GitHub Copilot.`,
  STANDARD: `Spend less time creating boilerplate and repetitive code patterns, and more time building great software.
  Try it in Codespaces or your favorite file editor.`,
}

interface CopilotPopoverProps {
  view: 'blame' | 'edit' | 'preview'
  copilotInfo?: CopilotInfo
  className?: string
}

export const CopilotPopover = ({view, copilotInfo, className}: CopilotPopoverProps): JSX.Element | null => {
  const {documentationUrl, notices, userAccess} = copilotInfo ?? {}
  const {
    business,
    orgHasCFBAccess,
    userHasCFIAccess,
    userHasOrgs,
    userIsOrgAdmin,
    userIsOrgMember,
    featureRequestInfo,
  } = userAccess ?? {}
  const {codeViewPopover: codeViewPopoverNotice} = notices ?? {}

  const {sendClickAnalyticsEvent} = useClickAnalytics()
  const currentUser = useCurrentUser()
  const {isOrgOwned: repoIsOrgOwned, ownerLogin} = useCurrentRepository()
  const {inProgress, requested, dismissed, dismissedAt, toggleFeatureRequest} = useFeatureRequest(featureRequestInfo)

  const [isOpen, setIsOpen] = useState(false)
  const [popoverHidden, setPopoverHidden] = useState(false)
  const openPopover = useCallback(() => setIsOpen(true), [setIsOpen])
  const closePopover = useCallback(() => setIsOpen(false), [setIsOpen])

  const buttonText = useCallback((): string => {
    if (userAccess && repoIsOrgOwned) {
      if (userIsOrgMember && !userIsOrgAdmin && (!orgHasCFBAccess || userHasCFIAccess)) {
        return 'Your organization can pay for GitHub Copilot'
      }
    }

    return 'Code 55% faster with GitHub Copilot'
  }, [orgHasCFBAccess, repoIsOrgOwned, userAccess, userHasCFIAccess, userIsOrgAdmin, userIsOrgMember])

  const bodyText = (): string => {
    if (dismissed) {
      return ''
    }
    if (userAccess && repoIsOrgOwned) {
      if (userIsOrgAdmin) {
        return PopoverMessage.ORG_ADMIN
      } else if (userIsOrgMember && userHasCFIAccess) {
        return PopoverMessage.ORG_MEMBER
      }
    }
    return PopoverMessage.STANDARD
  }

  const dismissedMessage = (): JSX.Element | null => {
    return (
      <>
        <p>Your request for Copilot Business was declined by an admin on {dismissedAt}.</p>
        <p className={'mb-0'}>
          <Link
            {...testIdProps('contact-admin-link')}
            aria-label={`Click this link to contact your admin.`}
            target="_blank"
            href={`/orgs/${ownerLogin}/people?query=role:owner`}
            onClick={() => sendAnalyticsClickLearnMore()}
          >
            Contact your admin
          </Link>
          {''} for more details around their decision.
        </p>
      </>
    )
  }

  const FeatureRequest = (): JSX.Element | null => {
    if (!featureRequestInfo?.showFeatureRequest) {
      return null
    }

    return requested ? (
      <CancelFeatureRequest inProgress={inProgress} toggleFeatureRequest={toggleFeatureRequest} />
    ) : (
      <RequestFeature
        inProgress={inProgress}
        toggleFeatureRequest={toggleFeatureRequest}
        featureName={featureRequestInfo?.featureName}
      />
    )
  }

  const getUserRepoRelationship = (): string => {
    if (currentUser && ownerLogin === currentUser.login) {
      return 'owner'
    } else if (userIsOrgAdmin) {
      return 'admin'
    } else if (userIsOrgMember) {
      return 'member'
    } else {
      return 'personal'
    }
  }

  const sendAnalyticsClickOpenPopover = (): void => {
    if (currentUser) {
      sendClickAnalyticsEvent({
        category: 'copilot_popover_code_view',
        action: `click_to_open_popover_${view}`,
        label: `ref_cta:open_copilot_popover;owner:${ownerLogin};relationship:${getUserRepoRelationship()}`,
      })
    }
  }

  const sendAnalyticsClickPopoverCTA = (action: string, ctaText: string): void => {
    sendClickAnalyticsEvent({
      category: 'copilot_popover_code_view',
      action,
      label: `ref_cta:${ctaText};ref_loc:code_view_${view}`,
    })
  }

  const sendAnalyticsDismissPopover = (): void => {
    const refLoc = `${repoIsOrgOwned ? 'org_' : ''}code_view_${view}${userIsOrgAdmin ? '_org_admin' : ''}`

    sendClickAnalyticsEvent({
      category: 'copilot_popover_code_view',
      action: `click_to_dismiss_copilot_popover_forever`,
      label: `ref_cta:dont_show_again;ref_loc:${refLoc}`,
    })
  }

  const sendAnalyticsClickLearnMore = (): void => {
    const isCFBDocs = userAccess?.userHasOrgs ?? false

    sendClickAnalyticsEvent({
      category: 'copilot_popover_code_view',
      action: `click_to_go_to_copilot_for_${isCFBDocs ? 'business' : 'individuals'}_info`,
      label: 'ref_cta:learn_more;ref_loc:code_view',
    })
  }

  const bodyCTA = (): JSX.Element | null => {
    const userCFBSeat = !!business
    const userHasAnyCopilotAccess = userCFBSeat || userHasCFIAccess

    if (!userHasAnyCopilotAccess && (!repoIsOrgOwned || (repoIsOrgOwned && !userIsOrgMember))) {
      return userHasOrgs ? (
        <LinkButton
          type="button"
          href="/settings/copilot"
          onClick={() => sendAnalyticsClickPopoverCTA('click_to_go_to_copilot_settings', 'get_github_copilot')}
        >
          Get GitHub Copilot
        </LinkButton>
      ) : (
        <LinkButton
          type="button"
          href="/github-copilot/signup"
          onClick={() => sendAnalyticsClickPopoverCTA('click_to_go_to_copilot_trial_signup', 'start_a_free_trial')}
        >
          Start a free trial
        </LinkButton>
      )
    }

    if (userIsOrgMember && !orgHasCFBAccess) {
      if (userIsOrgAdmin) {
        return (
          <LinkButton
            type="button"
            href={`/github-copilot/business_signup/organization/payment?org=${ownerLogin}`}
            onClick={() => sendAnalyticsClickPopoverCTA('click_to_buy_copilot_for_business', 'get_github_copilot')}
          >
            Get GitHub Copilot
          </LinkButton>
        )
      }
    }

    if (featureRequestInfo && !dismissed) {
      return <FeatureRequest />
    }

    return null
  }

  const onDismissPopover = (): void => {
    if (codeViewPopoverNotice) {
      verifiedFetch(codeViewPopoverNotice.dismissPath, {method: userIsOrgMember ? 'DELETE' : 'POST'})
      sendAnalyticsDismissPopover()
      setPopoverHidden(true)
    }
  }

  const learnMoreLink = (): JSX.Element => {
    return (
      <Link
        {...testIdProps('copilot-popover-content-learn-more')}
        aria-label={`Click this link to learn more about copilot. This action opens in a new tab.`}
        target="_blank"
        href={documentationUrl}
        onClick={() => sendAnalyticsClickLearnMore()}
        sx={{marginLeft: '8px'}}
      >
        Learn more
      </Link>
    )
  }

  const hideCopilotPopover = (): boolean => popoverHidden || !copilotInfo

  if (hideCopilotPopover()) {
    return null
  }
  return (
    <div className={className}>
      <AnchoredOverlay
        onOpen={openPopover}
        onClose={closePopover}
        open={isOpen}
        overlayProps={{
          role: 'dialog',
          sx: {overflow: 'inherit'},
        }}
        focusZoneSettings={{disabled: true}}
        renderAnchor={anchorProps => (
          <Button
            {...anchorProps}
            {...testIdProps('copilot-popover-button')}
            leadingVisual={CopilotIcon}
            onClick={() => {
              setIsOpen(!isOpen)
              sendAnalyticsClickOpenPopover()
            }}
            size="small"
            sx={{
              color: 'fg.default',
              display: ['none', 'none', 'none', 'none', 'block'],
            }}
            variant="invisible"
          >
            {buttonText()}
          </Button>
        )}
      >
        <PointerBox
          {...testIdProps('copilot-popover-content')}
          caret="top"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 1,
            justifyContent: 'space-between',
            padding: 4,
            width: '350px',
          }}
        >
          <Heading as="h2" sx={{fontSize: 1, fontWeight: 'bold', pb: 3}}>
            Code 55% faster with GitHub Copilot
          </Heading>
          <Box sx={{fontSize: 1, fontWeight: 'normal', pb: 3}}>
            <span {...testIdProps('copilot-popover-body-text')}>{bodyText()}</span>
            {dismissed ? dismissedMessage() : learnMoreLink()}
          </Box>
          <Box sx={{alignItems: 'center', display: 'flex', flexDirection: 'row'}}>
            {bodyCTA()}
            <Link
              {...testIdProps('copilot-popover-dismiss-button')}
              onClick={onDismissPopover}
              sx={{
                cursor: 'pointer',
                fontSize: 1,
                textDecorationLine: 'none',
                marginLeft: dismissed ? 0 : '16px',
              }}
            >
              Don&apos;t show again
            </Link>
          </Box>
        </PointerBox>
      </AnchoredOverlay>
    </div>
  )
}
