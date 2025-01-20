import {FeatureFlagProvider} from '@github-ui/react-core/feature-flag-provider'
import {testIdProps} from '@github-ui/test-id-props'
import {render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type {SidePanelItem} from '../../../client/api/memex-items/side-panel-item'
import {apiPostStats} from '../../../client/api/stats/api-post-stats'
import {SidePanelBody} from '../../../client/components/side-panel/body'
import {useEnabledFeatures} from '../../../client/hooks/use-enabled-features'
import {useSidePanel} from '../../../client/hooks/use-side-panel'
import {createMemexItemModel} from '../../../client/models/memex-item-model'
import {DefaultDraftSidePanelMetadata, DefaultOpenIssue, DefaultOpenSidePanelMetadata} from '../../../mocks/memex-items'
import {stubResolvedApiResponse} from '../../mocks/api/memex'
import {stubGetSidePanelMetadata, stubUpdateSidePanelItem} from '../../mocks/api/side-panel'
import {asMockHook} from '../../mocks/stub-utilities'
import {getSidePanelWrapperWithMockedMetadata, setupEnvironmentWithDraftIssue} from './side-panel-test-helpers'

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
let user: ReturnType<typeof userEvent.setup>
async function editDraft() {
  // click the edit button
  const editButton = await screen.findByTestId('edit-comment-button')

  await user.click(editButton)

  // change the content
  const content = within(screen.getByTestId('markdown-editor')).getByRole('textbox')
  await user.type(content, 'new content')

  // click the save button
  const button = screen.getByTestId('save-button')
  await user.click(button)

  // wait for the save to complete by waiting for the edit button to reappear
  await screen.findByTestId('edit-comment-button')
}

function renderBodyAndHook(wrapper: React.ComponentType<React.PropsWithChildren<unknown>>, item: SidePanelItem) {
  // Create a dummy component that lets us check the SidePanelDirtyState
  const BodyAndHook = () => {
    const {hasUnsavedChanges} = useSidePanel()
    return (
      <>
        <span {...testIdProps('has-unsaved-changes')}>{`${hasUnsavedChanges}`}</span>
        <SidePanelBody item={item} isLoading={false} />
      </>
    )
  }

  render(<BodyAndHook />, {wrapper})
}

describe('SidePanelBody', () => {
  beforeEach(() => {
    asMockHook(useEnabledFeatures).mockReturnValue({})
    user = userEvent.setup()
  })
  it('displays all of the correct information for an issue', async () => {
    render(<SidePanelBody item={createMemexItemModel(DefaultOpenIssue)} isLoading={false} />, {
      wrapper: getSidePanelWrapperWithMockedMetadata(DefaultOpenIssue.id, DefaultOpenIssue.contentRepositoryId, {
        ...DefaultOpenSidePanelMetadata,
      }).wrapper,
    })

    await waitFor(() =>
      expect(screen.getByTestId('author-avatar')).toHaveAttribute(
        'src',
        'http://localhost/assets/avatars/u/5487287.png?size=48',
      ),
    )
    expect(screen.getByTestId('author-login')).toHaveTextContent('dmarcey')
    await waitFor(() => expect(screen.getByTestId('comment-body')).toHaveTextContent('Hi there, this is a issue body'))
  })

  it("editing the draft issue's body posts the draft_edit stat", async () => {
    const {item, wrapper} = setupEnvironmentWithDraftIssue()

    const getSidePanelMetadataStub = stubGetSidePanelMetadata({...DefaultOpenSidePanelMetadata})
    stubUpdateSidePanelItem({...DefaultOpenSidePanelMetadata})
    const postStatsStub = stubResolvedApiResponse(apiPostStats, {success: true})

    render(<SidePanelBody item={item} isLoading={false} />, {
      wrapper,
    })
    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalled())

    await editDraft()

    expect(postStatsStub).toHaveBeenCalledWith({
      payload: {
        memexProjectItemId: item.id,
        name: 'draft_edit',
      },
    })
    expect(postStatsStub).toHaveBeenCalledWith({
      payload: {
        name: 'side_panel_edit_item',
        context: JSON.stringify({contentType: 'DraftIssue', updates: ['body']}),
      },
    })
  })

  it('does not show edit button when user does not have permissions', async () => {
    const {item, wrapper} = setupEnvironmentWithDraftIssue()

    const getSidePanelMetadataStub = stubGetSidePanelMetadata({
      ...DefaultOpenSidePanelMetadata,
      capabilities: DefaultOpenSidePanelMetadata.capabilities?.filter(c => c !== 'editDescription'),
    })

    render(<SidePanelBody item={item} isLoading={false} />, {
      wrapper,
    })
    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalled())

    expect(screen.queryByTestId('edit-comment-button')).not.toBeInTheDocument()
  })

  it('does not enable reactions when user does not have permissions', async () => {
    const {item, wrapper} = setupEnvironmentWithDraftIssue()

    const getSidePanelMetadataStub = stubGetSidePanelMetadata({
      ...DefaultOpenSidePanelMetadata,
      capabilities: DefaultOpenSidePanelMetadata.capabilities?.filter(c => c !== 'react'),
    })

    render(<SidePanelBody item={item} isLoading={false} />, {
      wrapper,
    })
    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalled())

    expect(screen.queryByTestId('all-reactions-button')).not.toBeInTheDocument()
  })

  it('focuses the Markdown editor input when starting to edit a body', async () => {
    const {item, wrapper} = setupEnvironmentWithDraftIssue()

    const getSidePanelMetadataStub = stubGetSidePanelMetadata({
      ...DefaultOpenSidePanelMetadata,
      description: {body: '', bodyHtml: ''},
    })

    renderBodyAndHook(wrapper, item)
    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalled())

    const editButton = await screen.findByRole('button', {name: 'Edit comment'})
    await user.click(editButton)

    const input = within(screen.getByTestId('markdown-editor')).getByRole('textbox')

    await waitFor(() => expect(input).toHaveFocus())
  })

  it('should mark pane state as dirty when editing and clean after saving', async () => {
    const {item, wrapper} = setupEnvironmentWithDraftIssue()

    const getSidePanelMetadataStub = stubGetSidePanelMetadata({...DefaultOpenSidePanelMetadata})
    stubUpdateSidePanelItem({...DefaultOpenSidePanelMetadata})

    renderBodyAndHook(wrapper, item)
    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalled())

    // before editing, the state should be clean
    expect(screen.getByTestId('has-unsaved-changes')).toHaveTextContent('false')

    // click the edit button
    const editButton = await screen.findByTestId('edit-comment-button')
    await user.click(editButton)

    // change the content
    const content = screen.getByRole('textbox')
    await user.type(content, 'new content')

    // after an edit, it should be dirty
    expect(screen.getByTestId('has-unsaved-changes')).toHaveTextContent('true')

    // click the save button
    const saveButton = screen.getByTestId('save-button')
    await user.click(saveButton)

    // wait for the save to complete by waiting for the edit button to reappear
    await screen.findByTestId('edit-comment-button')

    // and lastly, saving the body should mark the side-panel-body state as clean again
    expect(screen.getByTestId('has-unsaved-changes')).toHaveTextContent('false')
  })

  it('should mark pane state as dirty when editing and clean after cancelling', async () => {
    const {item, wrapper} = setupEnvironmentWithDraftIssue()

    const getSidePanelMetadataStub = stubGetSidePanelMetadata({...DefaultOpenSidePanelMetadata})

    renderBodyAndHook(wrapper, item)
    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalled())

    // before editing, the state should be clean
    expect(screen.getByTestId('has-unsaved-changes')).toHaveTextContent('false')

    // click the edit button
    const editButton = await screen.findByTestId('edit-comment-button')
    await user.click(editButton)

    // change the content
    const content = screen.getByRole('textbox')
    await user.type(content, 'new content')

    // after an edit, it should be dirty
    expect(screen.getByTestId('has-unsaved-changes')).toHaveTextContent('true')

    // click the cancel button
    const cancelButton = screen.getByRole('button', {name: 'Cancel'})
    await user.click(cancelButton)

    // wait for the cancellation to complete by waiting for the edit button to reappear
    await screen.findByTestId('edit-comment-button')

    // and lastly, cancelling the edit should mark the side-panel-body state as clean again
    expect(screen.getByTestId('has-unsaved-changes')).toHaveTextContent('false')
  })
})

