import {useCallback, useEffect, useRef, useState} from 'react'

import {apiGetProjectMigration} from '../../api/memex/api-get-project-migration'
import type {ProjectMigration} from '../../api/project-migration/contracts'
import {useHandleDataRefresh} from '../data-refresh/use-handle-data-refresh'
import {useMemexItems} from '../memex-items/use-memex-items'
import {migrationStatusToProgress} from './migration-progress'
import {useProjectMigration} from './use-project-migration'

const MIGRATION_STATUS = {
  ERROR: 'error',
  COMPLETED: 'completed',
  COMPLETION_ACKNOWLEDGED: 'completion_acknowledged',
}

type MaybeProjectMigration = ProjectMigration | null | undefined

type UseProcessProjectMigrationStateHookReturnType = {
  processProjectMigrationState: (migration: ProjectMigration | null | undefined, liveUpdate?: boolean) => void
  processProjectMigrationOnPageVisibility: () => Promise<void>
  isMigrationComplete: () => boolean
  projectMigrationState: MaybeProjectMigration
  prevMigrationState: MaybeProjectMigration
}

export const useProcessProjectMigrationState = (): UseProcessProjectMigrationStateHookReturnType => {
  const [prevProjectMigration, setPreviousProjectMigration] = useState<MaybeProjectMigration>(null)
  const {projectMigration, setProjectMigration} = useProjectMigration()
  const handleDataRefresh = useHandleDataRefresh()
  const {items} = useMemexItems()

  const liveUpdateRef = useRef(false)

  const processProjectMigrationState = useCallback(
    (projectMigrationUpdate: ProjectMigration | null | undefined, liveUpdate = true) => {
      // only make an http request for the migration status if the socket is not already
      // connected and updating the local migration state.
      if (!liveUpdateRef.current && liveUpdate) {
        liveUpdateRef.current = true
      }

      // an empty update event was received -> ignore it
      if (!projectMigrationUpdate) {
        return
      }

      // we have no initial state -> use the received payload as our initial migration state
      if (!projectMigration) {
        return setProjectMigration(projectMigrationUpdate)
      }

      // as soon as the current project is in an error state, ignore any other progress events
      if (projectMigration.status === MIGRATION_STATUS.ERROR) {
        return
      }

      // whenever an error is reported from the backend, ensure it is displayed to the user
      if (projectMigrationUpdate.status === MIGRATION_STATUS.ERROR) {
        return setProjectMigration(projectMigrationUpdate)
      }

      // only update the migration state if the received update is further along on the progress bar
      // handles when updates are received out of order
      if (
        migrationStatusToProgress[projectMigration.status] < migrationStatusToProgress[projectMigrationUpdate.status]
      ) {
        setProjectMigration(projectMigrationUpdate)
      }
    },
    [projectMigration, setProjectMigration],
  )

  const processProjectMigrationOnPageVisibility = useCallback(async () => {
    if (
      !projectMigration ||
      liveUpdateRef.current ||
      projectMigration.status === MIGRATION_STATUS.COMPLETED ||
      projectMigration.status === MIGRATION_STATUS.COMPLETION_ACKNOWLEDGED
    ) {
      return
    }

    try {
      const migration = await apiGetProjectMigration()
      processProjectMigrationState(migration, false)
    } catch {
      // do nothing if this request does not succeed
    }
  }, [projectMigration, processProjectMigrationState])

  const isMigrationComplete = useCallback(() => {
    return prevProjectMigration?.status === MIGRATION_STATUS.COMPLETED
  }, [prevProjectMigration?.status])

  const processState = useCallback(async () => {
    if (!projectMigration) {
      return
    }

    const source = projectMigration.source_project
    const currentStatus = projectMigration.status

    if (currentStatus !== MIGRATION_STATUS.COMPLETED) {
      // migration is in progress
      setPreviousProjectMigration(projectMigration)
    } else if (!source?.empty && currentStatus === MIGRATION_STATUS.COMPLETED) {
      if (!items.length && prevProjectMigration?.status !== MIGRATION_STATUS.COMPLETED) {
        await handleDataRefresh()
      }

      // source project is not empty and migration has completed
      setPreviousProjectMigration(projectMigration)
    } else if (source?.empty && prevProjectMigration) {
      // source project is empty, we can mark migration as completed
      setPreviousProjectMigration({...prevProjectMigration, status: MIGRATION_STATUS.COMPLETED})
    }
  }, [handleDataRefresh, items.length, prevProjectMigration, projectMigration])

  useEffect(() => {
    processState()
  })

  return {
    isMigrationComplete,
    processProjectMigrationState,
    processProjectMigrationOnPageVisibility,
    prevMigrationState: prevProjectMigration,
    projectMigrationState: projectMigration,
  }
}
