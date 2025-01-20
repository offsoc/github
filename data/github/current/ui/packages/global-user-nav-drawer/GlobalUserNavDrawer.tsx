import {
  AlertIcon,
  BeakerIcon,
  BookIcon,
  CodeSquareIcon,
  CommentDiscussionIcon,
  CopilotIcon,
  GearIcon,
  GlobeIcon,
  HeartIcon,
  OrganizationIcon,
  PeopleIcon,
  PersonIcon,
  ProjectIcon,
  RepoIcon,
  SignOutIcon,
  SmileyIcon,
  StarIcon,
  UploadIcon,
  type Icon,
} from '@primer/octicons-react'
import {ActionList, Label, Octicon, Spinner, Truncate} from '@primer/react'
import {memo, useCallback, useEffect, useState, type ReactNode} from 'react'
import {testIdProps} from '@github-ui/test-id-props'
import {SafeHTMLBox} from '@github-ui/safe-html'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {
  type ReactPartialAnchorProps,
  useExternalAnchor,
  type PropsWithPartialAnchor,
} from '@github-ui/react-core/react-partial-anchor'
import {Dialog, type DialogHeaderProps, type DialogProps} from '@primer/react/experimental'
import {GitHubAvatar} from '@github-ui/github-avatar'
import memoize from '@github/memoize'
import {useClickAnalytics} from '@github-ui/use-analytics'
import {UserStatusDialog, type UserStatus} from './UserStatusDialog'
import {Emoji} from './Emoji'
import styles from './styles.module.css'
import {ErrorDialog, type ErrorDialogProps} from './ErrorDialog'
import {AccountSwitcher, type AccountSwitcherProps} from './AccountSwitcher'
import {GlobalCreateMenuItem, type GlobalCreateMenuProps} from '@github-ui/global-create-menu'

