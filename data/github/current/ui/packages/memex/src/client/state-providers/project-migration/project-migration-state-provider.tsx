import {createContext, memo, type SetStateAction, useMemo, useState} from 'react'

import type {MigrationStatus, ProjectMigration} from '../../api/project-migration/contracts'
import {fetchJSONIslandData} from '../../helpers/json-island'

type ProjectMigrationContextType = {
  projectMigration: ProjectMigration | null | undefined
  setProjectMigration: React.Dispatch<SetStateAction<ProjectMigration | undefined>>
  initialProjectMigrationStatus: MigrationStatus | null | undefined
  setInitialProjectMigrationStatus: React.Dispatch<SetStateAction<MigrationStatus | undefined>>
}

export const ProjectMigrationContext = createContext<ProjectMigrationContextType | null | undefined>(null)

export const ProjectMigrationStateProvider = memo(function ProjectMigrationStateProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const initialProjectMigrationData = fetchJSONIslandData('memex-project-migration')
  const [projectMigration, setProjectMigration] = useState(initialProjectMigrationData)
  const [initialProjectMigrationStatus, setInitialProjectMigrationStatus] = useState(
    initialProjectMigrationData?.status,
  )

  const contextValue = useMemo<ProjectMigrationContextType>(
    () => ({
      projectMigration,
      setProjectMigration,
      initialProjectMigrationStatus,
      setInitialProjectMigrationStatus,
    }),
    [projectMigration, initialProjectMigrationStatus],
  )

  return <ProjectMigrationContext.Provider value={contextValue}>{children}</ProjectMigrationContext.Provider>
})
