import {noop} from '@github-ui/noop'
import {testIdProps} from '@github-ui/test-id-props'
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import {useEffect} from 'react'

import {SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import {ItemType} from '../../../client/api/memex-items/item-type'
import {SidePanelTypeParam} from '../../../client/api/memex-items/side-panel-item'
import {ItemKeyType, type SidePanelMetadata} from '../../../client/api/side-panel/contracts'
import {paginatedRefreshEvent} from '../../../client/api/SocketMessage/contracts'
import {apiPostStats} from '../../../client/api/stats/api-post-stats'
import {SidePanelLiveUpdate} from '../../../client/components/side-panel/live-update'
import {useEnabledFeatures} from '../../../client/hooks/use-enabled-features'
import {useSidePanel} from '../../../client/hooks/use-side-panel'
import {createMemexItemModel, type IssueModel} from '../../../client/models/memex-item-model'
import {useIssueContext} from '../../../client/state-providers/issues/use-issue-context'
import {mockLabels} from '../../../mocks/data/labels'
import {MemexRefreshEvents} from '../../../mocks/data/memex-refresh-events'
import {DefaultOpenIssue, DefaultOpenSidePanelMetadata} from '../../../mocks/memex-items'
import {stubResolvedApiResponse} from '../../mocks/api/memex'
import {stubGetItem} from '../../mocks/api/memex-items'
import {stubGetSidePanelMetadata} from '../../mocks/api/side-panel'
import {asMockHook} from '../../mocks/stub-utilities'
import {getSidePanelWrapperWithMockedMetadata} from './side-panel-test-helpers'

jest.mock('../../../client/api/stats/api-post-stats')
jest.mock('../../../client/hooks/use-enabled-features')
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom')
  return {
    ...originalModule,
    useSearchParams: jest.fn().mockImplementation(() => {
      return [new URLSearchParams(), jest.fn()]
    }),
  }
})
const fireMessageEvent = (
  el: HTMLElement,
  data: object = {
    reason: 'issue updated',
  },
) =>
  fireEvent(
    el,
    new CustomEvent('socket:message', {
      detail: {
        data,
      },
    }),
  )