describe('Add tasklist button', () => {
  it('shows the add tasklist button when the tasklist_block flag is enabled and it is not a draft issue', async () => {
    asMockHook(useEnabledFeatures).mockReturnValue({tasklist_block: true})
    const {wrapper: Wrapper, getSidePanelMetadataStub} = getSidePanelWrapperWithMockedMetadata(
      DefaultOpenIssue.id,
      DefaultOpenIssue.contentRepositoryId,
      {
        ...DefaultOpenSidePanelMetadata,
      },
    )

    renderBodyAndHook(
      ({children}) => (
        <FeatureFlagProvider features={{tasklist_block: true}}>
          <Wrapper>{children}</Wrapper>
        </FeatureFlagProvider>
      ),
      createMemexItemModel(DefaultOpenIssue),
    )
    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalled())

    const editButton = await screen.findByTestId('edit-comment-button')
    await user.click(editButton)

    expect(screen.getByRole('button', {name: 'Add a tasklist'})).toBeInTheDocument()
  })

  it('does not show the add tasklist button when it is a draft issue', async () => {
    asMockHook(useEnabledFeatures).mockReturnValue({tasklist_block: true})
    const {item, wrapper: Wrapper} = setupEnvironmentWithDraftIssue()

    const getSidePanelMetadataStub = stubGetSidePanelMetadata({...DefaultDraftSidePanelMetadata})
    renderBodyAndHook(
      ({children}) => (
        <FeatureFlagProvider features={{tasklist_block: true}}>
          <Wrapper>{children}</Wrapper>
        </FeatureFlagProvider>
      ),
      item,
    )
    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalled())

    const editButton = await screen.findByTestId('edit-comment-button')
    await user.click(editButton)

    expect(screen.queryByRole('button', {name: 'Add a tasklist'})).not.toBeInTheDocument()
  })

  it('does not show the add tasklist button when the tasklist_block flag is not enabled', async () => {
    asMockHook(useEnabledFeatures).mockReturnValue({tasklist_block: false})

    const {wrapper, getSidePanelMetadataStub} = getSidePanelWrapperWithMockedMetadata(
      DefaultOpenIssue.id,
      DefaultOpenIssue.contentRepositoryId,
      {
        ...DefaultOpenSidePanelMetadata,
      },
    )

    renderBodyAndHook(wrapper, createMemexItemModel(DefaultOpenIssue))
    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalled())

    const editButton = await screen.findByTestId('edit-comment-button')
    await user.click(editButton)

    expect(screen.queryByRole('button', {name: 'Add a tasklist'})).not.toBeInTheDocument()
  })

  it('does not show the add tasklist button when the sub_issues flag is enabled', async () => {
    asMockHook(useEnabledFeatures).mockReturnValue({tasklist_block: true, sub_issues: true})

    const {wrapper, getSidePanelMetadataStub} = getSidePanelWrapperWithMockedMetadata(
      DefaultOpenIssue.id,
      DefaultOpenIssue.contentRepositoryId,
      {
        ...DefaultOpenSidePanelMetadata,
      },
    )

    renderBodyAndHook(wrapper, createMemexItemModel(DefaultOpenIssue))
    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalled())

    const editButton = await screen.findByTestId('edit-comment-button')
    await user.click(editButton)

    expect(screen.queryByRole('button', {name: 'Add a tasklist'})).not.toBeInTheDocument()
  })
})
