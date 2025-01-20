import {testIdProps} from '@github-ui/test-id-props'
import {AlertFillIcon, CheckIcon, XIcon} from '@primer/octicons-react'
import {Box, Button, Link, Octicon, Spinner} from '@primer/react'

import type {ProjectMigration} from '../api/project-migration/contracts'
import {ProjectMigrationResources} from '../strings'

interface MigrationOverlayDescriptionProps {
  migration: ProjectMigration
}

interface MigrationOverlayCompletedProps extends MigrationOverlayDescriptionProps {
  closeOverlay?(): void
}

interface MigrationOverlayErrorProps extends MigrationOverlayDescriptionProps {
  cancelMigration?(): Promise<void>
  tryAgain?(): Promise<void>
}

type MigrationOverlayDescriptionType = MigrationOverlayDescriptionProps &
  MigrationOverlayCompletedProps &
  MigrationOverlayErrorProps

const getStatusMessageFromMigration = (migration: ProjectMigration): string => {
  if (migration.status === 'completion_acknowledged' || migration.status === 'completed') {
    return ''
  }

  return ProjectMigrationResources.statuses[migration.status]
}

const MigrationOverlayCompleted: React.FC<MigrationOverlayCompletedProps> = ({migration, closeOverlay}) => {
  return (
    <div>
      <Box sx={{display: 'flex'}}>
        <Box sx={{justifyContent: 'space-around'}}>
          {migration.source_project?.closed ? (
            <Octicon icon={CheckIcon} sx={{color: 'success.fg'}} />
          ) : (
            <Octicon icon={AlertFillIcon} sx={{color: 'attention.fg'}} />
          )}
        </Box>

        <Box sx={{ml: 1}}>
          <span {...testIdProps('migration-status')}>
            {migration.source_project?.closed ? (
              <>
                {'• '}
                <Link target="_blank" rel="noreferrer" href={migration.source_project?.path}>
                  {ProjectMigrationResources.yourClassicProject}
                </Link>
                {` ${ProjectMigrationResources.completedAndClosed1}`}
                <br />
                {`• ${ProjectMigrationResources.completedAndClosed2}`}
              </>
            ) : (
              <>
                <Link target="_blank" rel="noreferrer" href={migration.source_project?.path}>
                  {ProjectMigrationResources.yourClassicProject}
                </Link>
                {` ${ProjectMigrationResources.completedAndStillOpen}`}
              </>
            )}
          </span>
        </Box>
      </Box>
      <Box sx={{mt: 3, display: 'flex'}}>
        <Button variant="primary" onClick={closeOverlay}>
          Done
        </Button>
      </Box>
    </div>
  )
}

const MigrationOverlayError: React.FC<MigrationOverlayErrorProps> = ({migration, cancelMigration, tryAgain}) => {
  return (
    <div>
      <Box sx={{display: 'flex'}}>
        <Box sx={{justifyContent: 'space-around'}}>
          <Octicon icon={XIcon} sx={{color: 'danger.fg'}} />
        </Box>

        <Box {...testIdProps('migration-status')} sx={{ml: 1}}>
          {getStatusMessageFromMigration(migration)}
        </Box>
      </Box>

      <Box sx={{mt: 3, display: 'flex', flexDirection: 'row-reverse'}}>
        <Button variant="primary" onClick={tryAgain} sx={{ml: 2}}>
          Try again
        </Button>
        <Button onClick={cancelMigration}>Cancel</Button>
      </Box>
    </div>
  )
}

export const MigrationOverlayDescription: React.FC<MigrationOverlayDescriptionType> = ({
  migration,
  closeOverlay,
  ...errorProps
}) => {
  if (migration.status === 'completed') {
    return <MigrationOverlayCompleted migration={migration} closeOverlay={closeOverlay} />
  }

  if (migration.status === 'error') {
    return <MigrationOverlayError migration={migration} {...errorProps} />
  }

  return (
    <Box sx={{display: 'flex'}}>
      <Box sx={{justifyContent: 'space-around', p: 1}}>
        <Spinner size="small" />
      </Box>

      <Box {...testIdProps('migration-status')} sx={{ml: 1, mt: '3px'}}>
        {getStatusMessageFromMigration(migration)}
      </Box>
    </Box>
  )
}
