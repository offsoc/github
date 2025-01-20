import {usePortalTooltip} from '@github-ui/portal-tooltip/use-portal-tooltip'
import {testIdProps} from '@github-ui/test-id-props'
import {
  ArchiveIcon,
  BookIcon,
  CommentIcon,
  CopyIcon,
  DuplicateIcon,
  GearIcon,
  GraphIcon,
  type Icon,
  KebabHorizontalIcon,
  RocketIcon,
  SidebarExpandIcon,
  WorkflowIcon,
} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Button, ButtonGroup, Octicon, Portal} from '@primer/react'
import {memo, type ReactNode, useCallback, useMemo, useRef, useState} from 'react'

import {
  CopyAsTemplate,
  CopyProject,
  InsightsViewOpen,
  ProjectDescriptionShow,
  ProjectDescriptionSidePanelUI,
  ProjectLinkChangelog,
  ProjectLinkDocs,
  ProjectLinkFeedback,
  ProjectTopMenuUI,
  UseThisTemplateUI,
  WorkflowsOpen,
} from '../../api/stats/contracts'
import {getInitialState} from '../../helpers/initial-state'
import {fetchJSONIslandData} from '../../helpers/json-island'
import {ViewerPrivileges} from '../../helpers/viewer-privileges'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {useEnabledFeatures} from '../../hooks/use-enabled-features'
import {useSidePanel} from '../../hooks/use-side-panel'
import {useInsightsEnabledFeatures} from '../../pages/insights/hooks/use-insights-features'
import {Link} from '../../router'
import {useProjectRouteParams} from '../../router/use-project-route-params'
import {PROJECT_ARCHIVE_ROUTE, PROJECT_SETTINGS_ROUTE, PROJECT_WORKFLOWS_ROUTE} from '../../routes'
import {useCharts} from '../../state-providers/charts/use-charts'
import {useProjectNumber} from '../../state-providers/memex/use-project-number'
import {useProjectState} from '../../state-providers/memex/use-project-state'
import {useProjectTemplateId} from '../../state-providers/memex/use-project-template-id'
import {TopBarResources} from '../../strings'
import {PresenceAvatars} from '../presence-avatars'
import {LatestStatusUpdate} from './latest-status-update'

const InsightsNavigationButton = memo(function InsightsNavigationButton() {
  const {getChartLinkTo} = useCharts()
  const {postStats} = usePostStats()
  const postInsightsViewOpenStats = useCallback(() => {
    postStats({name: InsightsViewOpen})
  }, [postStats])
  const contentRef = useRef<HTMLAnchorElement>(null)
  const [contentProps, portalTooltip] = usePortalTooltip({
    contentRef,
    'aria-label': TopBarResources.insightsButton,
    direction: 'sw',
    anchorSide: 'outside-bottom',
  })

  return (
    <Button
      ref={contentRef}
      to={getChartLinkTo(0).url}
      onClick={postInsightsViewOpenStats}
      sx={{px: 2}}
      {...testIdProps('project-insights-button')}
      aria-label={TopBarResources.insightsButton}
      as={Link}
      {...contentProps}
    >
      <Octicon icon={GraphIcon} />
      {portalTooltip}
    </Button>
  )
})

const ProjectDetailsButton = memo(function ProjectDescriptionButton() {
  const {openPaneInfo} = useSidePanel()
  const {postStats} = usePostStats()

  const contentRef = useRef<HTMLButtonElement>(null)
  const [contentProps, portalTooltip] = usePortalTooltip({
    contentRef,
    'aria-label': TopBarResources.projectDetailsButton,
    direction: 'sw',
    anchorSide: 'outside-bottom',
  })

  return (
    <Button
      ref={contentRef}
      key="project-details-button"
      onClick={() => {
        postStats({
          name: ProjectDescriptionShow,
          ui: ProjectDescriptionSidePanelUI,
        })
        openPaneInfo()
      }}
      sx={{px: 2}}
      aria-label={TopBarResources.projectDetailsButton}
      {...testIdProps('project-memex-info-button')}
      {...contentProps}
    >
      <Octicon icon={SidebarExpandIcon} />
      {portalTooltip}
    </Button>
  )
})

