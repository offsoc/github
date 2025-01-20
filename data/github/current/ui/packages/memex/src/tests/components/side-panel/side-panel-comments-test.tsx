/* eslint eslint-comments/no-use: off */

import {render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {SidePanelComments} from '../../../client/components/side-panel/comments'
import {useEnabledFeatures} from '../../../client/hooks/use-enabled-features'
import {DefaultOpenIssue, DefaultOpenSidePanelMetadata} from '../../../mocks/memex-items/issues'
import {asMockHook} from '../../mocks/stub-utilities'
import {getSidePanelWrapperWithMockedMetadata} from './side-panel-test-helpers'

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
describe('Side Panel Comments', () => {
  beforeEach(() => {
    jest.useFakeTimers({doNotFake: ['queueMicrotask']})
    asMockHook(useEnabledFeatures).mockReturnValue({})
    user = userEvent.setup({advanceTimers: jest.advanceTimersByTime})
  })

  it('displays issue comment author details in comment box', async () => {
    const {wrapper, getSidePanelMetadataStub} = getSidePanelWrapperWithMockedMetadata(
      DefaultOpenIssue.id,
      DefaultOpenIssue.contentRepositoryId,
      {
        ...DefaultOpenSidePanelMetadata,
      },
    )
    render(<SidePanelComments itemURL="https://github.com/github/memex/issues/1" />, {
      wrapper,
    })
    expect(await screen.findByText(DefaultOpenSidePanelMetadata.comments![0].description.body!)).toBeInTheDocument()
    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalledTimes(1))

    const commentId = DefaultOpenSidePanelMetadata.comments![0].id
    const comment = await screen.findByTestId(`comments-box-${commentId}`)
    const author = await within(comment).findByTestId('author-login')
    const authorAssociation = await within(comment).findByTestId('author-association')
    expect(author.textContent).toBe('tylerdixon')
    expect(authorAssociation.textContent).toBe('Collaborator')
  })

  it('displays issue comment body in side panel comment box', async () => {
    const {wrapper, getSidePanelMetadataStub} = getSidePanelWrapperWithMockedMetadata(
      DefaultOpenIssue.id,
      DefaultOpenIssue.contentRepositoryId,
      {
        ...DefaultOpenSidePanelMetadata,
      },
    )
    render(<SidePanelComments itemURL="https://github.com/github/memex/issues/1" />, {
      wrapper,
    })
    expect(await screen.findByText(DefaultOpenSidePanelMetadata.comments![0].description.body!)).toBeInTheDocument()
    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalledTimes(1))

    const commentId = DefaultOpenSidePanelMetadata.comments![0].id
    const comment = await screen.findByTestId(`comments-box-${commentId}`)
    const body = await within(comment).findByTestId('comment-body')
    expect(body.textContent).toBe('Hi there, this is a comment')
  })

  it('displays reactions in comments in the sidepanel', async () => {
    const {wrapper, getSidePanelMetadataStub} = getSidePanelWrapperWithMockedMetadata(
      DefaultOpenIssue.id,
      DefaultOpenIssue.contentRepositoryId,
      {
        ...DefaultOpenSidePanelMetadata,
      },
    )
    render(<SidePanelComments itemURL="https://github.com/github/memex/issues/1" />, {
      wrapper,
    })
    expect(await screen.findByText(DefaultOpenSidePanelMetadata.comments![0].description.body!)).toBeInTheDocument()
    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalledTimes(1))

    const commentId = DefaultOpenSidePanelMetadata.comments![0].id
    const comment = await screen.findByTestId(`comments-box-${commentId}`)
    const reactions = await within(comment).findByTestId('reactions-toolbar')
    const reactionData = await within(reactions).findByTestId('heart-reaction-button')
    expect(reactionData).toBeInTheDocument()
    expect(reactionData.textContent).toBe('❤️2')
  })

  it('disables reactions when user cannot react', async () => {
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
    const reactions = await within(comment).findByTestId('reactions-toolbar')

    expect(within(reactions).queryByTestId('all-reactions-button')).not.toBeInTheDocument()

    const reactionData = await within(reactions).findByTestId('heart-reaction-button')
    expect(reactionData).toBeDisabled()
  })

  it('hides edit button when user cannot edit', async () => {
    const {wrapper, getSidePanelMetadataStub} = getSidePanelWrapperWithMockedMetadata(
      DefaultOpenIssue.id,
      DefaultOpenIssue.contentRepositoryId,
      {
        ...DefaultOpenSidePanelMetadata,
        comments: DefaultOpenSidePanelMetadata.comments?.map(comment => ({
          ...comment,
          capabilities: comment.capabilities?.filter(c => c !== 'editDescription'),
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
    const overflowButton = within(comment).getByTestId('comment-overflow-menu-button')
    await user.click(overflowButton)
    expect(screen.queryByTestId('overflow-menu-edit-button')).not.toBeInTheDocument()
  })

  it('hides add comment form when user cannot comment', async () => {
    const {wrapper, getSidePanelMetadataStub} = getSidePanelWrapperWithMockedMetadata(
      DefaultOpenIssue.id,
      DefaultOpenIssue.contentRepositoryId,
      {
        ...DefaultOpenSidePanelMetadata,
        capabilities: DefaultOpenSidePanelMetadata.capabilities?.filter(c => c !== 'comment'),
      },
    )
    render(<SidePanelComments itemURL="https://github.com/github/memex/issues/1" />, {
      wrapper,
    })
    expect(await screen.findByText(DefaultOpenSidePanelMetadata.comments![0].description.body!)).toBeInTheDocument()
    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalledTimes(1))

    expect(screen.queryByTestId('add-comment-button')).not.toBeInTheDocument()
  })

  it('focuses add comment editor whwn Jump to bottom button clicked', async () => {
    const {wrapper, getSidePanelMetadataStub} = getSidePanelWrapperWithMockedMetadata(
      DefaultOpenIssue.id,
      DefaultOpenIssue.contentRepositoryId,
      DefaultOpenSidePanelMetadata,
    )
    render(<SidePanelComments itemURL="https://github.com/github/memex/issues/1" />, {
      wrapper,
    })
    expect(await screen.findByText(DefaultOpenSidePanelMetadata.comments![0].description.body!)).toBeInTheDocument()
    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalledTimes(1))

    const jumpToBottomButton = await screen.findByTestId('jump-to-bottom-button')

    await user.click(jumpToBottomButton)

    const editorInput = within(screen.getByTestId('markdown-editor')).getByRole('textbox')
    expect(editorInput).toHaveFocus()
  })
})
