/* eslint eslint-comments/no-use: off */
import {act, render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {IssueState, IssueStateReason, Role} from '../../../client/api/common-contracts'
import {ItemType} from '../../../client/api/memex-items/item-type'
import {type IssueKey, ItemKeyType} from '../../../client/api/side-panel/contracts'
import {apiPostStats} from '../../../client/api/stats/api-post-stats'
import {SidePanelAddComment} from '../../../client/components/side-panel/add-comment'
import {overrideDefaultPrivileges} from '../../../client/helpers/viewer-privileges'
import {IssueStateProvider} from '../../../client/state-providers/issues/issue-state-provider'
import {Resources} from '../../../client/strings'
import {DefaultClosedSidePanelMetadata, DefaultOpenSidePanelMetadata} from '../../../mocks/memex-items'
import {stubResolvedApiResponse} from '../../mocks/api/memex'
import {stubAddComment, stubGetSidePanelMetadata, stubUpdateSidePanelItemState} from '../../mocks/api/side-panel'
import {setupEnvironment} from './side-panel-test-helpers'

jest.mock('../../../client/api/stats/api-post-stats')

jest.mock('@github-ui/get-os', () => ({
  ...jest.requireActual('@github-ui/get-os'),
  isMacOS: () => true,
}))

// used internally by the markdown editor
jest.mock('@primer/behaviors/utils', () => ({
  ...jest.requireActual('@primer/behaviors/utils'),
  isMacOS: () => true,
}))

let user: ReturnType<typeof userEvent.setup>

async function addComment() {
  // change the content
  const content = screen.getByRole('textbox')
  await user.type(content, 'new content')

  // click the add comment button
  const addCommentButton = await screen.findByTestId(`add-comment-button`)
  await user.click(addCommentButton)
}

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom')
  return {
    ...originalModule,
    useSearchParams: jest.fn().mockImplementation(() => {
      return [new URLSearchParams(), jest.fn()]
    }),
  }
})
describe('Side Panel Issue Comments', () => {
  beforeEach(() => {
    user = userEvent.setup()
  })
  async function renderSidePanel(metadata = DefaultOpenSidePanelMetadata) {
    const {itemId, repositoryId} = metadata.itemKey as IssueKey
    const {wrapper: Wrapper} = setupEnvironment(undefined, undefined, {
      'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Write}),
    })

    const postStatsStub = stubResolvedApiResponse(apiPostStats, {success: true})
    const getSidePanelMetadataStub = stubGetSidePanelMetadata(metadata)
    const addCommentStub = stubAddComment(metadata.comments![0])
    const updateItemStateStub = stubUpdateSidePanelItemState()

    const sidePanelWrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => {
      return (
        <Wrapper>
          <IssueStateProvider itemId={itemId} repositoryId={repositoryId} contentType={ItemType.Issue}>
            {children}
          </IssueStateProvider>
        </Wrapper>
      )
    }

    // eslint-disable-next-line testing-library/no-unnecessary-act, @typescript-eslint/require-await
    await act(async () => {
      render(<SidePanelAddComment />, {
        wrapper: sidePanelWrapper,
      })
    })

    await waitFor(() => expect(getSidePanelMetadataStub).toHaveBeenCalled())
    return {postStatsStub, addCommentStub, updateItemStateStub, itemId, repositoryId}
  }

  describe('Adding comment', () => {
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('makes a request to server when a comment is added from UI', async () => {
      const {postStatsStub, addCommentStub, itemId, repositoryId} = await renderSidePanel()

      await addComment()
      await waitFor(() =>
        expect(addCommentStub).toHaveBeenCalledWith({
          kind: 'issue',
          itemId,
          repositoryId,
          comment: 'new content',
        }),
      )

      await waitFor(() =>
        expect(postStatsStub).toHaveBeenCalledWith({
          payload: {
            name: 'side_panel_post_comment',
            context: JSON.stringify({contentType: 'Issue'}),
          },
        }),
      )
    })

    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('cannot make a request to server when there is no comment using the UI', async () => {
      const {postStatsStub, addCommentStub} = await renderSidePanel()

      const addCommentButton = await screen.findByTestId(`add-comment-button`)

      expect(addCommentButton).toBeDisabled()
      await waitFor(() => expect(addCommentStub).not.toHaveBeenCalled())
      await waitFor(() => expect(postStatsStub).not.toHaveBeenCalled())
    })

    it('unable to comment when only spaces are submitted in comment', async () => {
      const {postStatsStub, addCommentStub} = await renderSidePanel()

      await userEvent.type(screen.getByRole('textbox'), '       ')

      const addCommentButton = await screen.findByTestId(`add-comment-button`)

      expect(addCommentButton).toBeDisabled()
      await waitFor(() => expect(addCommentStub).not.toHaveBeenCalled())
      await waitFor(() => expect(postStatsStub).not.toHaveBeenCalled())
    })

    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('makes a request to server when a comment is submitted using keyboard shortcut', async () => {
      const {postStatsStub, addCommentStub} = await renderSidePanel()

      await userEvent.type(screen.getByRole('textbox'), 'new content{Meta>}{Enter}{/Meta}')

      // make sure it doesn't submit multiple times
      await userEvent.type(screen.getByRole('textbox'), '{Meta>}{Enter}{/Meta}')
      await userEvent.type(screen.getByRole('textbox'), '{Meta>}{Enter}{/Meta}')

      await waitFor(() => expect(addCommentStub).toHaveBeenCalledTimes(1))
      await waitFor(() => expect(postStatsStub).toHaveBeenCalledTimes(1))
    })

    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('cannot make a request to server when there is no comment using keyboard shortcut', async () => {
      const {postStatsStub, addCommentStub} = await renderSidePanel()

      await userEvent.type(screen.getByRole('textbox'), '{Meta>}{Enter}{/Meta}')

      await waitFor(() => expect(addCommentStub).not.toHaveBeenCalled())
      await waitFor(() => expect(postStatsStub).not.toHaveBeenCalled())
    })
  })

  describe('Close with comment keyboard shortcut', () => {
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('makes a request to server when the issue is closed with comment using keyboard shortcut', async () => {
      const {postStatsStub, addCommentStub} = await renderSidePanel()

      await userEvent.type(screen.getByRole('textbox'), 'closing with comment{Meta>}{Shift>}{Enter}{/Shift}{/Meta}')

      await waitFor(() => expect(addCommentStub).toHaveBeenCalledTimes(1))
      await waitFor(() => expect(postStatsStub).toHaveBeenCalledTimes(1))
    })

    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('makes a request to server when the issue is closed without comment using keyboard shortcut', async () => {
      const {postStatsStub, updateItemStateStub} = await renderSidePanel()

      await userEvent.click(screen.getByRole('textbox'))
      await userEvent.type(screen.getByRole('textbox'), '{Meta>}{Shift>}{Enter}{/Shift}{/Meta}')

      await waitFor(() => expect(updateItemStateStub).toHaveBeenCalledTimes(1))
      await waitFor(() => expect(postStatsStub).toHaveBeenCalledTimes(1))
    })
  })

  describe('Reopen with comment keyboard shortcut', () => {
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('makes a request to server when the issue is reopened with comment using keyboard shortcut', async () => {
      const {postStatsStub, addCommentStub} = await renderSidePanel(DefaultClosedSidePanelMetadata)

      await userEvent.click(screen.getByRole('textbox'))
      await userEvent.type(screen.getByRole('textbox'), 'reopening with comment{Meta>}{Shift>}{Enter}{/Shift}{/Meta}')

      await waitFor(() => expect(addCommentStub).toHaveBeenCalledTimes(1))
      await waitFor(() => expect(postStatsStub).toHaveBeenCalledTimes(1))
    })

    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('makes a request to server when the issue is reopened without comment using keyboard shortcut', async () => {
      const {postStatsStub, updateItemStateStub} = await renderSidePanel(DefaultClosedSidePanelMetadata)

      await userEvent.type(screen.getByRole('textbox'), '{Meta>}{Shift>}{Enter}{/Shift}{/Meta}')

      await waitFor(() => expect(updateItemStateStub).toHaveBeenCalledTimes(1))
      await waitFor(() => expect(postStatsStub).toHaveBeenCalledTimes(1))
    })
  })

  describe('Change issue state button', () => {
    it("hides close/reopen buttons when user can't take the actions", async () => {
      const sidePanelMetadataWithoutCapabilities = {
        ...DefaultOpenSidePanelMetadata,
        capabilities: DefaultOpenSidePanelMetadata.capabilities?.filter(c => c !== 'close' && c !== 'reopen'),
      }
      await renderSidePanel(sidePanelMetadataWithoutCapabilities)

      expect(screen.queryByRole('button', {name: Resources.issueButtonLabel.closeIssue})).not.toBeInTheDocument()
    })

    it('allows closing an open issue as completed', async () => {
      const {itemId, repositoryId, updateItemStateStub} = await renderSidePanel()

      const button = await screen.findByRole('button', {name: Resources.issueButtonLabel.closeIssue})
      stubGetSidePanelMetadata({
        ...DefaultClosedSidePanelMetadata,
        state: {
          state: IssueState.Closed,
          stateReason: IssueStateReason.Completed,
        },
      })
      await userEvent.click(button)

      await waitFor(() =>
        expect(updateItemStateStub).toHaveBeenNthCalledWith(1, {
          itemId,
          kind: ItemKeyType.ISSUE,
          repositoryId,
          state: IssueState.Closed,
        }),
      )

      await waitFor(async () =>
        expect(await screen.findByRole('button', {name: Resources.issueButtonLabel.reopenIssue})).toBeInTheDocument(),
      )
    })

    it('allows closing an open issue as not planned', async () => {
      const {itemId, repositoryId, updateItemStateStub} = await renderSidePanel()

      await userEvent.click(await screen.findByRole('button', {name: Resources.issueSideButtonMoreOptionsLabel}))
      await userEvent.click(screen.getByText(Resources.issueButtonLabel.closeAsNotPlanned))

      const button = await screen.findByRole('button', {name: Resources.issueButtonLabel.closeIssue})
      stubGetSidePanelMetadata({
        ...DefaultClosedSidePanelMetadata,
        state: {
          state: IssueState.Closed,
          stateReason: IssueStateReason.NotPlanned,
        },
      })
      await userEvent.click(button)

      await waitFor(() =>
        expect(updateItemStateStub).toHaveBeenNthCalledWith(1, {
          itemId,
          kind: ItemKeyType.ISSUE,
          repositoryId,
          state: IssueState.Closed,
          stateReason: IssueStateReason.NotPlanned,
        }),
      )

      await waitFor(async () =>
        expect(await screen.findByRole('button', {name: Resources.issueButtonLabel.reopenIssue})).toBeInTheDocument(),
      )
    })

    it('changes the close button label for open issues when there is a comment regardless of state reason', async () => {
      await renderSidePanel()
      await userEvent.type(within(screen.getByTestId('markdown-editor')).getByRole('textbox'), 'n/a')

      expect(await screen.findByRole('button', {name: Resources.issueButtonLabel.closeWithComment})).toBeInTheDocument()

      await userEvent.click(await screen.findByRole('button', {name: Resources.issueSideButtonMoreOptionsLabel}))
      stubGetSidePanelMetadata({
        ...DefaultClosedSidePanelMetadata,
        state: {
          state: IssueState.Closed,
          stateReason: IssueStateReason.NotPlanned,
        },
      })
      await userEvent.click(screen.getByText(Resources.issueButtonLabel.closeAsNotPlanned))

      await waitFor(async () =>
        expect(
          await screen.findByRole('button', {name: Resources.issueButtonLabel.closeWithComment}),
        ).toBeInTheDocument(),
      )
    })

    it('changes the reopen button label for closed issues when there is a comment', async () => {
      await renderSidePanel(DefaultClosedSidePanelMetadata)

      expect(await screen.findByRole('button', {name: Resources.issueButtonLabel.reopenIssue})).toBeInTheDocument()

      await userEvent.type(within(screen.getByTestId('markdown-editor')).getByRole('textbox'), 'Reopen with comment')

      expect(
        await screen.findByRole('button', {name: Resources.issueButtonLabel.reopenWithComment}),
      ).toBeInTheDocument()
    })

    it('allows reopening an issue that was closed as completed', async () => {
      const {itemId, repositoryId, updateItemStateStub} = await renderSidePanel(DefaultClosedSidePanelMetadata)

      const button = await screen.findByRole('button', {name: Resources.issueButtonLabel.reopenIssue})
      stubGetSidePanelMetadata({
        ...DefaultClosedSidePanelMetadata,
        state: {
          state: IssueState.Open,
          stateReason: IssueStateReason.Reopened,
        },
      })
      await userEvent.click(button)

      await waitFor(() =>
        expect(updateItemStateStub).toHaveBeenNthCalledWith(1, {
          itemId,
          kind: ItemKeyType.ISSUE,
          repositoryId,
          state: IssueState.Open,
          stateReason: IssueStateReason.Reopened,
        }),
      )

      await waitFor(async () =>
        expect(await screen.findByRole('button', {name: Resources.issueButtonLabel.closeIssue})).toBeInTheDocument(),
      )
    })

    it('allows changing the state reason of an issue that was closed as completed to closed as unplanned', async () => {
      const {itemId, repositoryId, updateItemStateStub} = await renderSidePanel(DefaultClosedSidePanelMetadata)

      await userEvent.click(await screen.findByRole('button', {name: Resources.issueSideButtonMoreOptionsLabel}))
      await userEvent.click(screen.getByText(Resources.issueButtonLabel.closeAsNotPlanned))

      const button = await screen.findByRole('button', {name: Resources.issueButtonLabel.closeAsNotPlanned})
      stubGetSidePanelMetadata({
        ...DefaultClosedSidePanelMetadata,
        state: {
          state: IssueState.Closed,
          stateReason: IssueStateReason.NotPlanned,
        },
      })
      await userEvent.click(button)

      await waitFor(() =>
        expect(updateItemStateStub).toHaveBeenNthCalledWith(1, {
          itemId,
          kind: ItemKeyType.ISSUE,
          repositoryId,
          state: IssueState.Closed,
          stateReason: IssueStateReason.NotPlanned,
        }),
      )

      await waitFor(async () =>
        expect(await screen.findByRole('button', {name: Resources.issueButtonLabel.reopenIssue})).toBeInTheDocument(),
      )
    })

    it('allows reopening an issue that was closed as unplanned', async () => {
      const notPlannedMetadata = {
        ...DefaultClosedSidePanelMetadata,
        state: {
          ...DefaultClosedSidePanelMetadata.state,
          stateReason: IssueStateReason.NotPlanned,
        },
      }
      const {itemId, repositoryId, updateItemStateStub} = await renderSidePanel(notPlannedMetadata)

      const button = await screen.findByRole('button', {name: Resources.issueButtonLabel.reopenIssue})
      stubGetSidePanelMetadata({
        ...notPlannedMetadata,
        state: {
          state: IssueState.Open,
          stateReason: IssueStateReason.Reopened,
        },
      })
      await userEvent.click(button)

      await waitFor(() =>
        expect(updateItemStateStub).toHaveBeenNthCalledWith(1, {
          itemId,
          kind: ItemKeyType.ISSUE,
          repositoryId,
          state: IssueState.Open,
          stateReason: IssueStateReason.Reopened,
        }),
      )

      expect(await screen.findByRole('button', {name: Resources.issueButtonLabel.closeIssue})).toBeInTheDocument()
    })

    it('allows changing the state reason of an issue that was closed as unplanned to closed as completed', async () => {
      const notPlannedMetadata = {
        ...DefaultClosedSidePanelMetadata,
        state: {
          ...DefaultClosedSidePanelMetadata.state,
          stateReason: IssueStateReason.NotPlanned,
        },
      }
      const {itemId, repositoryId, updateItemStateStub} = await renderSidePanel(notPlannedMetadata)

      await userEvent.click(await screen.findByRole('button', {name: Resources.issueSideButtonMoreOptionsLabel}))
      await userEvent.click(screen.getByText(Resources.issueButtonLabel.closeAsCompleted))

      const button = await screen.findByRole('button', {name: Resources.issueButtonLabel.closeAsCompleted})
      stubGetSidePanelMetadata({
        ...notPlannedMetadata,
        state: {
          state: IssueState.Closed,
          stateReason: IssueStateReason.Completed,
        },
      })
      await userEvent.click(button)

      await waitFor(() => {
        expect(updateItemStateStub).toHaveBeenNthCalledWith(1, {
          itemId,
          kind: ItemKeyType.ISSUE,
          repositoryId,
          state: IssueState.Closed,
        })
      })

      await waitFor(async () => {
        expect(await screen.findByRole('button', {name: Resources.issueButtonLabel.reopenIssue})).toBeInTheDocument()
      })
    })
  })
})
