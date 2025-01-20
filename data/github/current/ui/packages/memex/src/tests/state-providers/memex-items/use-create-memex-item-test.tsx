import {act, renderHook} from '@testing-library/react'

import {SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import type {SingleSelectValue} from '../../../client/api/columns/contracts/single-select'
import {apiAddItem} from '../../../client/api/memex-items/api-add-item'
import type {MemexItemCreateData} from '../../../client/api/memex-items/contracts'
import {ItemType} from '../../../client/api/memex-items/item-type'
import type {MemexItemModel} from '../../../client/models/memex-item-model'
import type {ColumnsStableContextType} from '../../../client/state-providers/columns/columns-state-provider'
import {getMemexItemModelsFromQueryClient} from '../../../client/state-providers/memex-items/query-client-api/memex-items'
import {useCreateMemexItem} from '../../../client/state-providers/memex-items/use-create-memex-item'
import {DefaultClosedIssue, DefaultOpenIssue, DefaultOpenPullRequest} from '../../../mocks/memex-items'
import {stubResolvedApiResponse} from '../../mocks/api/memex'
import {createMockToastContainer} from '../../mocks/components/toast-container'
import {createMemexItemModel} from '../../mocks/models/memex-item-model'
import {createColumnsStableContext, stubAddLoadedFieldId} from '../../mocks/state-providers/columns-stable-context'
import {createTestQueryClient} from '../../test-app-wrapper'
import {createWrapperWithContexts} from '../../wrapper-utils'
import {defaultProjectDetails, existingProject, setProjectContext} from '../memex/helpers'

jest.mock('../../../client/api/memex-items/api-add-item')

describe('useCreateMemexItem', () => {
  it('should call the memex item client and sets items', async () => {
    const addItemStub = stubResolvedApiResponse(apiAddItem, {
      memexProjectItem: DefaultClosedIssue,
      memexProjectColumn: null,
    })

    const addLoadedFieldIdStub = stubAddLoadedFieldId()

    const queryClient = createTestQueryClient()
    const {result} = renderHook(useCreateMemexItem, {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
        ProjectNumber: existingProject(),
        ProjectDetails: defaultProjectDetails(),
        ColumnsStable: createColumnsStableContext({addLoadedFieldId: addLoadedFieldIdStub}),
        SetProject: setProjectContext(),
        ToastContainer: createMockToastContainer(),
      }),
    })

    const createData: MemexItemCreateData = {
      contentType: ItemType.DraftIssue,
      content: {
        title: 'Title',
      },
    }

    await act(async () => {
      const createdMemexItemModel = await result.current.createMemexItem(createData)

      expect(addItemStub).toHaveBeenCalledWith({
        memexProjectItem: createData,
      })

      const itemModelsAfterAdd = getMemexItemModelsFromQueryClient(queryClient)
      expect(itemModelsAfterAdd[0]).toEqual(createdMemexItemModel)
      expectAddLoadedFieldStubToBeCalledWithColumnData(addLoadedFieldIdStub, createdMemexItemModel)
    })
  })

  it('should strip columnValues from create data and make separate calls to update those column values', async () => {
    const addItemStub = stubResolvedApiResponse(apiAddItem, {
      memexProjectItem: DefaultClosedIssue,
      memexProjectColumn: null,
    })

    const queryClient = createTestQueryClient()
    const {result} = renderHook(useCreateMemexItem, {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
        ProjectNumber: existingProject(),
        ProjectDetails: defaultProjectDetails(),
        ColumnsStable: createColumnsStableContext({}),
        SetProject: setProjectContext(),
        ToastContainer: createMockToastContainer(),
      }),
    })

    const createDataWithoutColumnValues: MemexItemCreateData = {
      contentType: ItemType.DraftIssue,
      content: {
        title: 'Title',
      },
    }

    const createDataWithColumnValues: MemexItemCreateData = {
      ...createDataWithoutColumnValues,
      localColumnValues: [{memexProjectColumnId: SystemColumnId.Status, value: {id: 'abc'} as SingleSelectValue}],
    }

    await act(async () => {
      const createdMemexItemModel = await result.current.createMemexItem(createDataWithColumnValues)

      expect(addItemStub).toHaveBeenCalledWith({
        memexProjectItem: createDataWithoutColumnValues,
      })

      expect(createdMemexItemModel.columns[SystemColumnId.Status]!.id).toEqual('abc')
    })
  })

  it('calls context addItem and client addItem with correct index when previousItemId is ""', async () => {
    const itemModel1 = createMemexItemModel(DefaultOpenIssue)
    const itemModel2 = createMemexItemModel(DefaultOpenPullRequest)

    const queryClient = createTestQueryClient()
    const {result} = renderHook(useCreateMemexItem, {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient, memexItems: [itemModel1, itemModel2]},
        ProjectNumber: existingProject(),
        ProjectDetails: defaultProjectDetails(),
        ColumnsStable: createColumnsStableContext({}),
        SetProject: setProjectContext(),
        ToastContainer: createMockToastContainer(),
      }),
    })

    const createData: MemexItemCreateData = {
      contentType: ItemType.DraftIssue,
      content: {
        title: 'Title',
      },
      previousMemexProjectItemId: '',
    }

    await act(async () => {
      const createdMemexItemModel = await result.current.createMemexItem(createData)

      expect(createdMemexItemModel.getHtmlTitle()).toEqual(
        "This is the title for my closed issue. Now that I've closed it, the text is really and long and should elide!",
      )
    })
  })

  it('calls context addItem and client addItem with correct index when previousItemId is another id', async () => {
    const addItemStub = stubResolvedApiResponse(apiAddItem, {
      memexProjectItem: DefaultClosedIssue,
      memexProjectColumn: null,
    })

    const itemModel1 = createMemexItemModel(DefaultOpenIssue)
    const itemModel2 = createMemexItemModel(DefaultOpenPullRequest)

    const queryClient = createTestQueryClient()
    const {result} = renderHook(useCreateMemexItem, {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient, memexItems: [itemModel1, itemModel2]},
        ProjectNumber: existingProject(),
        ProjectDetails: defaultProjectDetails(),
        ColumnsStable: createColumnsStableContext({}),
        SetProject: setProjectContext(),
        ToastContainer: createMockToastContainer(),
      }),
    })

    const createData: MemexItemCreateData = {
      contentType: ItemType.DraftIssue,
      content: {
        title: 'Title',
      },
      previousMemexProjectItemId: DefaultOpenIssue.id,
    }

    await act(async () => {
      const createdMemexItemModel = await result.current.createMemexItem(createData)

      expect(addItemStub).toHaveBeenCalledWith({
        memexProjectItem: createData,
      })

      const itemModelsAfterAdd = getMemexItemModelsFromQueryClient(queryClient)
      expect(itemModelsAfterAdd[0]).toEqual(itemModel1)
      expect(itemModelsAfterAdd[1]).toEqual(createdMemexItemModel)
      expect(itemModelsAfterAdd[2]).toEqual(itemModel2)
    })
  })

  it('should call the memex item client and add toast when partial failures present', async () => {
    const addItemStub = stubResolvedApiResponse(apiAddItem, {
      memexProjectItem: DefaultClosedIssue,
      memexProjectColumn: [
        {
          id: SystemColumnId.TrackedBy,
          partialFailures: {
            message: 'We encountered a problem retrieving the "Tracked by" data. Please try again later.',
          },
        },
      ],
    })

    const addLoadedFieldIdStub = stubAddLoadedFieldId()

    const queryClient = createTestQueryClient()
    const {result} = renderHook(useCreateMemexItem, {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient, memexItems: []},
        ProjectNumber: existingProject(),
        ProjectDetails: defaultProjectDetails(),
        ColumnsStable: createColumnsStableContext({addLoadedFieldId: addLoadedFieldIdStub}),
        SetProject: setProjectContext(),
        ToastContainer: createMockToastContainer(),
      }),
    })

    const createData: MemexItemCreateData = {
      contentType: ItemType.DraftIssue,
      content: {
        title: 'Title',
      },
    }

    await act(async () => {
      await result.current.createMemexItem(createData)
      expect(addItemStub).toHaveBeenCalledWith({
        memexProjectItem: createData,
      })
    })
  })
})

function expectAddLoadedFieldStubToBeCalledWithColumnData(
  addLoadedFieldIdStub: ColumnsStableContextType['addLoadedFieldId'],
  memexItemModel: MemexItemModel,
) {
  expect(addLoadedFieldIdStub).toHaveBeenCalledTimes(Object.entries(memexItemModel.columns).length)

  for (const columnId of Object.keys(memexItemModel.columns)) {
    const idWithCorrectType = isNaN(parseInt(columnId)) ? columnId : parseInt(columnId)
    expect(addLoadedFieldIdStub).toHaveBeenCalledWith(idWithCorrectType)
  }
}