describe('Side Panel Live Update', () => {
  beforeEach(() => {
    asMockHook(useEnabledFeatures).mockReturnValue({})
  })

  it('should live update when an item event happens', async () => {
    const {wrapper} = getSidePanelWrapperWithMockedMetadata(DefaultOpenIssue.id, DefaultOpenIssue.contentRepositoryId, {
      ...DefaultOpenSidePanelMetadata,
      liveUpdateChannel: 'test-channel',
    })

    const BodyAndHook = () => {
      const {sidePanelMetadata} = useIssueContext()
      return (
        <>
          <span {...testIdProps('issue-title')}>{sidePanelMetadata.title.raw}</span>
          <SidePanelLiveUpdate />
        </>
      )
    }

    // eslint-disable-next-line testing-library/no-unnecessary-act, @typescript-eslint/require-await
    await act(async () => {
      render(<BodyAndHook />, {
        wrapper,
      })
    })

    const channelElement = await screen.findByTestId('side-panel-item-live-update-listener')
    expect(channelElement).toBeInTheDocument()
    await waitFor(() => expect(channelElement).toHaveAttribute('data-channel', 'test-channel'))
    expect(screen.getByTestId('issue-title')).toHaveTextContent(DefaultOpenSidePanelMetadata.title.raw)

    const postStatsStub = stubResolvedApiResponse(apiPostStats, {success: true})
    const getSidePanelMetadataStub = stubGetSidePanelMetadata({
      ...DefaultOpenSidePanelMetadata,
      title: {
        raw: 'this is a totally new title!',
        html: '<p>this is a totally new title!</p>',
      },
    })

    fireMessageEvent(channelElement)

    await waitFor(
      () => {
        expect(screen.getByTestId('issue-title')).toHaveTextContent('this is a totally new title!')
      },
      // We debounce the refresh after the event is fired, so we need to wait for that.
      {timeout: 2500},
    )

    expect(getSidePanelMetadataStub).toHaveBeenCalledTimes(1)
    expect(postStatsStub).toHaveBeenCalledWith({
      payload: {
        name: 'side_panel_metadata_refresh',
        context: JSON.stringify({contentType: 'Issue', fromSocketEvent: true}),
      },
    })
  })

  /**
   * these tests don't include the `memexitem` in the json island, so we can't properly
   * read it. they worked due to copying references in the tests, instead of relying on a real
   * data scenario
   */
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should live update sidebar properties when receiving a memex update event', async () => {
    const item = createMemexItemModel(DefaultOpenIssue) as IssueModel
    const {wrapper} = getSidePanelWrapperWithMockedMetadata(
      item.id,
      item.contentRepositoryId,
      DefaultOpenSidePanelMetadata,
    )

    const BodyAndHook = () => {
      const {openProjectItemInPane, sidePanelState} = useSidePanel()

      useEffect(() => {
        openProjectItemInPane(item, noop)
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

      return (
        <>
          {sidePanelState?.type === SidePanelTypeParam.ISSUE && (
            <span {...testIdProps('issue-labels')}>
              {sidePanelState.item
                ?.getLabels()
                .map(label => label.name)
                .join(', ')}
            </span>
          )}

          <SidePanelLiveUpdate />
        </>
      )
    }

    // eslint-disable-next-line testing-library/no-unnecessary-act, @typescript-eslint/require-await
    await act(async () => {
      render(<BodyAndHook />, {
        wrapper,
      })
    })

    const channelElement = await screen.findByTestId('side-panel-pane-item-live-update-listener')
    expect(channelElement).toBeInTheDocument()
    expect(screen.getByTestId('issue-labels')).toHaveTextContent(item.getLabels()[0].name)

    const getItemStub = stubGetItem({
      ...DefaultOpenIssue,
      id: item.id,
      memexProjectColumnValues: DefaultOpenIssue.memexProjectColumnValues.map(column => {
        if (column.memexProjectColumnId === SystemColumnId.Labels) {
          return {...column, value: [mockLabels[1]]}
        }
        return column
      }),
    })

    fireMessageEvent(channelElement, {
      type: MemexRefreshEvents.MemexProjectColumnUpdate,
      payload: {
        item_id: item.id,
      },
    })

    await waitFor(
      () => {
        expect(getItemStub).toHaveBeenCalledTimes(1)
      },
      {timeout: 10000},
    )

    expect(screen.getByTestId('issue-labels')).toHaveTextContent(mockLabels[1].name)
  })

  it('should live update draft item when a correct memex update event happens', async () => {
    const itemId = 8675309
    const mocked: SidePanelMetadata = {
      ...DefaultOpenSidePanelMetadata,
      itemKey: {
        projectItemId: itemId,
        kind: ItemKeyType.PROJECT_DRAFT_ISSUE,
      },
      liveUpdateChannel: 'test-channel',
    }
    const {wrapper} = getSidePanelWrapperWithMockedMetadata(itemId, -1, mocked, ItemType.DraftIssue)

    // eslint-disable-next-line testing-library/no-unnecessary-act, @typescript-eslint/require-await
    await act(async () => {
      render(<SidePanelLiveUpdate />, {
        wrapper,
      })
    })

    const channelElement = await screen.findByTestId('side-panel-item-live-update-listener')
    expect(channelElement).toBeInTheDocument()
    await waitFor(() => expect(channelElement).toHaveAttribute('data-channel', 'test-channel'))
    const getSidePanelMetadataStub = stubGetSidePanelMetadata(mocked)

    fireMessageEvent(channelElement, {
      type: MemexRefreshEvents.MemexProjectColumnUpdate,
      payload: {
        item_id: itemId,
      },
    })

    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalledTimes(1), {timeout: 2000})
  })

  it('should not live update draft item when an event for a different item ID', async () => {
    const itemId = 8675309
    const mocked: SidePanelMetadata = {
      ...DefaultOpenSidePanelMetadata,
      itemKey: {
        projectItemId: itemId,
        kind: ItemKeyType.PROJECT_DRAFT_ISSUE,
      },
      liveUpdateChannel: 'test-channel',
    }
    const {wrapper} = getSidePanelWrapperWithMockedMetadata(itemId, -1, mocked, ItemType.DraftIssue)

    // eslint-disable-next-line testing-library/no-unnecessary-act, @typescript-eslint/require-await
    await act(async () => {
      render(<SidePanelLiveUpdate />, {
        wrapper,
      })
    })

    const channelElement = await screen.findByTestId('side-panel-item-live-update-listener')
    expect(channelElement).toBeInTheDocument()
    await waitFor(() => expect(channelElement).toHaveAttribute('data-channel', 'test-channel'))
    const getSidePanelMetadataStub = stubGetSidePanelMetadata(mocked)

    fireMessageEvent(channelElement, {
      type: MemexRefreshEvents.MemexProjectColumnUpdate,
      payload: {
        // send an event for a different item
        item_id: itemId + 12345,
      },
    })

    // give time for the event to fire
    await waitFor(() => new Promise(r => setTimeout(r, 2000)), {timeout: 5000})
    expect(getSidePanelMetadataStub).toHaveBeenCalledTimes(0)
  })

  it('should ignore paginated live update events', async () => {
    const itemId = 8675309
    const mocked: SidePanelMetadata = {
      ...DefaultOpenSidePanelMetadata,
      itemKey: {
        projectItemId: itemId,
        kind: ItemKeyType.PROJECT_DRAFT_ISSUE,
      },
      liveUpdateChannel: 'test-channel',
    }
    const {wrapper} = getSidePanelWrapperWithMockedMetadata(itemId, -1, mocked, ItemType.DraftIssue)

    render(<SidePanelLiveUpdate />, {
      wrapper,
    })

    const channelElement = await screen.findByTestId('side-panel-item-live-update-listener')
    expect(channelElement).toBeInTheDocument()
    await waitFor(() => expect(channelElement).toHaveAttribute('data-channel', 'test-channel'))
    const getSidePanelMetadataStub = stubGetSidePanelMetadata(mocked)

    fireMessageEvent(channelElement, {
      type: paginatedRefreshEvent,
    })

    // give time for the event to fire
    await waitFor(() => new Promise(r => setTimeout(r, 2000)), {timeout: 5000})
    expect(getSidePanelMetadataStub).toHaveBeenCalledTimes(0)
  })

  it('should not live update more than once if an event triggers multiple time in debounce wait', async () => {
    const {wrapper} = getSidePanelWrapperWithMockedMetadata(DefaultOpenIssue.id, DefaultOpenIssue.contentRepositoryId, {
      ...DefaultOpenSidePanelMetadata,
      liveUpdateChannel: 'test-channel',
    })

    // eslint-disable-next-line testing-library/no-unnecessary-act, @typescript-eslint/require-await
    await act(async () => {
      render(<SidePanelLiveUpdate />, {
        wrapper,
      })
    })

    const channelElement = await screen.findByTestId('side-panel-item-live-update-listener')
    expect(channelElement).toBeInTheDocument()
    await waitFor(() => expect(channelElement).toHaveAttribute('data-channel', 'test-channel'))
    const getSidePanelMetadataStub = stubGetSidePanelMetadata(DefaultOpenSidePanelMetadata)
    fireMessageEvent(channelElement)
    await waitFor(() => new Promise(r => setTimeout(r, 200)))
    fireMessageEvent(channelElement)
    await waitFor(() => new Promise(r => setTimeout(r, 200)))
    fireMessageEvent(channelElement)
    await waitFor(() => new Promise(r => setTimeout(r, 200)))

    // give time for the event to trigger a refresh
    await waitFor(() => new Promise(r => setTimeout(r, 2000)), {timeout: 5000})
    expect(getSidePanelMetadataStub).toHaveBeenCalledTimes(1)
  })

  it('should not live update if an irrelevant event occurs', async () => {
    const {wrapper} = getSidePanelWrapperWithMockedMetadata(DefaultOpenIssue.id, DefaultOpenIssue.contentRepositoryId, {
      ...DefaultOpenSidePanelMetadata,
      liveUpdateChannel: 'test-channel',
    })

    // eslint-disable-next-line testing-library/no-unnecessary-act, @typescript-eslint/require-await
    await act(async () => {
      render(<SidePanelLiveUpdate />, {
        wrapper,
      })
    })

    const channelElement = await screen.findByTestId('side-panel-item-live-update-listener')
    expect(channelElement).toBeInTheDocument()
    await waitFor(() => expect(channelElement).toHaveAttribute('data-channel', 'test-channel'))

    const getSidePanelMetadataStub = stubGetSidePanelMetadata(DefaultOpenSidePanelMetadata)

    fireMessageEvent(channelElement, {
      notareason: 'issue updated',
    })

    // give time for the event to fire
    await waitFor(() => new Promise(r => setTimeout(r, 2000)), {timeout: 5000})
    expect(getSidePanelMetadataStub).toHaveBeenCalledTimes(0)
  })
})
