import {useClickAnalytics} from '@github-ui/use-analytics'
import {ActionList, ActionMenu, Spinner} from '@primer/react'
import {Tooltip} from '@primer/react/next'
import {
  CodeIcon,
  CodespacesIcon,
  IssueOpenedIcon,
  OrganizationIcon,
  PeopleIcon,
  PersonAddIcon,
  PlusIcon,
  ProjectIcon,
  RepoIcon,
  RepoPushIcon,
  type Icon,
} from '@primer/octicons-react'
import {useCallback, useId, useState, lazy, Suspense, useEffect, type ComponentProps} from 'react'
import {
  type ReactPartialAnchorProps,
  useExternalAnchor,
  type PropsWithPartialAnchor,
} from '@github-ui/react-core/react-partial-anchor'
import type {CreateIssueDialogProps} from './CreateIssueDialog'

const LazyCreateIssueDialog = lazy(() => import('./CreateIssueDialog'))

interface GlobalCreateMenuBaseProps extends ReactPartialAnchorProps {
  createRepo?: boolean
  importRepo?: boolean
  createOrg?: boolean
  codespaces?: boolean
  gist?: boolean
  createIssue?: boolean
  org?: {
    login: string
    addWord: string
  } | null
  owner?: string
  repo?: string
  side?: ComponentProps<typeof ActionMenu.Overlay>['side']
  isOpen?: boolean
  setIsOpen?: (value: boolean) => void
  environment?: CreateIssueDialogProps['environment']
}

interface LegacyProjectProps {
  createLegacyProject?: true
  createProject?: false
  createProjectUrl?: string
}

interface ProjectProps {
  createLegacyProject?: false
  createProject: true
  createProjectUrl: string
}

export type GlobalCreateMenuProps = GlobalCreateMenuBaseProps & (LegacyProjectProps | ProjectProps)

interface CreateMenuItemProps {
  label: string
  LeadingVisual: Icon
  analyticsLabel?: string
}

function analyticsPayload({label, analyticsLabel}: Pick<CreateMenuItemProps, 'label' | 'analyticsLabel'>) {
  return {
    category: 'SiteHeaderComponent',
    action: 'add_dropdown',
    label: analyticsLabel || label.toLowerCase(),
  }
}

function CreateMenuLinkItem({
  label,
  href,
  LeadingVisual,
  analyticsLabel,
}: CreateMenuItemProps & {
  href: string
}) {
  const {sendClickAnalyticsEvent} = useClickAnalytics()

  const handleClick = useCallback(() => {
    sendClickAnalyticsEvent(analyticsPayload({label, analyticsLabel}))
  }, [label, analyticsLabel, sendClickAnalyticsEvent])

  return (
    <ActionList.LinkItem href={href} onClick={handleClick}>
      <ActionList.LeadingVisual>
        <LeadingVisual />
      </ActionList.LeadingVisual>
      {label}
    </ActionList.LinkItem>
  )
}

function CreateMenuItem({
  label,
  onClick,
  LeadingVisual,
  analyticsLabel,
}: CreateMenuItemProps & {
  onClick: () => void
}) {
  const {sendClickAnalyticsEvent} = useClickAnalytics()

  const handleClick = useCallback(() => {
    sendClickAnalyticsEvent(analyticsPayload({label, analyticsLabel}))
    onClick()
  }, [label, analyticsLabel, sendClickAnalyticsEvent, onClick])

  return (
    <ActionList.Item onSelect={handleClick}>
      <ActionList.LeadingVisual>
        <LeadingVisual />
      </ActionList.LeadingVisual>
      {label}
    </ActionList.Item>
  )
}

function MenuItemSpinner() {
  return <Spinner size="small" />
}

