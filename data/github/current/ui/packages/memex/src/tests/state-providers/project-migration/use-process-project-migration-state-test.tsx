import {act, renderHook, waitFor} from '@testing-library/react'

import type {MigrationStatus, ProjectMigration} from '../../../client/api/project-migration/contracts'
import {useHandleDataRefresh} from '../../../client/state-providers/data-refresh/use-handle-data-refresh'
import {useProcessProjectMigrationState} from '../../../client/state-providers/project-migration/use-process-project-migration-state'
import {DefaultViews} from '../../../mocks/mock-data'
import {seedJSONIsland} from '../../../mocks/server/mock-server'
import {stubGetColumnsFn} from '../../mocks/api/columns'
import {stubGetAllMemexData, stubGetProjectMigration} from '../../mocks/api/memex'
import {asMockHook} from '../../mocks/stub-utilities'
import {createProjectMigrationStateProviderWrapper} from './create-wrapper'

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

describe('useProcessProjectMigrationState', () => {
  beforeEach(() => {
    seedJSONIsland('memex-views', DefaultViews)
    stubGetColumnsFn([])
    stubGetAllMemexData()
  })

  it('should have an initial state from JSON island if the project migration exists', () => {
    stubGetAllMemexData()

    const EXPECTED_STATUS = 'in_progress_default_view'
    seedJSONIsland('memex-project-migration', createProjectMigrationMock(EXPECTED_STATUS))

    const {result} = renderHook(useProcessProjectMigrationState, {
      wrapper: createProjectMigrationStateProviderWrapper(),
    })

    expect(result.current.projectMigrationState?.status).toBe(EXPECTED_STATUS)
  })

  it('should synchornize the previous state with the next state', () => {
    stubGetAllMemexData()

    const {result, rerender} = renderHook(useProcessProjectMigrationState, {
      wrapper: createProjectMigrationStateProviderWrapper(),
    })

    expect(result.current.prevMigrationState).toBeNull()

    act(() => result.current.processProjectMigrationState(createProjectMigrationMock('in_progress_workflows')))

    rerender()
    expect(result.current.prevMigrationState?.status).toBe('in_progress_workflows')
  })

  it('should do a data refresh if the migration completed and there are no items for the target project', async () => {
    const handleDataRefresh = jest.fn()
    asMockHook(useHandleDataRefresh).mockReturnValue(handleDataRefresh)

    stubGetAllMemexData({memexProjectItems: []})

    const {result} = renderHook(useProcessProjectMigrationState, {
      wrapper: createProjectMigrationStateProviderWrapper([]),
    })

    act(() => result.current.processProjectMigrationState(createProjectMigrationMock('completed')))

    await waitFor(() => result.current.prevMigrationState?.status === 'completed')

    expect(handleDataRefresh).toHaveBeenCalledTimes(1)
  })

  it('should "NOT" do a data refresh if the migration completed and the target project already has items', () => {
    const handleDataRefresh = jest.fn()
    asMockHook(useHandleDataRefresh).mockReturnValue(handleDataRefresh)

    stubGetAllMemexData()

    // the state provider wrapper initializes the state with items by default
    const {result, rerender} = renderHook(useProcessProjectMigrationState, {
      wrapper: createProjectMigrationStateProviderWrapper(),
    })

    for (let i = 0; i < 5; ++i) {
      act(() => result.current.processProjectMigrationState(createProjectMigrationMock('completed')))
      rerender()
    }

    expect(handleDataRefresh).not.toHaveBeenCalled()
  })

  it('should "NOT" do a data refresh if the migration completed and the source project is empty', () => {
    const handleDataRefresh = jest.fn()
    asMockHook(useHandleDataRefresh).mockReturnValue(handleDataRefresh)

    stubGetAllMemexData()

    // the state provider wrapper initializes the state with items by default
    const {result, rerender} = renderHook(useProcessProjectMigrationState, {
      wrapper: createProjectMigrationStateProviderWrapper(),
    })

    for (let i = 0; i < 5; ++i) {
      act(() => result.current.processProjectMigrationState(createProjectMigrationMock('completed', {empty: true})))
      rerender()
    }

    expect(handleDataRefresh).not.toHaveBeenCalled()
  })

  describe('processProjectMigrationOnPageVisibility', () => {
    it('should not attempt to GET the project migration if it does not exists', async () => {
      const getProjectMigrationStub = stubGetProjectMigration(createProjectMigrationMock('completed'))

      const {result} = renderHook(useProcessProjectMigrationState, {
        wrapper: createProjectMigrationStateProviderWrapper(),
      })

      await result.current.processProjectMigrationOnPageVisibility()

      expect(getProjectMigrationStub).not.toHaveBeenCalled()
    })

    it('should not attempt to GET the project migration if it already is in a "completed" state', async () => {
      seedJSONIsland('memex-project-migration', createProjectMigrationMock('completed'))

      stubGetAllMemexData({})
      const getProjectMigrationStub = stubGetProjectMigration(createProjectMigrationMock('completed'))

      const {result} = renderHook(useProcessProjectMigrationState, {
        wrapper: createProjectMigrationStateProviderWrapper(),
      })

      await result.current.processProjectMigrationOnPageVisibility()

      expect(getProjectMigrationStub).not.toHaveBeenCalled()
    })

    it('should not attempt to GET the project migration if it already is in a "completion_acknowledged" state', async () => {
      const migration = createProjectMigrationMock('completion_acknowledged')
      seedJSONIsland('memex-project-migration', migration)

      stubGetAllMemexData({})
      const getProjectMigrationStub = stubGetProjectMigration(migration)

      const {result} = renderHook(useProcessProjectMigrationState, {
        wrapper: createProjectMigrationStateProviderWrapper(),
      })

      await result.current.processProjectMigrationOnPageVisibility()

      expect(getProjectMigrationStub).not.toHaveBeenCalled()
    })

    it('should not attempt to GET the project migration if the live update is updating the state', async () => {
      stubGetAllMemexData({})
      const getProjectMigrationStub = stubGetProjectMigration(createProjectMigrationMock('completed'))

      const {result} = renderHook(useProcessProjectMigrationState, {
        wrapper: createProjectMigrationStateProviderWrapper(),
      })

      // emulating live udpate
      act(() => result.current.processProjectMigrationState(createProjectMigrationMock('in_progress_workflows')))

      // update on page visibility
      await result.current.processProjectMigrationOnPageVisibility()

      expect(getProjectMigrationStub).not.toHaveBeenCalled()
      expect(result.current.projectMigrationState?.status).toBe('in_progress_workflows')
    })

    it('should attempt to GET the project migration if it is not in a completed state', async () => {
      seedJSONIsland('memex-project-migration', createProjectMigrationMock('in_progress_project_details'))

      stubGetAllMemexData({})
      const getProjectMigrationStub = stubGetProjectMigration(createProjectMigrationMock('completed'))

      const {result} = renderHook(useProcessProjectMigrationState, {
        wrapper: createProjectMigrationStateProviderWrapper(),
      })

      expect(result.current.projectMigrationState!.status).not.toBe('completed')

      await act(() => result.current.processProjectMigrationOnPageVisibility())

      expect(getProjectMigrationStub).toHaveBeenCalled()
      expect(result.current.projectMigrationState!.status).toBe('completed')
    })
  })

  describe('processProjectMigrationState', () => {
    it('should not set state if called with an undefined project migration payload', () => {
      const EXPECTED_STATUS = 'in_progress_project_details'
      seedJSONIsland('memex-project-migration', createProjectMigrationMock(EXPECTED_STATUS))

      const {result} = renderHook(useProcessProjectMigrationState, {
        wrapper: createProjectMigrationStateProviderWrapper(),
      })

      result.current.processProjectMigrationState(undefined)

      expect(result.current.projectMigrationState!.status).not.toBeFalsy()
      expect(result.current.projectMigrationState!.status).toBe(EXPECTED_STATUS)
    })

    it('should set state if there is no initial project migration', () => {
      const {result} = renderHook(useProcessProjectMigrationState, {
        wrapper: createProjectMigrationStateProviderWrapper(),
      })

      act(() => result.current.processProjectMigrationState(createProjectMigrationMock('completed')))

      expect(result.current.projectMigrationState!.status).toBe('completed')
    })

    it('should not set state if the migration is already in an error state', () => {
      const EXPECTED_STATUS = 'error'
      seedJSONIsland('memex-project-migration', createProjectMigrationMock(EXPECTED_STATUS))

      const {result} = renderHook(useProcessProjectMigrationState, {
        wrapper: createProjectMigrationStateProviderWrapper(),
      })

      act(() => result.current.processProjectMigrationState(createProjectMigrationMock('in_progress_project_details')))

      expect(result.current.projectMigrationState!.status).toBe(EXPECTED_STATUS)
    })

    it('should set state to an error value if the migration was in a prior in progress state', () => {
      seedJSONIsland('memex-project-migration', createProjectMigrationMock('in_progress_default_view'))

      const {result} = renderHook(useProcessProjectMigrationState, {
        wrapper: createProjectMigrationStateProviderWrapper(),
      })

      act(() => result.current.processProjectMigrationState(createProjectMigrationMock('error')))

      expect(result.current.projectMigrationState!.status).toBe('error')

      act(() => result.current.processProjectMigrationState(createProjectMigrationMock('in_progress_permissions')))

      expect(result.current.projectMigrationState!.status).toBe('error')
    })
  })
})
