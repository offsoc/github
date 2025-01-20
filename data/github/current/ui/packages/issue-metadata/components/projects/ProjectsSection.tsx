import type {
  ProjectPickerProject$data,
  ProjectPickerProject$key,
} from '@github-ui/item-picker/ProjectPickerProject.graphql'
import type {
  ProjectPickerClassicProject$data,
  ProjectPickerClassicProject$key,
} from '@github-ui/item-picker/ProjectPickerClassicProject.graphql'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {useCallback, useMemo, useState, type HTMLAttributes, type ReactNode, forwardRef} from 'react'
import {graphql, readInlineData, useRelayEnvironment, useFragment} from 'react-relay'
import {ConnectionHandler} from 'relay-runtime'

import {LABELS} from '../../constants/labels'
import {ERRORS} from '../../constants/errors'
import {commitDeleteIssueProjectsMutation} from '../../mutations/delete-issue-projects-mutation'

import {ProjectItemSection} from './ProjectItemSection'
import {ReadonlySectionHeader} from '@github-ui/issue-metadata/ReadonlySectionHeader'
import {Section} from '@github-ui/issue-metadata/Section'
import {SectionHeader} from '@github-ui/issue-metadata/SectionHeader'
import type {ProjectsSectionFragment$key} from './__generated__/ProjectsSectionFragment.graphql'
import {ActionList, Box, Button} from '@primer/react'
import {ChevronDownIcon, ChevronUpIcon} from '@primer/octicons-react'
import {commitUpdateIssueProjectsMutation} from '@github-ui/item-picker/updateIssueProjectsMutation'
import {commitAddIssueToClassicProjectMutation} from '@github-ui/item-picker/addIssueToClassicProjectMutation'
import {commitDeleteIssueFromClassicProjectMutation} from '@github-ui/item-picker/deleteIssueFromClassicProjectMutation'
import {
  ProjectPickerProjectFragment,
  ProjectPickerClassicProjectFragment,
  ProjectPicker,
  type Project as ProjectPickerItem,
} from '@github-ui/item-picker/ProjectPicker'
import {ClassicProjectItem} from './ClassicProjectItem'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'

const useShouldIncludeClassicProjects = () => {
  const {projects_classic_sunset_ui, projects_classic_sunset_override} = useFeatureFlags()

  if (projects_classic_sunset_override) return true

  return !projects_classic_sunset_ui
}

const ReadonlyProjectsSectionHeader = () => <ReadonlySectionHeader title={LABELS.sectionTitles.projects} />
const ProjectsSectionHeader = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLElement>>((props, ref) => (
  <SectionHeader ref={ref} id={props.id} title={LABELS.sectionTitles.projects} buttonProps={props} />
))
ProjectsSectionHeader.displayName = 'ProjectsSectionHeader'

type ProjectsSectionProps = {
  sectionHeader: JSX.Element
  hasItems: boolean
  children?: ReactNode
}
const ProjectsSection = ({sectionHeader, hasItems, children}: ProjectsSectionProps) => {
  return (
    <Section
      id={`sidebar-projects-section`}
      sectionHeader={sectionHeader}
      emptyText={hasItems ? undefined : LABELS.emptySections.projects}
    >
      {children}
    </Section>
  )
}