const SettingsOverflowMenu = memo(function SettingsOverflowMenu() {
  const {projectNumber} = useProjectNumber()
  const {feedbackLink, copyProjectPartialUrl} = getInitialState()
  const {memex_automation_enabled} = useEnabledFeatures()
  const projectRouteParams = useProjectRouteParams()
  const [isOpen, setIsOpen] = useState(false)
  const {postStats} = usePostStats()

  const {hasWritePermissions, isLoggedIn, canCopyAsTemplate} = ViewerPrivileges()

  const toggleIsOpen = useCallback(() => {
    setIsOpen(s => !s)
  }, [])

  const openFeedback = useCallback(() => {
    toggleIsOpen()
    postStats({name: ProjectLinkFeedback, ui: ProjectTopMenuUI})
  }, [postStats, toggleIsOpen])

  const openDocs = useCallback(() => {
    toggleIsOpen()
    postStats({name: ProjectLinkDocs, ui: ProjectTopMenuUI})
  }, [postStats, toggleIsOpen])

  const openChangelog = useCallback(() => {
    toggleIsOpen()
    postStats({name: ProjectLinkChangelog, ui: ProjectTopMenuUI})
  }, [postStats, toggleIsOpen])

  const openWorkflows = useCallback(() => {
    toggleIsOpen()
    postStats({name: WorkflowsOpen})
  }, [postStats, toggleIsOpen])

  const postMakeCopyStats = useCallback(() => {
    postStats({
      name: CopyProject,
      ui: ProjectTopMenuUI,
    })
  }, [postStats])

  const postCopyAsTemplateStats = useCallback(() => {
    postStats({
      name: CopyAsTemplate,
      ui: ProjectTopMenuUI,
    })
  }, [postStats])

  const showCopyAsTemplate = isLoggedIn && canCopyAsTemplate

  const menuItems = useMemo(() => {
    const items: Array<ReactNode> = []

    if (hasWritePermissions) {
      items.push(
        memex_automation_enabled && (
          <InternalLink
            key="workflows"
            to={PROJECT_WORKFLOWS_ROUTE.generatePath(projectRouteParams)}
            icon={WorkflowIcon}
            text="Workflows"
            onClick={openWorkflows}
            testId="automation-settings-button"
          />
        ),
        <InternalLink
          key="archive"
          to={PROJECT_ARCHIVE_ROUTE.generatePath(projectRouteParams)}
          icon={ArchiveIcon}
          text="Archived items"
          onClick={toggleIsOpen}
          testId="archive-navigation-button"
        />,
        <InternalLink
          key="settings"
          to={PROJECT_SETTINGS_ROUTE.generatePath(projectRouteParams)}
          icon={GearIcon}
          text="Settings"
          onClick={toggleIsOpen}
          testId="project-settings-button"
        />,
      )
    }

    if (isLoggedIn) {
      items.push(
        <ActionList.Item
          key="topMenuCopyProjectButton"
          role="menuitem"
          as="button"
          id={`topmenu-copy-project-dialog-${projectNumber}`}
          data-show-dialog-id={`copy-project-dialog-${projectNumber}`}
          onSelect={postMakeCopyStats}
        >
          <ActionList.LeadingVisual>
            <CopyIcon />
          </ActionList.LeadingVisual>
          Make a copy
        </ActionList.Item>,
      )
    }

    if (showCopyAsTemplate) {
      items.push(
        <ActionList.Item
          key="topMenuCopyAsTemplateButton"
          role="menuitem"
          as="button"
          id={`topmenu-copy-as-template-dialog-${projectNumber}`}
          data-show-dialog-id={`copy-as-template-dialog-${projectNumber}`}
          onSelect={postCopyAsTemplateStats}
          {...testIdProps('copy-as-template-button')}
        >
          <ActionList.LeadingVisual>
            <DuplicateIcon />
          </ActionList.LeadingVisual>
          Copy as template
        </ActionList.Item>,
      )
    }

    if (items.length) {
      items.push(<ActionMenu.Divider key="divider-write-permissions" />)
    }

    const githubRuntime = fetchJSONIslandData('github-runtime') ?? 'dotcom'
    const githubVersionNumber = fetchJSONIslandData('github-version-number')
    const versionNumber = githubVersionNumber === 'unknown' ? 'latest' : githubVersionNumber
    const docsLink =
      githubRuntime === 'enterprise'
        ? `https://docs.github.com/enterprise-server@${versionNumber}/issues/planning-and-tracking-with-projects`
        : 'https://docs.github.com/issues/planning-and-tracking-with-projects'

    items.push(
      <ActionList.Group key="title-github-projects" variant="subtle">
        <ActionList.GroupHeading>GitHub Projects</ActionList.GroupHeading>
        <ExternalLink
          key="new"
          href="https://github.blog/changelog/label/projects/"
          icon={RocketIcon}
          text="What’s new"
          onClick={openChangelog}
          testId="whats-new-link"
        />
        <ExternalLink
          key="feedback"
          href={feedbackLink}
          icon={CommentIcon}
          text="Give feedback"
          onClick={openFeedback}
          testId="feedback-link"
        />
        <ExternalLink
          key="docs"
          href={docsLink}
          icon={BookIcon}
          text="GitHub Docs"
          onClick={openDocs}
          testId="docs-link"
        />
      </ActionList.Group>,
    )

    return items
  }, [
    hasWritePermissions,
    isLoggedIn,
    showCopyAsTemplate,
    openChangelog,
    feedbackLink,
    openFeedback,
    openDocs,
    memex_automation_enabled,
    openWorkflows,
    toggleIsOpen,
    projectNumber,
    postMakeCopyStats,
    postCopyAsTemplateStats,
    projectRouteParams,
  ])

  const contentRef = useRef<HTMLButtonElement>(null)
  const [contentProps, portalTooltip] = usePortalTooltip({
    contentRef,
    'aria-label': TopBarResources.viewMoreOptions,
    direction: 'sw',
    anchorSide: 'outside-bottom',
    open: isOpen ? false : undefined,
  })

  return (
    <>
      <Button
        ref={contentRef}
        {...testIdProps('project-menu-button')}
        sx={{px: 2}}
        {...contentProps}
        onClick={() => setIsOpen(s => !s)}
        aria-label={TopBarResources.viewMoreOptions}
      >
        <Octicon icon={KebabHorizontalIcon} />
        {portalTooltip}
      </Button>
      <ActionMenu anchorRef={contentRef} open={isOpen} onOpenChange={setIsOpen} key="project-menu">
        <ActionMenu.Overlay>
          <ActionList>{menuItems}</ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>

      <Portal>
        <div>
          {isLoggedIn && <include-fragment src={encodeURI(copyProjectPartialUrl)} />}
          {showCopyAsTemplate && <include-fragment src={encodeURI(`${copyProjectPartialUrl}?copy_as_template=true`)} />}
        </div>
      </Portal>
    </>
  )
})