const fetchLazyData = memoize(async function fetchLazyData(url: string) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}`)
  }

  return response.json()
})

export interface GlobalUserNavDrawerProps
  extends ReactPartialAnchorProps,
    Omit<AccountSwitcherProps, 'stashedAccounts' | 'setError'> {
  owner: {
    login: string
    name: string
    avatarUrl: string
  }
  lazyLoadItemDataFetchUrl: string
  showAccountSwitcher: boolean
  showCopilot: boolean
  showEnterprises: boolean
  showEnterprise: boolean
  showGists: boolean
  showSponsors: boolean
  showUpgrade: boolean
  showFeaturesPreviews: boolean
  showEnterpriseSettings: boolean
  projectsPath: string
  gistsUrl: string
  docsUrl: string
  yourEnterpriseUrl: string
  enterpriseSettingsUrl: string
  supportUrl: string
  onClose: DialogProps['onClose']
  createMenuProps: GlobalCreateMenuProps
}

export type LazyLoadItemDataAttributes = {
  userStatus: UserStatus
  enterpriseTrialUrl?: string
  hasUnseenFeatures: boolean
  stashedAccounts: AccountSwitcherProps['stashedAccounts']
}

type LazyLoadItemData = {fetchError: boolean} & LazyLoadItemDataAttributes

const erroredLazyLoadItemData: LazyLoadItemData = {
  fetchError: true,
  userStatus: {},
  hasUnseenFeatures: false,
  stashedAccounts: [],
}

type UserStatusItemProps = {
  lazyLoadItemData: LazyLoadItemData | null
  onClick: () => void
}

function NavLink({
  href,
  icon,
  analyticsCategory = 'Global navigation',
  analyticsAction,
  analyticsLabel,
  children,
}: {
  href: string
  icon: Icon
  analyticsCategory?: string
  analyticsAction: string
  analyticsLabel?: string
  children: ReactNode
}) {
  const {sendClickAnalyticsEvent} = useClickAnalytics()
  const onClick = useCallback(() => {
    sendClickAnalyticsEvent({
      category: analyticsCategory,
      action: analyticsAction,
      label: analyticsLabel,
    })
  }, [sendClickAnalyticsEvent, analyticsCategory, analyticsAction, analyticsLabel])

  return (
    <ActionList.LinkItem href={href} onClick={onClick}>
      <ActionList.LeadingVisual>
        <Octicon icon={icon} />
      </ActionList.LeadingVisual>
      {children}
    </ActionList.LinkItem>
  )
}

const UserStatusNavItem = memo(function UserStatusNavItem({lazyLoadItemData, onClick}: UserStatusItemProps) {
  return (
    <>
      <ActionList.Item {...testIdProps('global-user-nav-set-status-item')} onSelect={onClick}>
        <ActionList.LeadingVisual>
          {lazyLoadItemData?.userStatus?.emojiAttributes ? (
            <Emoji {...lazyLoadItemData?.userStatus.emojiAttributes} />
          ) : (
            <Octicon icon={SmileyIcon} />
          )}
        </ActionList.LeadingVisual>
        {lazyLoadItemData ? (
          <SafeHTMLBox
            className={styles.emojiContainer}
            unverifiedHTML={lazyLoadItemData.userStatus.messageHtml || 'Set status'}
          />
        ) : (
          <LoadingSkeleton height="md" />
        )}
      </ActionList.Item>
    </>
  )
})

type UpgradeNavItemProps = {
  lazyLoadItemData: LazyLoadItemData | null
}

function UpgradeNavItem(props: UpgradeNavItemProps) {
  const enterpriseTrialUrl = props.lazyLoadItemData?.enterpriseTrialUrl
  if (enterpriseTrialUrl) {
    return (
      <NavLink
        href={enterpriseTrialUrl}
        icon={UploadIcon}
        analyticsCategory="start_a_free_trial"
        analyticsAction="click_to_set_up_enterprise_trial"
        analyticsLabel="ref_loc:side_panel;ref_cta:try_enterprise"
      >
        Try Enterprise
        {/* eslint-disable-next-line primer-react/direct-slot-children */}
        <ActionList.TrailingVisual>
          <Label variant="primary">Free</Label>
        </ActionList.TrailingVisual>
      </NavLink>
    )
  } else {
    return (
      <NavLink href="/account/choose?action=upgrade" icon={UploadIcon} analyticsAction="UPGRADE_PLAN">
        Upgrade
      </NavLink>
    )
  }
}

function FeaturePreviewDialog({onClose, login}: {onClose: () => void; login: string}) {
  return (
    <Dialog
      title="Feature preview dialog"
      sx={{width: 960}}
      onClose={onClose}
      renderBody={() => {
        return (
          <Dialog.Body className="p-0">
            <include-fragment src={`/users/${login}/feature_previews`}>
              <p className="text-center mt-3" data-hide-on-error>
                <Spinner />
              </p>
              <p className="flash flash-error mb-0 mt-2" data-show-on-error hidden>
                <AlertIcon />
                Sorry, something went wrong and we were not able to fetch the feature previews
              </p>
            </include-fragment>
          </Dialog.Body>
        )
      }}
    />
  )
}

/* This component will eventually use the Dialog component from Primer React to encapsulate the entire global user
 * nav drawer. We aren't able to manage the dialog here because the user nav drawer opens several constituent dialogs -
 * the user status dialog and the feature preview dialog - which are currently rendered in Rails-land using the Primer
 * Dialog component from primer_view_components. It's architected this way because dialogs from the two frameworks
 * have proven to be somewhat incompatible. For example, pressing 'esc' closes the nav drawer instead of the user
 * status dialog, etc. Keeping all the actual dialogs in Rails sidesteps these issues. When the constituent dialogs
 * are eventually ported to React, we can stick a Dialog in here and manage the entire nav drawer in React.
 *
 * We've actually tried this already. See
 * https://github.com/github/github/blob/35187c0a5d3277413a0bb74db33c521462787ada/ui/packages/global-user-nav-drawer/GlobalUserNavDrawer.tsx
 * for inspiration when it's time to move the dialog into this component.
 */
function GlobalUserNavDrawerDialog(props: GlobalUserNavDrawerProps & {onClose: DialogProps['onClose']}) {
  const [lazyLoadItemData, setLazyLoadItemData] = useState<LazyLoadItemData | null>(null)
  const [showUserStatusDialog, setShowUserStatusDialog] = useState(false)
  const [showFeaturePreviewDialog, setShowFeaturePreviewDialog] = useState(false)
  const {onClose, owner} = props
  const profilePath = `/${owner.login}`
  const {sendClickAnalyticsEvent} = useClickAnalytics()

  const openUserStatusDialog = useCallback(() => {
    setShowUserStatusDialog(true)
    sendClickAnalyticsEvent({category: 'Global navigation', action: 'USER_STATUS'})
  }, [sendClickAnalyticsEvent])
  const onUserStatusClosed = useCallback(
    async (statusPromise?: Promise<UserStatus> | string) => {
      setShowUserStatusDialog(false)

      if (statusPromise && typeof statusPromise !== 'string' && lazyLoadItemData) {
        try {
          const userStatus = await statusPromise
          setLazyLoadItemData({...lazyLoadItemData, userStatus})
        } catch (e) {
          // Do nothing
        }
      }
    },
    [lazyLoadItemData],
  )
  const openFeaturePreviewDialog = useCallback(() => {
    setShowFeaturePreviewDialog(true)
    sendClickAnalyticsEvent({category: 'Global navigation', action: 'FEATURE_PREVIEW'})
  }, [sendClickAnalyticsEvent])

  useEffect(() => {
    if (!lazyLoadItemData) {
      const fetchItemData = async () => {
        try {
          const itemData = (await fetchLazyData(props.lazyLoadItemDataFetchUrl)) as LazyLoadItemDataAttributes
          setLazyLoadItemData({fetchError: false, ...itemData})
        } catch (e) {
          setLazyLoadItemData(erroredLazyLoadItemData)
        }
      }

      fetchItemData()
    }
  }, [props.lazyLoadItemDataFetchUrl, lazyLoadItemData])

  const renderHeader = useCallback(
    ({dialogLabelId}: DialogHeaderProps) => {
      return (
        <div
          className="d-flex pr-3 pl-3 pt-3"
          id={dialogLabelId}
          aria-label="User navigation"
          role="heading"
          aria-level={1}
        >
          <div className="d-flex flex-1">
            <div className="d-flex">
              <GitHubAvatar src={owner.avatarUrl} size={32} />
              <div className="lh-condensed overflow-hidden d-flex flex-column flex-justify-center ml-2 f5 mr-auto">
                <div className="text-bold">
                  <Truncate title={owner.login}>{owner.login}</Truncate>
                </div>
                <div className="fgColor-muted">
                  <Truncate title={owner.name}>{owner.name}</Truncate>
                </div>
              </div>
            </div>
          </div>
          {props.showAccountSwitcher && (
            <AccountSwitcher
              canAddAccount={props.canAddAccount}
              addAccountPath={props.addAccountPath}
              switchAccountPath={props.switchAccountPath}
              stashedAccounts={lazyLoadItemData?.stashedAccounts ?? null}
              loginAccountPath={props.loginAccountPath}
              setError={setError}
            />
          )}
          <Dialog.CloseButton onClose={() => onClose('close-button')} />
        </div>
      )
    },
    [
      onClose,
      owner,
      lazyLoadItemData?.stashedAccounts,
      props.canAddAccount,
      props.addAccountPath,
      props.switchAccountPath,
      props.loginAccountPath,
      props.showAccountSwitcher,
    ],
  )

  const [error, setError] = useState<ErrorDialogProps | false>(false)

  return error ? (
    <ErrorDialog {...error} onClose={() => setError(false)} />
  ) : (
    <Dialog onClose={props.onClose} width="medium" position="right" renderHeader={renderHeader}>
      {showUserStatusDialog && <UserStatusDialog onClose={onUserStatusClosed} />}
      {showFeaturePreviewDialog && (
        <FeaturePreviewDialog onClose={() => setShowFeaturePreviewDialog(false)} login={props.owner.login} />
      )}
      <ActionList variant="full">
        <UserStatusNavItem lazyLoadItemData={lazyLoadItemData} onClick={openUserStatusDialog} />

        <ActionList.Divider />

        <NavLink href={profilePath} icon={PersonIcon} analyticsAction="PROFILE">
          Your profile
        </NavLink>
        <NavLink href={`${profilePath}?tab=repositories`} icon={RepoIcon} analyticsAction="YOUR_REPOSITORIES">
          Your repositories
        </NavLink>
        {props.showCopilot && (
          <NavLink
            href="/github-copilot/signup"
            icon={CopilotIcon}
            analyticsCategory="try_copilot"
            analyticsAction="click_to_try_copilot"
            analyticsLabel="ref_loc:side_panel;ref_cta:your_copilot"
          >
            Your Copilot
          </NavLink>
        )}
        <NavLink href={props.projectsPath} icon={ProjectIcon} analyticsAction="YOUR_PROJECTS">
          Your projects
        </NavLink>
        <NavLink href={`${profilePath}?tab=stars`} icon={StarIcon} analyticsAction="YOUR_STARS">
          Your stars
        </NavLink>
        {props.showGists && (
          <NavLink href={props.gistsUrl} icon={CodeSquareIcon} analyticsAction="YOUR_GISTS">
            Your gists
          </NavLink>
        )}
        <NavLink href="/settings/organizations" icon={OrganizationIcon} analyticsAction="YOUR_ORGANIZATIONS">
          Your organizations
        </NavLink>
        {props.showEnterprises && (
          <NavLink
            href="/settings/enterprises"
            icon={GlobeIcon}
            analyticsCategory="enterprises_more_discoverable"
            analyticsAction="click_your_enterprises"
            analyticsLabel="ref_loc:side_panel;ref_cta:your_enterprises;is_navigation_redesign:true"
          >
            Your enterprises
          </NavLink>
        )}
        {props.showEnterprise && (
          <NavLink href={props.yourEnterpriseUrl} icon={GlobeIcon} analyticsAction="YOUR_ENTERPRISE">
            Your enterprise
          </NavLink>
        )}
        {props.showSponsors && (
          <NavLink href="/sponsors/accounts" icon={HeartIcon} analyticsAction="SPONSORS">
            Your sponsors
          </NavLink>
        )}

        <ActionList.Divider />

        <GlobalCreateMenuItem {...props.createMenuProps} />

        {props.showUpgrade && <UpgradeNavItem lazyLoadItemData={lazyLoadItemData} />}

        {props.showFeaturesPreviews && (
          <ActionList.Item onSelect={openFeaturePreviewDialog}>
            <ActionList.LeadingVisual>
              <Octicon icon={BeakerIcon} />
            </ActionList.LeadingVisual>
            {lazyLoadItemData?.hasUnseenFeatures && (
              <ActionList.TrailingVisual>
                <Label variant="accent">New</Label>
              </ActionList.TrailingVisual>
            )}
            Feature preview
          </ActionList.Item>
        )}

        <NavLink href="/settings/profile" icon={GearIcon} analyticsAction="SETTINGS">
          Settings
        </NavLink>
        {props.showEnterpriseSettings && (
          <NavLink href={props.enterpriseSettingsUrl} icon={GlobeIcon} analyticsAction="ENTERPRISE_SETTINGS">
            Enterprise settings
          </NavLink>
        )}

        <ActionList.Divider />

        <NavLink href={props.docsUrl} icon={BookIcon} analyticsAction="DOCS">
          GitHub Docs
        </NavLink>
        <NavLink href={props.supportUrl} icon={PeopleIcon} analyticsAction="SUPPORT">
          GitHub Support
        </NavLink>
        <NavLink href="https://community.github.com" icon={CommentDiscussionIcon} analyticsAction="COMMUNITY">
          GitHub Community
        </NavLink>

        <ActionList.Divider />

        <NavLink href="/logout" icon={SignOutIcon} analyticsAction="LOGOUT">
          Sign out
        </NavLink>
      </ActionList>
    </Dialog>
  )
}

function ExternallyAnchoredGlobalUserNavDrawer(props: PropsWithPartialAnchor<GlobalUserNavDrawerProps>) {
  const {open, setOpen, ref: anchorRef} = useExternalAnchor(props.reactPartialAnchor)
  const onClose = useCallback(() => {
    setOpen(false)
    setTimeout(() => {
      // Dialog will soon support `returnFocusRef`, which should be used instead
      anchorRef.current?.focus()
    })
  }, [setOpen, anchorRef])

  if (open) {
    return <GlobalUserNavDrawerDialog {...props} onClose={onClose} />
  }

  return <></>
}

export function GlobalUserNavDrawer(props: GlobalUserNavDrawerProps) {
  if (props.reactPartialAnchor) {
    return <ExternallyAnchoredGlobalUserNavDrawer {...props} reactPartialAnchor={props.reactPartialAnchor} />
  }

  // If no anchor is provided, assume the drawer state is externally controlled
  return <GlobalUserNavDrawerDialog {...props} />
}
