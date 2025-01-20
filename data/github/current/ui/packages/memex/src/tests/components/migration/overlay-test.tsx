import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type {MigrationStatus, ProjectMigration} from '../../../client/api/project-migration/contracts'
import {ProjectMigrationOverlayView} from '../../../client/components/project-migration-overlay-view'
import {DefaultViews} from '../../../mocks/mock-data'
import {seedJSONIsland} from '../../../mocks/server/mock-server'
import {stubGetColumnsFn} from '../../mocks/api/columns'
import {stubGetAllMemexData} from '../../mocks/api/memex'
import {stubAcknowledgeCompletion} from '../../mocks/api/migration'
import {createProjectMigrationStateProviderWrapper} from '../../state-providers/project-migration/create-wrapper'

function createProjectMigrationMock(
  status: MigrationStatus,
  {empty}: {empty: boolean} = {empty: false},
): ProjectMigration {
  return {
    id: 93,
    source_project_id: 94,
    target_memex_project_id: 94,
    status,
    requester_id: 2,
    last_retried_at: null,
    last_migrated_project_item_id: null,
    completed_at: null,
    created_at: '2022-06-13T15:22:44.840-07:00',
    updated_at: '2022-06-13T15:22:44.960-07:00',
    source_project: {
      name: 'Test Project',
      closed: false,
      path: 'test-project',
      empty,
    },
    is_automated: false,
  }
}

jest.mock('../../../client/state-providers/data-refresh/use-handle-data-refresh')

describe('Project Migration Overlay', () => {
  beforeEach(() => {
    seedJSONIsland('memex-views', DefaultViews)
    stubGetColumnsFn([])
    stubGetAllMemexData()
  })

  it('should display overlay if migration status is completed and not acknowledged', async () => {
    const EXPECTED_STATUS = 'completed'
    seedJSONIsland('memex-project-migration', createProjectMigrationMock(EXPECTED_STATUS))

    render(<ProjectMigrationOverlayView />, {
      wrapper: createProjectMigrationStateProviderWrapper(),
    })

    const doneButton = await screen.findByRole('button', {name: 'Done'})
    expect(doneButton).toBeTruthy()
  })

  it('should "NOT" display overlay if migration status is completed and is acknowledged', () => {
    const EXPECTED_STATUS = 'completion_acknowledged'
    seedJSONIsland('memex-project-migration', createProjectMigrationMock(EXPECTED_STATUS))

    render(<ProjectMigrationOverlayView />, {
      wrapper: createProjectMigrationStateProviderWrapper(),
    })

    const doneButton = screen.queryByRole('button', {name: 'Done'})
    expect(doneButton).toBeNull()
  })

  it('should submit POST call when acknowledged', async () => {
    const mockAcknowledgeCompletion = stubAcknowledgeCompletion(createProjectMigrationMock('completion_acknowledged'))

    const EXPECTED_STATUS = 'completed'
    seedJSONIsland('memex-project-migration', createProjectMigrationMock(EXPECTED_STATUS))

    const user = userEvent.setup()
    render(<ProjectMigrationOverlayView />, {
      wrapper: createProjectMigrationStateProviderWrapper(),
    })

    const doneButton = await screen.findByRole('button', {name: 'Done'})

    await user.click(doneButton)
    expect(mockAcknowledgeCompletion).toHaveBeenCalledTimes(1)
  })
})