type CreateIssueProjectsSectionProps = {
  owner: string
  repo: string
  projects: ProjectPickerItem[]
  readonly?: boolean
  onSelectionChange: (value: ProjectPickerItem[]) => void
  shortcutEnabled: boolean
}
export const CreateIssueProjectsSection = ({
  owner,
  repo,
  projects,
  readonly,
  onSelectionChange,
  ...sharedConfigProps
}: CreateIssueProjectsSectionProps) => {
  const includeClassicProjects = useShouldIncludeClassicProjects()

  const headingLabelId = 'create-issue-sidebar-projects-section-heading'
  const sectionHeader = readonly ? (
    <ReadonlyProjectsSectionHeader />
  ) : (
    <ProjectPicker
      pickerId={'create-issue-projects-picker'}
      owner={owner}
      repo={repo}
      selectedProjects={projects}
      readonly={readonly}
      onSave={onSelectionChange}
      anchorElement={props => <ProjectsSectionHeader {...props} id={headingLabelId} />}
      includeClassicProjects={includeClassicProjects}
      {...sharedConfigProps}
    />
  )

  const UnavailableProjectSection = (
    <Section
      sectionHeader={<ReadonlySectionHeader title="Projects are currently unavailable" />}
      emptyText="Please try again later"
    />
  )

  return (
    <ErrorBoundary fallback={UnavailableProjectSection}>
      <ProjectsSection sectionHeader={sectionHeader} hasItems={projects.length > 0}>
        {projects.length > 0 && (
          <ActionList aria-labelledby={headingLabelId} sx={{py: 0}} variant="full">
            {projects.map(project => (
              <ActionList.LinkItem key={project.id} href={project.url} sx={{wordBreak: 'break-word'}}>
                {project.title}
              </ActionList.LinkItem>
            ))}
          </ActionList>
        )}
      </ProjectsSection>
    </ErrorBoundary>
  )
}

type EditIssueProjectsSectionProps = {
  issueOrPullRequest: ProjectsSectionFragment$key
  selectedProjectId?: string
  allowedProjectOwner?: string
  onIssueUpdate?: () => void
  singleKeyShortcutsEnabled: boolean
  insideSidePanel?: boolean
}

type Project = ProjectPickerProject$data | ProjectPickerClassicProject$data

const projectSectionFragment = graphql`
  fragment ProjectsSectionFragment on IssueOrPullRequest
  @argumentDefinitions(allowedOwner: {type: "String", defaultValue: null}) {
    ... on Issue {
      number
      repository {
        name
        owner {
          login
        }
        isArchived
      }
      id
      projectItemsNext(first: 10, allowedOwner: $allowedOwner)
        @required(action: THROW)
        @connection(key: "ProjectSection_projectItemsNext") {
        edges {
          node {
            id
            ...ProjectItemSection
            project {
              ...ProjectPickerProject
              closed
              title
              id
            }
          }
        }
      }
      projectCards(first: 10) @connection(key: "ProjectSection_projectCards") {
        edges {
          node {
            id
            ...ClassicProjectItem
            project {
              id
              closed
              ...ProjectPickerClassicProject
            }
          }
        }
      }
      viewerCanUpdateMetadata
    }
    ... on PullRequest {
      number
      repository {
        name
        owner {
          login
        }
        isArchived
      }
      id
      projectItemsNext(first: 10, allowedOwner: $allowedOwner)
        @required(action: THROW)
        @connection(key: "ProjectSection_projectItemsNext") {
        edges {
          node {
            id
            ...ProjectItemSection
            project {
              closed
              ...ProjectPickerProject
              title
              id
            }
          }
        }
      }
      projectCards(first: 10) @connection(key: "ProjectSection_projectCards") {
        edges {
          node {
            id
            ...ClassicProjectItem
            project {
              id
              closed
              ...ProjectPickerClassicProject
            }
          }
        }
      }
      viewerCanUpdate
    }
  }
`

