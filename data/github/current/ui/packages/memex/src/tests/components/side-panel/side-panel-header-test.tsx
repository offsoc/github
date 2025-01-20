/* eslint eslint-comments/no-use: off */

import {noop} from '@github-ui/noop'
import {testIdProps} from '@github-ui/test-id-props'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {apiPostStats} from '../../../client/api/stats/api-post-stats'
import {SidePanelHeader} from '../../../client/components/side-panel/header'
import {useSidePanel} from '../../../client/hooks/use-side-panel'
import {DefaultOpenSidePanelMetadata} from '../../../mocks/memex-items'
import {stubResolvedApiResponse} from '../../mocks/api/memex'
import {stubGetSidePanelMetadata} from '../../mocks/api/side-panel'
import {setupEnvironmentWithDraftIssue} from './side-panel-test-helpers'

jest.mock('../../../client/api/stats/api-post-stats')
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom')
  return {
    ...originalModule,
    useSearchParams: jest.fn().mockImplementation(() => {
      return [new URLSearchParams(), jest.fn()]
    }),
  }
})

let user: ReturnType<typeof userEvent.setup>
async function editName() {
  // click the edit button
  const editButton = await screen.findByTestId('side-panel-title-edit-button')
  await user.click(editButton)

  // change the content
  const content = screen.getByTestId('side-panel-title-input')
  await user.clear(content)
  await user.type(content, 'new title')

  // click the save button
  const saveButton = screen.getByTestId('side-panel-title-save-button')
  await user.click(saveButton)

  // wait for the save to complete by waiting for the edit button to reappear
  await screen.findByTestId('side-panel-title-edit-button')
}

describe('SidePanelHeader', () => {
  beforeEach(() => {
    user = userEvent.setup()
  })
  it("editing the issue's name posts the item_rename stat", async () => {
    const {item, wrapper} = setupEnvironmentWithDraftIssue()
    const getSidePanelMetadataStub = stubGetSidePanelMetadata({...DefaultOpenSidePanelMetadata})

    const postStatsStub = stubResolvedApiResponse(apiPostStats, {success: true})

    render(
      <SidePanelHeader
        item={item}
        isLoading={false}
        showBreadcrumbs
        showTabs
        onTabChange={noop}
        selectedTab="details"
      />,
      {wrapper},
    )
    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalled())

    await editName()

    await waitFor(() =>
      expect(postStatsStub).toHaveBeenCalledWith({
        payload: {
          memexProjectItemId: item.id,
          name: 'item_rename',
          ui: 'side-panel',
        },
      }),
    )
    expect(postStatsStub).toHaveBeenCalledWith({
      payload: {
        name: 'side_panel_edit_item',
        context: JSON.stringify({contentType: 'DraftIssue', updates: ['title']}),
      },
    })
  })

  it('does not render the edit button when user cannot edit the title', async () => {
    const {item, wrapper} = setupEnvironmentWithDraftIssue()

    const getSidePanelMetadataStub = stubGetSidePanelMetadata({
      ...DefaultOpenSidePanelMetadata,
      capabilities: DefaultOpenSidePanelMetadata.capabilities?.filter(c => c !== 'editTitle'),
    })

    render(
      <SidePanelHeader
        item={item}
        isLoading={false}
        showBreadcrumbs
        showTabs
        onTabChange={noop}
        selectedTab="details"
      />,
      {wrapper},
    )
    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalled())

    expect(screen.queryByTestId('side-panel-title-edit-button')).not.toBeInTheDocument()
  })

  it('should mark pane state as dirty when editing and clean after saving', async () => {
    const {item, wrapper} = setupEnvironmentWithDraftIssue()

    // Create a dummy component that lets us check the SidePanelDirtyState
    const BodyAndHook = () => {
      const {hasUnsavedChanges} = useSidePanel()
      return (
        <>
          <span {...testIdProps('has-unsaved-changes')}>{`${hasUnsavedChanges}`}</span>
          <SidePanelHeader
            item={item}
            isLoading={false}
            showBreadcrumbs
            showTabs
            onTabChange={noop}
            selectedTab="details"
          />
        </>
      )
    }

    const getSidePanelMetadataStub = stubGetSidePanelMetadata(DefaultOpenSidePanelMetadata)
    render(<BodyAndHook />, {wrapper})
    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalled())

    // before editing, the state should be clean
    expect(screen.getByTestId('has-unsaved-changes')).toHaveTextContent('false')

    // click the edit button
    const editButton = screen.getByTestId('side-panel-title-edit-button')
    await user.click(editButton)

    // after an edit, it should be dirty
    expect(screen.getByTestId('has-unsaved-changes')).toHaveTextContent('true')

    // change the content
    const content = screen.getByTestId('side-panel-title-input')
    await user.clear(content)
    await user.type(content, 'new title')

    // click the save button
    const saveButton = screen.getByTestId('side-panel-title-save-button')
    await user.click(saveButton)

    // and lastly, saving the name should mark the side-panel-header state as clean again
    await waitFor(() => expect(screen.getByTestId('has-unsaved-changes')).toHaveTextContent('false'))
  })

  it('should mark pane state as dirty when editing and clean after cancelling changes', async () => {
    const {item, wrapper} = setupEnvironmentWithDraftIssue()

    // Create a dummy component that lets us check the SidePanelDirtyState
    const BodyAndHook = () => {
      const {hasUnsavedChanges} = useSidePanel()
      return (
        <>
          <span {...testIdProps('has-unsaved-changes')}>{`${hasUnsavedChanges}`}</span>
          <SidePanelHeader
            item={item}
            isLoading={false}
            showBreadcrumbs
            showTabs
            onTabChange={noop}
            selectedTab="details"
          />
        </>
      )
    }

    const getSidePanelMetadataStub = stubGetSidePanelMetadata(DefaultOpenSidePanelMetadata)
    render(<BodyAndHook />, {wrapper})
    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalled())

    // before editing, the state should be clean
    expect(screen.getByTestId('has-unsaved-changes')).toHaveTextContent('false')

    // click the edit button

    const editButton = await screen.findByTestId('side-panel-title-edit-button')
    await user.click(editButton)

    // after an edit, it should be dirty
    expect(screen.getByTestId('has-unsaved-changes')).toHaveTextContent('true')

    // change the content
    const content = screen.getByTestId('side-panel-title-input')
    await user.clear(content)
    await user.type(content, 'new title')

    // click the revert button
    const revertButton = screen.getByTestId('side-panel-title-revert-button')
    await user.click(revertButton)

    // and lastly, saving the name should mark the side-panel-header state as clean again
    expect(screen.getByTestId('has-unsaved-changes')).toHaveTextContent('false')
  })

  it('renders tracking fields', async () => {
    const {item, wrapper} = setupEnvironmentWithDraftIssue()

    const getSidePanelMetadataStub = stubGetSidePanelMetadata({
      ...DefaultOpenSidePanelMetadata,
      capabilities: DefaultOpenSidePanelMetadata.capabilities?.filter(c => c !== 'editTitle'),
    })

    render(
      <SidePanelHeader
        item={item}
        isLoading={false}
        showBreadcrumbs
        showTabs
        onTabChange={noop}
        selectedTab="details"
      />,
      {wrapper},
    )

    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalled())
    expect(screen.getByTestId('tracking-fields')).toBeInTheDocument()
  })
})
