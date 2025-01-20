import {testIdProps} from '@github-ui/test-id-props'
import {Box, Button, Heading, Link, Popover, ProgressBar} from '@primer/react'

import {apiAcknowledgeMigrationCompletion} from '../api/project-migration/api-acknowledge-completion'
import {apiCancelMigration} from '../api/project-migration/api-cancel-migration'
import {apiRetryMigration} from '../api/project-migration/api-retry-migration'
import type {ProjectMigration} from '../api/project-migration/contracts'
import {useProjectDetails} from '../state-providers/memex/use-project-details'
import {getProgressForStatus} from '../state-providers/project-migration/migration-progress'
import {useProcessProjectMigrationState} from '../state-providers/project-migration/use-process-project-migration-state'
import {useProjectMigration} from '../state-providers/project-migration/use-project-migration'
import {MigrationResources, ProjectMigrationResources} from '../strings'
import {MigrationOverlayDescription} from './project-migration-overlay-description'

function isMigrationCompleted(migration: ProjectMigration): boolean {
  return migration.status === 'completed' || migration.status === 'error'
}

function getMigrationOverlayHeader(migration: ProjectMigration, title: string) {
  if (migration.status === 'completed') {
    return ProjectMigrationResources.migrationCompleteMessage
  }

  if (migration.status === 'error') {
    return ProjectMigrationResources.somethingWentWrongMessage
  }

  return MigrationResources.migratingTitle(title)
}

const tryAgain = async () => {
  const response = await apiRetryMigration()

  if (response.redirectUrl) {
    window.location.assign(response.redirectUrl)
  }
}

const cancelMigration = async () => {
  const response = await apiCancelMigration()

  if (response.redirectUrl) {
    window.location.assign(response.redirectUrl)
  }
}

/** Container component for project migration overlay  */
export const ProjectMigrationOverlayView = () => {
  const {projectMigration, initialProjectMigrationStatus, setInitialProjectMigrationStatus} = useProjectMigration()
  const {prevMigrationState, isMigrationComplete} = useProcessProjectMigrationState()
  const {title} = useProjectDetails()

  if (!projectMigration || !prevMigrationState || initialProjectMigrationStatus === 'completion_acknowledged') {
    return null
  }

  const closeOverlay = async () => {
    setInitialProjectMigrationStatus('completion_acknowledged')
    apiAcknowledgeMigrationCompletion()
  }

  if (projectMigration.is_automated) {
    return <AutomatedProjectMigrationOverlay />
  }

  // if the project migration is in a completed status and the board has items,
  // then we set progress to completed or 100% otherwise we continue to render the previous state
  // until the board has been properly populated.
  const progress = isMigrationComplete()
    ? getProgressForStatus(projectMigration.status)
    : getProgressForStatus(prevMigrationState.status ?? 'pending')

  const header = getMigrationOverlayHeader(prevMigrationState, title)
  const progressBackground = projectMigration.status === 'error' ? 'danger.fg' : 'success.emphasis'
  const popoverHeight = prevMigrationState && isMigrationCompleted(prevMigrationState) ? '200px' : '125px'

  return (
    <Popover
      open
      caret="bottom"
      sx={{position: 'fixed', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
    >
      <Popover.Content
        sx={{
          paddingTop: '25px',
          width: '480px',
          height: popoverHeight,
          top: '20%',
          '&::before': {content: 'none !important'},
          '&::after': {content: 'none !important'},
        }}
        {...testIdProps('migration-popover')}
      >
        <Heading as="h2" sx={{fontSize: 3, mb: 2}}>
          {header}
        </Heading>
        <ProgressBar bg={progressBackground} progress={progress} sx={{marginBottom: '15px'}} />
        <MigrationOverlayDescription
          migration={projectMigration}
          cancelMigration={cancelMigration}
          tryAgain={tryAgain}
          closeOverlay={closeOverlay}
        />
      </Popover.Content>
    </Popover>
  )
}

const AutomatedProjectMigrationOverlay = () => {
  const {projectMigration, initialProjectMigrationStatus, setInitialProjectMigrationStatus} = useProjectMigration()
  const {prevMigrationState} = useProcessProjectMigrationState()
  const {title} = useProjectDetails()

  if (!projectMigration || !prevMigrationState || initialProjectMigrationStatus === 'completion_acknowledged') {
    return null
  }

  const closeOverlay = async () => {
    setInitialProjectMigrationStatus('completion_acknowledged')
    apiAcknowledgeMigrationCompletion()
  }

  const header = getMigrationOverlayHeader(prevMigrationState, title)
  const migrationCompleted = projectMigration.status === 'completed'

  return (
    <Popover
      open
      caret="bottom"
      sx={{position: 'fixed', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
    >
      <Popover.Content
        sx={{
          paddingTop: '25px',
          width: '480px',
          top: '20%',
          '&::before': {content: 'none !important'},
          '&::after': {content: 'none !important'},
        }}
        {...testIdProps('migration-popover')}
      >
        <Heading as="h2" sx={{fontSize: 3, mb: 2}}>
          {header}
        </Heading>

        <span {...testIdProps('automated-migration-status')}>
          {migrationCompleted
            ? ProjectMigrationResources.automatedMigrationCompleteMessage
            : ProjectMigrationResources.automatedMigrationInProgressMessage}{' '}
          <Link target="_blank" rel="noreferrer" href={ProjectMigrationResources.sunsetNoticeLink}>
            {ProjectMigrationResources.learnMore}
          </Link>
        </span>
        {migrationCompleted && (
          <Box sx={{mt: 3}}>
            <Button variant="primary" onClick={closeOverlay}>
              Done
            </Button>
          </Box>
        )}
      </Popover.Content>
    </Popover>
  )
}
