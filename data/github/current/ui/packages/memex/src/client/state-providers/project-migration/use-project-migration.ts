import {useContext} from 'react'

import {ProjectMigrationContext} from '../project-migration/project-migration-state-provider'
/**
 * This hooks exposes a callback to update the project migration data from live updates
 */

export const useProjectMigration = () => {
  const context = useContext(ProjectMigrationContext)

  if (!context) {
    throw new Error('useProjectMigration must be used within a ProjectMigrationStateProvider')
  }

  return context
}