function GlobalCreateMenuOverlay({
  side = 'outside-bottom',
  createRepo,
  importRepo,
  createOrg,
  createProject,
  createProjectUrl,
  createLegacyProject,
  createIssue,
  codespaces,
  gist,
  org,
  owner,
  repo,
  isOpen = false,
  setIsOpen = () => {},
  environment,
}: GlobalCreateMenuProps) {
  const [isCreateIssueVisible, setIsCreateIssueVisible] = useState(false)
  // Has the `LazyCreateIssueDialog` loaded? We use this to know when to enable the "New issue" menu item
  const [isCreateIssueLoaded, setIsCreateIssueLoaded] = useState(false)
  // Defer lazy loading the CreateIssueDialog until the first time the menu is opened
  const [createIssueIntent, setCreateIssueIntent] = useState(isOpen)
  useEffect(() => {
    if (isOpen) {
      setCreateIssueIntent(true)
    }
  }, [isOpen])
  // this allows us to fallback to a spinner on the "New issue" menu item while the dialog is lazy-loading in,
  // but *only* after the user has clicked
  const shouldShowCreateIssueFallback = isCreateIssueVisible && !isCreateIssueLoaded

  return (
    <>
      {createIssue && createIssueIntent && (
        <Suspense>
          <LazyCreateIssueDialog
            isVisible={isCreateIssueVisible}
            setIsVisible={setIsCreateIssueVisible}
            setIsLoaded={setIsCreateIssueLoaded}
            setIsParentMenuOpen={setIsOpen}
            owner={owner}
            repo={repo}
            environment={environment}
          />
        </Suspense>
      )}
      <ActionMenu.Overlay side={side}>
        <ActionList>
          {createIssue && (
            <CreateMenuItem
              label="New issue"
              onClick={() => {
                setIsCreateIssueVisible(true)
                return false
              }}
              LeadingVisual={shouldShowCreateIssueFallback ? MenuItemSpinner : IssueOpenedIcon}
            />
          )}
          {createRepo !== false && <CreateMenuLinkItem label="New repository" href="/new" LeadingVisual={RepoIcon} />}
          {importRepo && (
            <CreateMenuLinkItem label="Import repository" href="/new/import" LeadingVisual={RepoPushIcon} />
          )}

          {(codespaces || gist) && (
            <>
              <ActionList.Divider />
              {codespaces && (
                <CreateMenuLinkItem label="New codespace" href="/codespaces/new" LeadingVisual={CodespacesIcon} />
              )}
              {gist && <CreateMenuLinkItem label="New gist" href="/gist" LeadingVisual={CodeIcon} />}
            </>
          )}

          {(createOrg || createProject || createLegacyProject) && (
            <>
              <ActionList.Divider />
              {createOrg && (
                <CreateMenuLinkItem
                  label="New organization"
                  href="/account/organizations/new"
                  LeadingVisual={OrganizationIcon}
                />
              )}
              {createProject && (
                <CreateMenuLinkItem
                  label="New project"
                  analyticsLabel="new project"
                  href={createProjectUrl}
                  LeadingVisual={ProjectIcon}
                />
              )}
              {!createProject && createLegacyProject && (
                <CreateMenuLinkItem
                  label="New project"
                  analyticsLabel="new legacy project"
                  href="/new/project"
                  LeadingVisual={ProjectIcon}
                />
              )}
            </>
          )}

          {org && (
            <>
              <ActionList.Divider />
              <CreateMenuLinkItem
                label={`${org.addWord} someone to ${org.login}`}
                analyticsLabel="invite someone"
                href={`/orgs/${org.login}/people#invite-member`}
                LeadingVisual={PersonAddIcon}
              />
              <CreateMenuLinkItem
                label={`New team in ${org.login}`}
                analyticsLabel="new team"
                href={`/orgs/${org.login}/new-team`}
                LeadingVisual={PeopleIcon}
              />
              <CreateMenuLinkItem
                label={`New repository in ${org.login}`}
                analyticsLabel="organization - new repository"
                href={`/organizations/${org.login}/repositories/new`}
                LeadingVisual={RepoIcon}
              />
            </>
          )}
        </ActionList>
      </ActionMenu.Overlay>
    </>
  )
}

function ExternallyAnchoredGlobalCreateMenu(props: PropsWithPartialAnchor<GlobalCreateMenuProps>) {
  const {ref: anchorRef, open, setOpen} = useExternalAnchor(props.reactPartialAnchor)

  return (
    <ActionMenu anchorRef={anchorRef} open={open} onOpenChange={setOpen}>
      <GlobalCreateMenuOverlay {...props} isOpen={open} setIsOpen={setOpen} />
    </ActionMenu>
  )
}

function GlobalCreateMenuWithAnchor(props: GlobalCreateMenuProps) {
  const toolTipId = `global-create-menu-tooltip-${useId()}`
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ActionMenu open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip text="Create New..." type="label" id={toolTipId}>
        <ActionMenu.Button leadingVisual={PlusIcon}>{''}</ActionMenu.Button>
      </Tooltip>
      <GlobalCreateMenuOverlay {...props} isOpen={isOpen} setIsOpen={setIsOpen} />
    </ActionMenu>
  )
}

export function GlobalCreateMenu(props: GlobalCreateMenuProps) {
  if (props.reactPartialAnchor) {
    return <ExternallyAnchoredGlobalCreateMenu {...props} reactPartialAnchor={props.reactPartialAnchor} />
  }

  return <GlobalCreateMenuWithAnchor {...props} />
}

const hideOnMediumScreens = {'@media (min-width: 48rem)': {display: 'none'}}

export function GlobalCreateMenuItem(props: GlobalCreateMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOnSelect = () => {
    setIsOpen(open => !open)
  }

  return (
    <>
      <ActionMenu open={isOpen} onOpenChange={setIsOpen}>
        <ActionMenu.Anchor>
          <ActionList.Item sx={hideOnMediumScreens} onSelect={handleOnSelect}>
            <ActionList.LeadingVisual>
              <PlusIcon />
            </ActionList.LeadingVisual>
            Create new
          </ActionList.Item>
        </ActionMenu.Anchor>

        <GlobalCreateMenuOverlay {...props} isOpen={isOpen} setIsOpen={setIsOpen} side="outside-top" />
      </ActionMenu>
      <ActionList.Divider sx={hideOnMediumScreens} />
    </>
  )
}