const navButtonGroupSx = {flexShrink: 0}
const ProjectNavigationButtons = memo(function ProjectNavigationButtons({isProjectPath}: {isProjectPath: boolean}) {
  const {isInsightsChartViewEnabled} = useInsightsEnabledFeatures()

  const isProjectDescriptionButtonVisible = isProjectPath

  return (
    <ButtonGroup sx={navButtonGroupSx}>
      {isInsightsChartViewEnabled ? <InsightsNavigationButton /> : null}
      {isProjectDescriptionButtonVisible ? <ProjectDetailsButton /> : null}
      <SettingsOverflowMenu />
    </ButtonGroup>
  )
})

// Abbreviated version of the "Make a copy" form in settings, with static defaults
const UseTemplateButton = memo(function UseTemplateButton() {
  const {copyProjectPartialUrl} = getInitialState()
  const {isLoggedIn} = ViewerPrivileges()
  const {projectNumber} = useProjectNumber()
  const {postStats} = usePostStats()
  const projectTemplateId = useProjectTemplateId()
  const postUseThisTemplateStats = useCallback(() => {
    postStats({
      name: CopyProject,
      ui: UseThisTemplateUI,
    })
  }, [postStats])

  return (
    <Box
      {...testIdProps('use-this-template-form')}
      sx={{justifyItems: 'center', display: 'flex', alignItems: 'center', gap: 2}}
    >
      <Button
        size="medium"
        variant="primary"
        {...testIdProps('use-this-template-button')}
        aria-label="Use this template"
        data-show-dialog-id={`copy-from-template-dialog-${projectNumber}`}
        onClick={postUseThisTemplateStats}
      >
        Use this template
      </Button>
      <Portal>
        <div>
          {isLoggedIn && (
            <include-fragment src={encodeURI(`${copyProjectPartialUrl}?template_id=${projectTemplateId}`)} />
          )}
        </div>
      </Portal>
    </Box>
  )
})

type LinkProps = {
  icon: Icon
  text: string
  onClick: () => void
  testId: string
}
type InternalLinkProps = LinkProps & {to: string}
type ExternalLinkProps = LinkProps & {href: string}

const ExternalLink = ({text, icon: LinkIcon, testId, onClick, href}: ExternalLinkProps) => (
  <ActionList.LinkItem role="menuitem" href={href} target="_blank" onClick={onClick} {...testIdProps(testId)}>
    <ActionList.LeadingVisual>
      <LinkIcon />
    </ActionList.LeadingVisual>
    {text}
  </ActionList.LinkItem>
)

const InternalLink = ({text, icon: LinkIcon, testId, onClick, to}: InternalLinkProps) => (
  <ActionList.LinkItem role="menuitem" as={Link} to={to} onClick={onClick} {...testIdProps(testId)}>
    <ActionList.LeadingVisual>
      <LinkIcon />
    </ActionList.LeadingVisual>
    {text}
  </ActionList.LinkItem>
)

const topBarSx = {
  display: 'flex',
  flexShrink: 0,
  mt: 0,
  px: [3, 4, 5],
  py: 2,
  bg: 'canvas.inset',
  alignItems: 'flex-start',
  position: 'relative',
  justifyContent: 'flex-end',
  borderBottom: 'none',
  flexWrap: 'wrap-reverse',
}
const topBarSxWithBorder = {
  ...topBarSx,
  borderBottom: '1px solid',
  borderColor: 'border.subtle',
}

const topBarActionsSx = {
  justifyItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: 2,
}

export const TopBar: React.FC<{children: React.ReactNode; isProjectPath?: boolean}> = memo(function TopBar({
  children,
  isProjectPath = false,
}) {
  const {isTemplate} = useProjectState()
  const {isOrganization} = getInitialState()

  return (
    <Box role="navigation" aria-label="Project" sx={isProjectPath ? topBarSx : topBarSxWithBorder}>
      {children}

      <div style={{flex: 1}} />

      <Box sx={topBarActionsSx}>
        {isProjectPath && !isTemplate && <LatestStatusUpdate />}
        <PresenceAvatars />
        <ProjectNavigationButtons isProjectPath={isProjectPath} />

        {isOrganization && isTemplate ? <UseTemplateButton /> : null}
      </Box>
    </Box>
  )
})
