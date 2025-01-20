import {testIdProps} from '@github-ui/test-id-props'
import {render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type {SidePanelItem} from '../../../client/api/memex-items/side-panel-item'
import {SidePanelBody} from '../../../client/components/side-panel/body'
import {SidePanelComments} from '../../../client/components/side-panel/comments'
import {useEnabledFeatures} from '../../../client/hooks/use-enabled-features'
import {useSidePanel} from '../../../client/hooks/use-side-panel'
import {createMemexItemModel} from '../../../client/models/memex-item-model'
import {DefaultOpenIssue, DefaultOpenSidePanelMetadata} from '../../../mocks/memex-items'
import {stubGetSidePanelMetadata} from '../../mocks/api/side-panel'
import {asMockHook} from '../../mocks/stub-utilities'
import {getSidePanelWrapperWithMockedMetadata, setupEnvironmentWithDraftIssue} from './side-panel-test-helpers'

jest.mock('../../../client/hooks/use-enabled-features')

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

describe('Side Panel "Add tasklist" button', () => {
  describe('in view mode for body', () => {
    it('does not show the add tasklist button when tasklist_block is disabled', async () => {
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

      expect(screen.queryByTestId('add-tasklist-text-button')).not.toBeInTheDocument()
    })

    it('does not show the add tasklist button when it is a draft issue', async () => {
      asMockHook(useEnabledFeatures).mockReturnValue({tasklist_block: true})
      const {item, wrapper} = setupEnvironmentWithDraftIssue()

      const getSidePanelMetadataStub = stubGetSidePanelMetadata({...DefaultOpenSidePanelMetadata})
      renderBodyAndHook(wrapper, item)
      await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalled())

      expect(screen.queryByTestId('add-tasklist-text-button')).not.toBeInTheDocument()
    })

    it('shows the add tasklist button when the tasklist_block flag is enabled and it is not a draft issue', async () => {
      asMockHook(useEnabledFeatures).mockReturnValue({tasklist_block: true})
      const {wrapper, getSidePanelMetadataStub} = getSidePanelWrapperWithMockedMetadata(
        DefaultOpenIssue.id,
        DefaultOpenIssue.contentRepositoryId,
        {
          ...DefaultOpenSidePanelMetadata,
        },
      )
      renderBodyAndHook(wrapper, createMemexItemModel(DefaultOpenIssue))
      await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalled())

      expect(screen.getByTestId('add-tasklist-text-button')).toBeInTheDocument()
    })
  })

  describe('in view mode for comment', () => {
    it('does not show the add tasklist button when tasklist_block is disabled', async () => {
      asMockHook(useEnabledFeatures).mockReturnValue({tasklist_block: false})
      const {wrapper, getSidePanelMetadataStub} = getSidePanelWrapperWithMockedMetadata(
        DefaultOpenIssue.id,
        DefaultOpenIssue.contentRepositoryId,
        {
          ...DefaultOpenSidePanelMetadata,
          comments: DefaultOpenSidePanelMetadata.comments?.map(comment => ({
            ...comment,
            capabilities: comment.capabilities?.filter(c => c !== 'react'),
          })),
        },
      )
      render(<SidePanelComments itemURL="https://github.com/github/memex/issues/1" />, {
        wrapper,
      })
      expect(await screen.findByText(DefaultOpenSidePanelMetadata.comments![0].description.body!)).toBeInTheDocument()
      await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalledTimes(1))

      const commentId = DefaultOpenSidePanelMetadata.comments![0].id
      const comment = await screen.findByTestId(`comments-box-${commentId}`)

      expect(within(comment).queryByTestId('add-tasklist-text-button')).not.toBeInTheDocument()
    })

    it('does not show the add tasklist button when tasklist_block is enabled', async () => {
      asMockHook(useEnabledFeatures).mockReturnValue({tasklist_block: true})
      const {wrapper, getSidePanelMetadataStub} = getSidePanelWrapperWithMockedMetadata(
        DefaultOpenIssue.id,
        DefaultOpenIssue.contentRepositoryId,
        {
          ...DefaultOpenSidePanelMetadata,
          comments: DefaultOpenSidePanelMetadata.comments?.map(comment => ({
            ...comment,
            capabilities: comment.capabilities?.filter(c => c !== 'react'),
          })),
        },
      )
      render(<SidePanelComments itemURL="https://github.com/github/memex/issues/1" />, {
        wrapper,
      })
      expect(await screen.findByText(DefaultOpenSidePanelMetadata.comments![0].description.body!)).toBeInTheDocument()
      await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalledTimes(1))

      const commentId = DefaultOpenSidePanelMetadata.comments![0].id
      const comment = await screen.findByTestId(`comments-box-${commentId}`)

      expect(within(comment).queryByTestId('add-tasklist-text-button')).not.toBeInTheDocument()
    })
  })

  describe('in edit mode for body', () => {
    it('does not show the add tasklist button when tasklist_block is disabled', async () => {
      asMockHook(useEnabledFeatures).mockReturnValue({tasklist_block: false})
      const user = userEvent.setup()

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

      expect(screen.queryByTestId('add-tasklist-text-button')).not.toBeInTheDocument()
    })
  })
})
