import {testIdProps} from '@github-ui/test-id-props'
import {StopIcon} from '@primer/octicons-react'
import {Box, Flash, Octicon, PageLayout, Text} from '@primer/react'
import {useCallback, useEffect, useState} from 'react'

import {getInitialState} from '../../helpers/initial-state'
import {Link} from '../../router'
import {useProjectRouteParams} from '../../router/use-project-route-params'
import {PROJECT_ARCHIVE_ROUTE} from '../../routes'
import {useProjectNumber} from '../../state-providers/memex/use-project-number'
import {useArchiveStatus} from '../../state-providers/workflows/use-archive-status'
import {useWorkflows} from '../../state-providers/workflows/use-workflows'
import {NoSuggestedRepos} from '../side-panel/item-suggestions-list'
import {AutomationGraphView} from './automation-graph-view'
import {AutomationSideNav} from './automation-side-nav'
import {CreateNewWorkflowDialog} from './create-new-workflow-dialog'

export const AutomationView = () => {
  const [noRepoSuggestions, setNoRepoSuggestions] = useState(false)
  const {activeWorkflow} = useWorkflows()
  const {shouldDisableArchiveForActiveWorkflow, setArchiveStatus} = useArchiveStatus()
  const [startInEditMode, setStartInEditMode] = useState(false)

  useEffect(() => {
    setArchiveStatus()

    return () => {
      setArchiveStatus.cancel()
    }
  }, [setArchiveStatus])

  useEffect(() => {
    setNoRepoSuggestions(false)
    setStartInEditMode(false)
  }, [activeWorkflow])

  const onNoSuggestedRepositories = useCallback(() => {
    setNoRepoSuggestions(true)
  }, [setNoRepoSuggestions])

  const {projectOwner, isOrganization} = getInitialState()
  const owner = projectOwner?.name?.toLowerCase()

  return (
    <PageLayout
      containerWidth="full"
      columnGap="none"
      padding="none"
      sx={{height: '100%', [`& > *`]: {minHeight: '100%'}}}
    >
      {activeWorkflow ? (
        <>
          <PageLayout.Pane
            position="start"
            sx={{
              padding: [3, null, null, 4],
              borderRight: '1px solid',
              borderColor: 'border.subtle',
              height: [null, null, '100%'],
            }}
          >
            <AutomationSideNav activeWorkflow={activeWorkflow} />
          </PageLayout.Pane>
          <PageLayout.Content width="full" padding="none">
            {shouldDisableArchiveForActiveWorkflow ? <FullArchiveWarning /> : null}
            {noRepoSuggestions ? (
              <NoSuggestedRepos isOrganization={isOrganization} owner={owner} />
            ) : (
              <AutomationGraphView
                // set by the create new workflow dialog
                startInEditMode={startInEditMode}
                workflow={activeWorkflow}
                key={activeWorkflow.id}
                onNoSuggestedRepositories={onNoSuggestedRepositories}
              />
            )}
          </PageLayout.Content>
          <CreateNewWorkflowDialog setStartInEditMode={setStartInEditMode} />
        </>
      ) : (
        <div>No workflows</div>
      )}
    </PageLayout>
  )
}

const FullArchiveWarning = () => {
  const {projectNumber} = useProjectNumber()
  const projectRouteParams = useProjectRouteParams()
  const archivePageLink = projectNumber ? PROJECT_ARCHIVE_ROUTE.generatePath(projectRouteParams) : ''

  return (
    <Flash variant="danger" sx={{mb: 3}} {...testIdProps('archive-full-warning')}>
      <Box sx={{display: 'flex', alignItems: 'center'}}>
        <Octicon icon={StopIcon} size={14} sx={{color: 'danger.fg'}} />
        <Text sx={{ml: '8px'}}>
          This workflow is disabled because the Archive is full. Remove items from{' '}
          <Link to={archivePageLink}>the Archive</Link> to enable this workflow.
        </Text>
      </Box>
    </Flash>
  )
}
