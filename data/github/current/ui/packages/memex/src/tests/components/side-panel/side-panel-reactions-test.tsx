/* eslint eslint-comments/no-use: off */

import {act, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {Role} from '../../../client/api/common-contracts'
import {ItemType} from '../../../client/api/memex-items/item-type'
import {ReactionEmotion} from '../../../client/api/side-panel/contracts'
import {apiPostStats} from '../../../client/api/stats/api-post-stats'
import {SidePanelReactions} from '../../../client/components/side-panel/reactions'
import {overrideDefaultPrivileges} from '../../../client/helpers/viewer-privileges'
import {useEnabledFeatures} from '../../../client/hooks/use-enabled-features'
import {IssueStateProvider} from '../../../client/state-providers/issues/issue-state-provider'
import {useIssueContext} from '../../../client/state-providers/issues/use-issue-context'
import {DefaultOpenIssue, DefaultOpenSidePanelMetadata} from '../../../mocks/memex-items'
import {stubResolvedApiResponse} from '../../mocks/api/memex'
import {stubGetSidePanelMetadata, stubUpdateSidePanelItemReaction} from '../../mocks/api/side-panel'
import {asMockHook} from '../../mocks/stub-utilities'
import {setupEnvironment} from './side-panel-test-helpers'

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

const getSidePanelWrapperWithMock = (issueId: number, repositoryId: number) => {
  const {wrapper} = setupEnvironment()
  const InnerWrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => {
    return (
      <IssueStateProvider itemId={issueId} repositoryId={repositoryId} contentType={ItemType.Issue}>
        {children}
      </IssueStateProvider>
    )
  }
  const sidePanelWrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => {
    return wrapper({
      children: <InnerWrapper>{children}</InnerWrapper>,
    })
  }
  return sidePanelWrapper
}

let user: ReturnType<typeof userEvent.setup>
describe('Side Panel Reactions', () => {
  beforeEach(() => {
    asMockHook(useEnabledFeatures).mockReturnValue({})
    user = userEvent.setup()
  })

  it('can renders reactions in sidepanel reaction component', async () => {
    render(<SidePanelReactions reactions={DefaultOpenSidePanelMetadata.reactions!} onReact={jest.fn()} />, {
      wrapper: getSidePanelWrapperWithMock(DefaultOpenIssue.id, DefaultOpenIssue.contentRepositoryId),
    })

    const reactionsBox = await screen.findByTestId(`reactions-toolbar`)
    expect(reactionsBox).toBeInTheDocument()

    const reactionData = await screen.findByTestId(`rocket-reaction-button`)
    expect(reactionData).toBeInTheDocument()
    expect(reactionData.textContent).toBe('🚀1')
  })

  it('makes a request to the server to update reactions', async () => {
    const {wrapper} = setupEnvironment(undefined, undefined, {
      'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Write}),
    })

    const BodyAndHook = () => {
      const {reactToSidePanelItem} = useIssueContext()

      return (
        <>
          <SidePanelReactions reactions={DefaultOpenSidePanelMetadata.reactions!} onReact={reactToSidePanelItem} />
        </>
      )
    }

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

    const postStatsStub = stubResolvedApiResponse(apiPostStats, {success: true})
    stubGetSidePanelMetadata(DefaultOpenSidePanelMetadata)

    // eslint-disable-next-line testing-library/no-unnecessary-act, @typescript-eslint/require-await
    await act(async () => {
      render(<BodyAndHook />, {
        wrapper: sidePanelWrapper,
      })
    })

    const updateSidePanelItemReactionStub = stubUpdateSidePanelItemReaction()

    const reactionsBox = await screen.findByTestId(`reactions-toolbar`)
    expect(reactionsBox).toBeInTheDocument()

    const reactionData = await screen.findByTestId(`rocket-reaction-button`)
    expect(reactionData).toBeInTheDocument()
    await user.click(reactionData)

    expect(updateSidePanelItemReactionStub).toHaveBeenCalledWith({
      actor: 'test-user',
      command: 'react',
      kind: 'issue',
      reaction: ReactionEmotion.ROCKET,
      itemId: DefaultOpenIssue.id,
      repositoryId: DefaultOpenIssue.contentRepositoryId,
    })
    await waitFor(() =>
      expect(postStatsStub).toHaveBeenCalledWith({
        payload: {
          name: 'side_panel_react',
          context: JSON.stringify({contentType: 'Issue', command: 'react', subject: 'issue'}),
        },
      }),
    )
  })
})