export function EditIssueProjectsSection({
  issueOrPullRequest,
  onIssueUpdate,
  singleKeyShortcutsEnabled,
  selectedProjectId,
  allowedProjectOwner,
  insideSidePanel,
}: EditIssueProjectsSectionProps) {
  const {addToast} = useToastContext()
  const projectsSectionData = useFragment(projectSectionFragment, issueOrPullRequest)
  const includeClassicProjects = useShouldIncludeClassicProjects()

  const projectItems = (projectsSectionData.projectItemsNext?.edges ?? [])
    .flatMap(edge => (edge?.node ? edge?.node : []))
    .filter(projectItem => projectItem.project.closed !== true)

  const classicProjectItems = useMemo(
    () =>
      includeClassicProjects
        ? (projectsSectionData.projectCards?.edges ?? [])
            .flatMap(edge => (edge?.node ? edge?.node : []))
            .filter(projectItem => projectItem.project.closed !== true)
        : [],
    [projectsSectionData.projectCards, includeClassicProjects],
  )

  const closedProjectItems = (projectsSectionData.projectItemsNext?.edges ?? [])
    .flatMap(edge => (edge?.node ? edge?.node : []))
    .filter(projectItem => projectItem.project.closed === true)

  const classicClosedProjectItems = includeClassicProjects
    ? (projectsSectionData.projectCards?.edges ?? [])
        .flatMap(edge => (edge?.node ? edge?.node : []))
        .filter(projectItem => projectItem.project.closed === true)
    : []

  const [showClosedProjects, setShowClosedProjects] = useState(false)

  const {viewerCanUpdateMetadata, viewerCanUpdate, repository} = projectsSectionData

  // This can be consolidated once viewerCanUpdateMetadata is implemented in the pull_request model
  const readonly = !(viewerCanUpdateMetadata || viewerCanUpdate) || repository?.isArchived

  const hasClassicProjectItems = classicProjectItems.length > 0 || classicClosedProjectItems.length > 0

  const issueId = projectsSectionData.id || ''
  const hasProjectItems = projectItems.length > 0 || closedProjectItems.length > 0 || hasClassicProjectItems

  const connectionId = ConnectionHandler.getConnectionID(
    issueId, // passed as input to the mutation/subscription
    'ProjectSection_projectItemsNext',
    {
      allowedOwner: allowedProjectOwner,
    },
  )

  const classicConnectionId = ConnectionHandler.getConnectionID(
    issueId, // passed as input to the mutation/subscription
    'ProjectSection_projectCards',
    {
      allowedOwner: allowedProjectOwner,
    },
  )

  const environment = useRelayEnvironment()
  const saveProjects = useCallback(
    (selectedProjects: Project[]) => {
      const projectsToAdd = selectedProjects.filter(
        project => !projectItems.some(p => p.project.id === project.id) && project.__typename === 'ProjectV2',
      )
      const classicProjectsToAdd = selectedProjects.filter(
        project => !classicProjectItems.some(p => p.project.id === project.id) && project.__typename === 'Project',
      )

      const projectsToRemove = projectItems.filter(project => !selectedProjects.some(p => p.id === project.project.id))

      const classicProjectsToRemove = classicProjectItems.filter(
        projectItem => !selectedProjects.some(p => p.id === projectItem.project.id),
      )

      let hasError = false
      for (const project of projectsToAdd) {
        commitUpdateIssueProjectsMutation({
          environment,
          connectionId,
          projectId: project.id,
          issueId,
          onError: () => (hasError = true),
          onCompleted: onIssueUpdate,
        })
      }

      for (const project of classicProjectsToAdd) {
        if (project.__typename !== 'Project') return
        const columns = project.columns?.nodes
        if (!columns) return
        if (!columns[0]) return

        commitAddIssueToClassicProjectMutation({
          environment,
          connectionId: classicConnectionId,
          projectColumnId: columns[0]?.id,
          issueId,
          onError: () => (hasError = true),
          onCompleted: onIssueUpdate,
        })
      }

      for (const project of projectsToRemove) {
        commitDeleteIssueProjectsMutation({
          environment,
          connectionId,
          projectId: project.project.id,
          itemId: project.id,
          onError: () => (hasError = true),
          onCompleted: onIssueUpdate,
        })
      }

      for (const projectItem of classicProjectsToRemove) {
        commitDeleteIssueFromClassicProjectMutation({
          environment,
          connectionId: classicConnectionId,
          cardId: projectItem.id,
          onError: () => (hasError = true),
          onCompleted: onIssueUpdate,
        })
      }

      if (hasError) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: ERRORS.couldNotUpdateProjects,
        })
      }
    },
    [
      addToast,
      connectionId,
      environment,
      issueId,
      onIssueUpdate,
      projectItems,
      classicProjectItems,
      classicConnectionId,
    ],
  )

  const memexSelectedProjects = useMemo(
    () =>
      projectItems.map(projectItem =>
        // eslint-disable-next-line no-restricted-syntax
        readInlineData<ProjectPickerProject$key>(ProjectPickerProjectFragment, projectItem.project),
      ),
    [projectItems],
  )

  const classicSelectedProjects = useMemo(
    () =>
      classicProjectItems.map(projectItem =>
        // eslint-disable-next-line no-restricted-syntax
        readInlineData<ProjectPickerClassicProject$key>(ProjectPickerClassicProjectFragment, projectItem.project),
      ),
    [classicProjectItems],
  )

  const selectedProjects = useMemo(
    () => [...memexSelectedProjects, ...classicSelectedProjects],
    [classicSelectedProjects, memexSelectedProjects],
  )

  const totalClosedProjects = closedProjectItems.length + classicClosedProjectItems.length

  const sectionHeader = useMemo(() => {
    if (!projectsSectionData.repository || readonly) return <ReadonlyProjectsSectionHeader />

    return (
      <ProjectPicker
        pickerId={`edit-issue-projects-picker-${issueId}`}
        repo={projectsSectionData.repository.name}
        owner={projectsSectionData.repository.owner.login}
        shortcutEnabled={singleKeyShortcutsEnabled}
        selectedProjects={selectedProjects}
        firstSelectedProjectTitle={projectItems.length > 0 ? projectItems[0]!.project.title : ''}
        onSave={saveProjects}
        includeClassicProjects={includeClassicProjects}
        anchorElement={props => <ProjectsSectionHeader {...props} />}
        insidePortal={insideSidePanel}
      />
    )
  }, [
    issueId,
    projectItems,
    projectsSectionData.repository,
    readonly,
    saveProjects,
    selectedProjects,
    singleKeyShortcutsEnabled,
    insideSidePanel,
    includeClassicProjects,
  ])

  if (!projectsSectionData.repository || !projectsSectionData.number) return null

  return (
    <ProjectsSection sectionHeader={sectionHeader} hasItems={hasProjectItems}>
      <Box sx={{pl: 2, pr: 1, width: '100%'}}>
        {classicProjectItems.map(projectItem => (
          <ClassicProjectItem
            key={projectItem.id}
            onIssueUpdate={onIssueUpdate}
            projectItem={projectItem}
            issueId={projectItem.id}
          />
        ))}
        {projectItems.map(projectItem => (
          <ProjectItemSection
            key={projectItem.id}
            onIssueUpdate={onIssueUpdate}
            projectItem={projectItem}
            isOpen={selectedProjectId === projectItem.project.id}
          />
        ))}
        {totalClosedProjects > 0 && (
          <>
            <Button
              variant={'invisible'}
              trailingVisual={showClosedProjects ? ChevronUpIcon : ChevronDownIcon}
              sx={{
                color: 'fg.subtle',
                p: 0,
                fontSize: 0,
                '&:hover:not([disabled])': {background: 'transparent'},
              }}
              onClick={() => setShowClosedProjects(!showClosedProjects)}
              aria-label={LABELS.showClosedProjects}
            >
              {`${totalClosedProjects} closed project${totalClosedProjects > 1 ? 's' : ''}`}
            </Button>
            {showClosedProjects &&
              classicClosedProjectItems.map(projectItem => (
                <ClassicProjectItem
                  key={projectItem.id}
                  onIssueUpdate={onIssueUpdate}
                  projectItem={projectItem}
                  issueId={projectItem.id}
                />
              ))}
            {showClosedProjects &&
              closedProjectItems.map(projectItem => (
                <ProjectItemSection
                  key={projectItem.id}
                  onIssueUpdate={onIssueUpdate}
                  projectItem={projectItem}
                  isOpen={selectedProjectId === projectItem.project.id}
                />
              ))}
          </>
        )}
      </Box>
    </ProjectsSection>
  )
}
