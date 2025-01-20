import {ProjectPicker, type Project} from '@github-ui/item-picker/ProjectPicker'
import {ProjectIcon, TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, Button} from '@primer/react'
import type React from 'react'
import {useCallback, useMemo} from 'react'
import {getTokensByType, replaceTokensDifferentially, searchUrl} from '../../../utils/urls'
import type {FilterBarPickerProps} from './ListItemsHeaderWithoutBulkActions'
import {useQueryContext} from '../../../contexts/QueryContext'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import type {AppPayload} from '../../../types/app-payload'
import {LABELS} from '../../../constants/labels'

export function ListProjectFilter({repo, applySectionFilter, nested}: FilterBarPickerProps) {
  const {activeSearchQuery, currentViewId} = useQueryContext()
  const {current_user_settings} = useAppPayload<AppPayload>()

  const currentProjectsTokens = useMemo(() => getTokensByType(activeSearchQuery, 'project'), [activeSearchQuery])

  const onSelectionChanged = useCallback(
    (selectedProjects: Project[]) => {
      const projects = selectedProjects.map(project => `${repo.owner}/${project.number}`)
      const newQuery = replaceTokensDifferentially(activeSearchQuery, projects, 'project')
      if (newQuery !== activeSearchQuery) {
        const url = searchUrl({viewId: currentViewId, query: newQuery})
        applySectionFilter(newQuery, url)
      }
    },
    [activeSearchQuery, applySectionFilter, currentViewId, repo.owner],
  )

  /**
   *  the approach used here has a limitation described in https://github.com/github/issues/issues/10329
   * if the search bar has a project that is not in the projects that are fetch on first render, the pre-selection won't work
   */

  const currentSelectedProjects = useCallback(
    (projects: Project[]) => {
      const selectedProjects: Project[] = []
      currentProjectsTokens?.map(token => {
        const foundProject = projects.find(project => {
          const [repoName, number] = token.split('/')
          return project.url.endsWith(`/${repoName}/projects/${number}`)
        })
        foundProject && foundProject.id && !selectedProjects.includes(foundProject)
          ? selectedProjects.push(foundProject)
          : null
      })

      return selectedProjects
    },
    [currentProjectsTokens],
  )

  return (
    <ProjectPicker
      pickerId="list-project-filter"
      anchorElement={nested ? NestedProjectsAnchor : ProjectsAnchor}
      repo={repo.name}
      owner={repo.owner}
      shortcutEnabled={current_user_settings?.use_single_key_shortcut || false}
      onSave={onSelectionChanged}
      selectedProjects={[]}
      firstSelectedProjectTitle={''}
      getSelectedProjects={currentSelectedProjects}
      title={LABELS.filters.projectsLabel}
    />
  )
}

function NestedProjectsAnchor(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <ActionList.Item {...props} aria-label={LABELS.filters.projectsLabel} role="menuitem">
      <ActionList.LeadingVisual>
        <ProjectIcon />
      </ActionList.LeadingVisual>
      {LABELS.filters.projects}...
    </ActionList.Item>
  )
}

function ProjectsAnchor(props: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      variant="invisible"
      sx={{
        color: 'fg.muted',
        width: 'fit-content',
      }}
      data-testid="projects-anchor-button"
      trailingVisual={TriangleDownIcon}
      aria-label={LABELS.filters.projectsLabel}
      {...props}
    >
      {LABELS.filters.projects}
    </Button>
  )
}
