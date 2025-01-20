import {renderHook, waitFor} from '@testing-library/react'

import type {User} from '../../../client/api/common-contracts'
import type {Memex} from '../../../client/api/memex/contracts'
import type {MemexWorkflowConfiguration, MemexWorkflowPersisted} from '../../../client/api/workflows/contracts'
import {useArchiveStatus} from '../../../client/state-providers/workflows/use-archive-status'
import {DefaultMemex} from '../../../mocks/data/memexes'
import {
  autoArchiveItemsWorkflow,
  autoArchiveItemsWorkflowPersisted,
  DefaultWorkflowConfigurations,
  DefaultWorkflowsPersisted,
  MAX_ARCHIVED_ITEMS,
} from '../../../mocks/data/workflows'
import {DefaultColumns} from '../../../mocks/mock-data'
import {InitialItems} from '../../../stories/data-source'
import {createMockEnvironment} from '../../create-mock-environment'
import {
  createWrapperForWorkflowEditor,
  mockGetArchiveStatus,
  mockGetArchiveStatusError,
  type WrapperType,
} from './helpers'

let wrapper: WrapperType

describe('useArchiveStatus', () => {
  const setupTest = (
    initialServerData: {
      memex?: Memex
      workflows?: Array<MemexWorkflowPersisted>
      workflowConfigurations?: Array<MemexWorkflowConfiguration>
      loggedInUser?: Pick<User, 'id' | 'login' | 'avatarUrl' | 'global_relay_id' | 'name' | 'isSpammy'>
      disableAutoArchive?: boolean
    } = {},
  ) => {
    const defaultLoggedInUser = {
      id: 1,
      login: 'test-user',
      name: 'Test User',
      avatarUrl: 'https://github.com/test-user.png',
      global_relay_id: 'MDQ6VXNl',
      isSpammy: false,
    }
    createMockEnvironment({
      jsonIslandData: {
        'memex-columns-data': DefaultColumns,
        'memex-data': 'memex' in initialServerData ? initialServerData.memex : DefaultMemex,
        'memex-workflows-data': initialServerData.workflows || DefaultWorkflowsPersisted,
        'memex-workflow-configurations-data': initialServerData.workflowConfigurations || DefaultWorkflowConfigurations,
        'logged-in-user': 'loggedInUser' in initialServerData ? initialServerData.loggedInUser : defaultLoggedInUser,
        'memex-items-data': InitialItems,
      },
    })

    wrapper = createWrapperForWorkflowEditor()
  }

  it('sets isArchiveFull to false when archive is not full', async () => {
    setupTest()
    const getArchiveStatusMock = mockGetArchiveStatus({
      totalCount: 0,
      isArchiveFull: false,
      archiveLimit: MAX_ARCHIVED_ITEMS,
    })

    const {result} = renderHook(() => useArchiveStatus(), {wrapper})

    await waitFor(() => expect(getArchiveStatusMock).toHaveBeenCalledTimes(1))
    expect(result.current.isArchiveFull).toBe(false)
  })

  it('sets isArchiveFull to true when archive contains more than or equal to 10k items', async () => {
    setupTest()
    const getArchiveStatusMock = mockGetArchiveStatus()

    const {result} = renderHook(() => useArchiveStatus(), {wrapper})

    await waitFor(() => expect(getArchiveStatusMock).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(result.current.isArchiveFull).toBe(true))
  })

  it('sets shouldDisableArchiveForActiveWorkflow to true when archive is full and active workflow involves archiving', async () => {
    setupTest({
      workflows: [autoArchiveItemsWorkflowPersisted],
      workflowConfigurations: [autoArchiveItemsWorkflow],
    })
    const getArchiveStatusMock = mockGetArchiveStatus()

    const {result} = renderHook(() => useArchiveStatus(), {wrapper})

    await waitFor(() => expect(getArchiveStatusMock).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(result.current.shouldDisableArchiveForActiveWorkflow).toBe(true))
  })

  it('does not show the archive status to user without write permission', async () => {
    setupTest({
      workflows: [autoArchiveItemsWorkflowPersisted],
      workflowConfigurations: [autoArchiveItemsWorkflow],
    })
    const getArchiveStatusMock = mockGetArchiveStatusError()

    const {result} = renderHook(() => useArchiveStatus(), {wrapper})

    await waitFor(() => expect(getArchiveStatusMock).toHaveBeenCalledTimes(1))
    expect(result.current.isArchiveFull).toBe(false)
  })

  it('does not make a request to the get archive status endpoint if user is anonymous', () => {
    setupTest({
      workflows: [autoArchiveItemsWorkflowPersisted],
      workflowConfigurations: [autoArchiveItemsWorkflow],
      loggedInUser: undefined,
    })
    const getArchiveStatusMock = mockGetArchiveStatus()

    const {result} = renderHook(() => useArchiveStatus(), {wrapper})

    expect(getArchiveStatusMock).not.toHaveBeenCalled()
    expect(result.current.isArchiveFull).toBe(false)
  })
})
