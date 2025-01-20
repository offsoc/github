/* eslint eslint-comments/no-use: off */
import {fireEvent, render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {Role} from '../../../client/api/common-contracts'
import {ItemType} from '../../../client/api/memex-items/item-type'
import {apiPostStats} from '../../../client/api/stats/api-post-stats'
import {SidePanelComments} from '../../../client/components/side-panel/comments'
import {overrideDefaultPrivileges} from '../../../client/helpers/viewer-privileges'
import {useEnabledFeatures} from '../../../client/hooks/use-enabled-features'
import {IssueStateProvider} from '../../../client/state-providers/issues/issue-state-provider'
import {DefaultOpenIssue, DefaultOpenSidePanelMetadata} from '../../../mocks/memex-items/issues'
import {stubResolvedApiResponse} from '../../mocks/api/memex'
import {stubEditComment, stubGetSidePanelMetadata} from '../../mocks/api/side-panel'
import {asMockHook} from '../../mocks/stub-utilities'
import {getSidePanelWrapperWithMockedMetadata, setupEnvironment} from './side-panel-test-helpers'

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
describe('Side Panel Issue Comments', () => {
  beforeEach(() => {
    asMockHook(useEnabledFeatures).mockReturnValue({})
    user = userEvent.setup()
  })

  it('displays action menu for individual comment box', async () => {
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

    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalled())

    await waitFor(async () => {
      const id = DefaultOpenSidePanelMetadata.comments![0].id
      const comment = await screen.findByTestId(`comments-box-${id}`)
      const actionMenu = await within(comment).findByTestId('comment-overflow-menu-button')
      expect(actionMenu).toBeInTheDocument()
    })
  })

  it('accepts text files in the Markdown editor', async () => {
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

    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalled())

    const id = DefaultOpenSidePanelMetadata.comments![0].id
    const comment = await screen.findByTestId(`comments-box-${id}`)

    const actionMenu = within(comment).getByTestId('comment-overflow-menu-button')
    await user.click(actionMenu)
    const editComment = screen.getByTestId('overflow-menu-edit-button')
    await user.click(editComment)

    const input = within(within(comment).getByTestId('markdown-editor')).getByRole<HTMLTextAreaElement>('textbox')
    const file = new File(['foo'], `file.txt`, {type: 'text/plain'})
    // eslint-disable-next-line testing-library/prefer-user-event
    fireEvent.paste(input, {clipboardData: {files: [file], types: ['Files']}})

    await waitFor(() => expect(input.value).toContain(`Uploading "${file.name}"`))
  })

  it('makes a request to server when a comment is edited from sidepanel', async () => {
    const {wrapper} = setupEnvironment(undefined, undefined, {
      'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Write}),
    })

    const postStatsStub = stubResolvedApiResponse(apiPostStats, {success: true})
    const getSidePanelMetadataStub = stubGetSidePanelMetadata({...DefaultOpenSidePanelMetadata})

    const InnerWrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => {
      return (
        <IssueStateProvider
          itemId={DefaultOpenIssue.id}
          repositoryId={DefaultOpenIssue.contentRepositoryId}
          contentType={ItemType.Issue}
        >
          {children}
        </IssueStateProvider>
      )
    }

    const sidePanelWrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => {
      return wrapper({
        children: <InnerWrapper>{children}</InnerWrapper>,
      })
    }

    const editCommentStub = stubEditComment(DefaultOpenSidePanelMetadata.comments![0])

    render(<SidePanelComments itemURL="https://github.com/github/memex/issues/1" />, {
      wrapper: sidePanelWrapper,
    })

    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalled())
    const comment = await screen.findByTestId(`comments-box-${DefaultOpenSidePanelMetadata.comments![0].id}`)

    const actionMenu = await within(comment).findByTestId('comment-overflow-menu-button')
    expect(actionMenu).toBeInTheDocument()
    await user.click(actionMenu)
    const editComment = await screen.findByTestId(`overflow-menu-edit-button`)
    expect(editComment).toBeInTheDocument()
    await user.click(editComment)

    // change the content
    const content = within(comment).getByRole('textbox')
    const saveCommentButton = await within(comment).findByTestId('save-button')

    await user.clear(content)
    await user.type(content, ' ')
    expect(content).toHaveValue(' ')
    expect(saveCommentButton).toBeDisabled()

    await user.clear(content)
    await user.type(content, 'new content')
    expect(saveCommentButton).toBeEnabled()

    // click the save comment button
    await user.click(saveCommentButton)

    // wait for the request to finish
    await waitFor(() =>
      expect(editCommentStub).toHaveBeenCalledWith({
        kind: 'issue',
        itemId: DefaultOpenIssue.id,
        repositoryId: DefaultOpenIssue.contentRepositoryId,
        commentId: DefaultOpenSidePanelMetadata.comments![0].id,
        body: 'new content',
      }),
    )
    await waitFor(() =>
      expect(postStatsStub).toHaveBeenCalledWith({
        payload: {
          name: 'side_panel_edit_comment',
          context: JSON.stringify({contentType: 'Issue'}),
        },
      }),
    )
  })
})
