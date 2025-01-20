import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import styles from '../../marketplace.module.css'
import {
  ActionList,
  ActionMenu,
  Box,
  Breadcrumbs,
  Button,
  IconButton,
  Label,
  Link,
  Octicon,
  PageLayout,
} from '@primer/react'
import {Stack} from '@primer/react/experimental'
import {
  DownloadIcon,
  GearIcon,
  KebabHorizontalIcon,
  PencilIcon,
  VerifiedIcon,
  ShieldLockIcon,
  UnlockIcon,
} from '@primer/octicons-react'
import {SafeHTMLBox, type SafeHTMLString} from '@github-ui/safe-html'
import type {ShowAppPayload} from '../../types'
import Screenshots from '../../components/Screenshots'
import Plans from './Plans'
import {notEmpty} from '../../utilities/not-empty'
import {TagSection, TagSectionIdentifier} from './TagSection'
import {useMemo} from 'react'
import {ssrSafeWindow} from '@github-ui/ssr-utils'

export function ShowApp() {
  const {
    listing,
    screenshots,
    plan_info,
    supported_languages: supportedLanguages,
    verified_domain,
    user_can_edit,
    customers,
  } = useRoutePayload<ShowAppPayload>()
  const appRestricted = false
  const hideSetupButton = plan_info.viewer_has_purchased && plan_info.viewer_has_purchased_for_all_organizations
  const showHeaderActionMenu =
    plan_info.viewer_has_purchased || plan_info.any_orgs_purchased || plan_info.installed_for_viewer || user_can_edit
  const anyPlansExist = plan_info.viewer_has_purchased || plan_info.any_orgs_purchased
  const hasSupportedLanguages = supportedLanguages.length > 0
  const hasCustomers = customers.length > 0

  const tagSections = [
    TagSectionIdentifier.Category,
    hasSupportedLanguages ? TagSectionIdentifier.SupportedLanguages : null,
    hasCustomers ? TagSectionIdentifier.Customers : null,
    TagSectionIdentifier.FromTheDeveloper,
  ].filter(notEmpty)

  const reportUrl = useMemo(() => {
    const host = ssrSafeWindow?.location.origin
    if (!host) return undefined
    const listingUrl = `${host}/marketplace/${listing.slug}`

    const query = `report=${listingUrl}+(Marketplace Listing)`
    const reportTargetUrl = `${host}/contact/report-abuse?${query}`

    return reportTargetUrl
  }, [listing.slug])

  return (
    <div data-testid="legacy-app-listing">
      <PageLayout>
        <PageLayout.Header>
          <Breadcrumbs>
            <Breadcrumbs.Item href="/marketplace">Marketplace</Breadcrumbs.Item>
            <Breadcrumbs.Item href="/marketplace?type=apps">Apps</Breadcrumbs.Item>
            <Breadcrumbs.Item href="#" selected>
              {listing.name}
            </Breadcrumbs.Item>
          </Breadcrumbs>

          <Stack
            gap="normal"
            direction={{narrow: 'vertical', regular: 'horizontal'}}
            className="border-bottom color-border-muted py-4"
          >
            <Box
              className={`rounded-3 flex-shrink-0 ${styles['marketplace-logo']} ${styles['marketplace-logo--large']}`}
              sx={{
                backgroundColor: `#${listing.bgColor}`,
                color: listing.bgColor === 'ffffff' ? 'var(--fgColor-black)' : 'var(--fgColor-white)',
              }}
            >
              <img src={listing.listingLogoUrl} alt={listing.name} className={styles['marketplace-logo-img']} />
            </Box>
            <div className="flex-1">
              <div className="d-flex flex-items-center gap-2">
                <h1 className="lh-condensed">{listing.name}</h1>
                {listing.copilotApp && (
                  <Label size="large" variant="secondary">
                    Copilot
                  </Label>
                )}
              </div>
              <p className="h4 text-normal mb-0" data-testid="short-description">
                {listing.shortDescription}
              </p>
              <div className="mt-1 d-flex flex-items-center fgColor-muted">
                {listing.ownerLogin && (
                  <span className="fgColor-muted mr-3">
                    by{' '}
                    <Link muted={true} href={`/${listing.ownerLogin}`} sx={{fontWeight: 'bold'}}>
                      {listing.ownerLogin}
                    </Link>
                  </span>
                )}
                <Octicon icon={DownloadIcon} sx={{mr: 2}} />
                <span className="text-bold">{listing.installationCount.toLocaleString()}&nbsp;</span>
                <span>install{listing.installationCount === 1 ? '' : 's'}</span>
              </div>
            </div>

            {(!hideSetupButton || showHeaderActionMenu) && (
              <div className="d-flex gap-2">
                {!hideSetupButton && (
                  <Button
                    as="a"
                    variant="primary"
                    size="large"
                    className="js-smoothscroll-anchor"
                    disabled={appRestricted ? true : false}
                    href="#pricing-and-setup"
                    data-testid="setup-button"
                  >
                    {plan_info.viewer_has_purchased || plan_info.any_orgs_purchased
                      ? 'Add'
                      : plan_info.plans.some(plan => plan.has_free_trial)
                        ? 'Set up a free trial'
                        : 'Add'}
                  </Button>
                )}

                {showHeaderActionMenu && (
                  <div data-testid="listing-actions">
                    <ActionMenu>
                      <ActionMenu.Anchor>
                        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                        <IconButton
                          icon={KebabHorizontalIcon}
                          size="large"
                          aria-label="More actions"
                          unsafeDisableTooltip={true}
                          data-testid="listing-actions-button"
                        />
                      </ActionMenu.Anchor>

                      <ActionMenu.Overlay width="small" align="end">
                        <ActionList>
                          {anyPlansExist && (
                            <ActionList.Group>
                              <ActionList.GroupHeading>Edit current plan</ActionList.GroupHeading>
                              {plan_info.viewer_has_purchased && plan_info.current_user && (
                                <ActionList.LinkItem
                                  href={`/marketplace/${listing.slug}/order/${
                                    plan_info.plan_id_by_login[plan_info.current_user.display_login]
                                  }?account=${plan_info.current_user.display_login}`}
                                >
                                  {plan_info.current_user.display_login}
                                </ActionList.LinkItem>
                              )}
                              {plan_info.viewer_billed_organizations.map(orgName => (
                                <ActionList.LinkItem
                                  key={orgName}
                                  href={`/marketplace/${listing.slug}/order/${plan_info.plan_id_by_login[orgName]}?account=${orgName}`}
                                >
                                  {orgName}
                                </ActionList.LinkItem>
                              ))}
                            </ActionList.Group>
                          )}

                          {anyPlansExist && (plan_info.installed_for_viewer || user_can_edit) && <ActionList.Divider />}

                          {plan_info.installed_for_viewer && (
                            <ActionList.LinkItem href="/settings/installations">
                              <ActionList.LeadingVisual>
                                <Octicon icon={GearIcon} />
                              </ActionList.LeadingVisual>
                              Configure account access
                            </ActionList.LinkItem>
                          )}
                          {user_can_edit && (
                            <ActionList.LinkItem href={`/marketplace/${listing.slug}/edit`}>
                              <ActionList.LeadingVisual>
                                <Octicon icon={PencilIcon} />
                              </ActionList.LeadingVisual>
                              Manage app listing
                            </ActionList.LinkItem>
                          )}
                        </ActionList>
                      </ActionMenu.Overlay>
                    </ActionMenu>
                  </div>
                )}
              </div>
            )}
          </Stack>
        </PageLayout.Header>
        <PageLayout.Pane position="start">
          {(listing.isVerifiedOwner || verified_domain || listing.copilotApp) && (
            <>
              <h2 className="mt-4 f5 fgColor-muted lh-condensed-ultra">About</h2>
            </>
          )}
          {(listing.isVerifiedOwner || verified_domain) && (
            <>
              <div className="mt-2 d-flex flex-column gap-1">
                <div className="d-flex flex-items-center gap-2">
                  {verified_domain && <a href={`https://${verified_domain}`}>{verified_domain}</a>}
                </div>
                {listing.isVerifiedOwner && (
                  <div className="d-flex gap-2">
                    <Octicon icon={VerifiedIcon} className="fgColor-accent" vertical-align="middle" sx={{mt: '2px'}} />
                    <span>
                      GitHub has verified that the publisher controls the domain and meets other requirements.
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
          {listing.copilotApp && (
            <>
              <div className="mt-2 d-flex gap-2">
                <Octicon icon={UnlockIcon} className="fgColor-accent" vertical-align="middle" sx={{mt: '2px'}} />
                <span>
                  Using Copilot Extensions requires a{' '}
                  <a href="https://github.com/features/copilot/plans">{'GitHub Copilot'}</a> license.
                </span>
              </div>
              <div className="mt-2 d-flex gap-2">
                <Octicon icon={ShieldLockIcon} className="fgColor-accent" vertical-align="middle" sx={{mt: '2px'}} />
                <span>An Admin must enable access for organization or enterprise use.</span>
              </div>
            </>
          )}
          <div className="mb-1">
            {tagSections.map(identifier => (
              <TagSection
                key={identifier}
                identifier={identifier}
                listing={listing}
                supportedLanguages={supportedLanguages}
                customers={customers}
              />
            ))}
          </div>
          {reportUrl && <Link href={reportUrl}>Report abuse</Link>}
        </PageLayout.Pane>

        <PageLayout.Content as="div" width="medium">
          <div className="markdown-body" data-testid="description">
            {listing.fullDescription && <SafeHTMLBox html={listing.fullDescription as SafeHTMLString} />}
            {listing.extendedDescription && <SafeHTMLBox html={listing.extendedDescription as SafeHTMLString} />}
          </div>
          <Screenshots screenshots={screenshots} />
        </PageLayout.Content>
      </PageLayout>

      <div className="bgColor-muted p-5" id="pricing-and-setup">
        <div className="container-lg">
          <h2 className="mb-4">Pricing and setup</h2>
          <Plans planInfo={plan_info} listing={listing} />
        </div>
      </div>
    </div>
  )
}
