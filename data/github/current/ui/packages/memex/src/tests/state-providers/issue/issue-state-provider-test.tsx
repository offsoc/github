import {testIdProps} from '@github-ui/test-id-props'
import {render, screen, waitFor} from '@testing-library/react'

import {ItemType} from '../../../client/api/memex-items/item-type'
import {ItemKeyType} from '../../../client/api/side-panel/contracts'
import {IssueStateProvider} from '../../../client/state-providers/issues/issue-state-provider'
import {useIssueContext} from '../../../client/state-providers/issues/use-issue-context'
import {ProjectNumberContext} from '../../../client/state-providers/memex/memex-state-provider'
import {DefaultOpenIssue, DefaultOpenSidePanelMetadata} from '../../../mocks/memex-items'
import {InitialItems} from '../../../stories/data-source'
import {createMockEnvironment} from '../../create-mock-environment'
import {stubGetSidePanelMetadata} from '../../mocks/api/side-panel'
import {QueryClientWrapper} from '../../test-app-wrapper'

function getWrapper() {
  const Wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => {
    return (
      <QueryClientWrapper>
        <ProjectNumberContext.Provider value={{projectNumber: 123}}>
          <IssueStateProvider
            itemId={DefaultOpenIssue.id}
            repositoryId={DefaultOpenIssue.contentRepositoryId}
            contentType={ItemType.Issue}
          >
            {children}
          </IssueStateProvider>
        </ProjectNumberContext.Provider>
      </QueryClientWrapper>
    )
  }
  return Wrapper
}

describe('IssueStateProvider', () => {
  beforeEach(() => {
    createMockEnvironment({
      jsonIslandData: {
        'memex-items-data': InitialItems,
        'memex-enabled-features': ['tasklist_block'],
      },
    })
  })

  it('should make a request to get issue comments when initialized', async () => {
    const TestElement = () => {
      const {sidePanelMetadata} = useIssueContext()
      if (sidePanelMetadata.itemKey.kind !== ItemKeyType.ISSUE) throw new Error("Item key isn't issue")
      return <span {...testIdProps('issue-metadata')}>{sidePanelMetadata.itemKey.itemId}</span>
    }

    const getMetadataStub = stubGetSidePanelMetadata(DefaultOpenSidePanelMetadata)

    render(<TestElement />, {
      wrapper: getWrapper(),
    })

    await waitFor(() => {
      expect(screen.getByTestId('issue-metadata').textContent).toBe(`${DefaultOpenIssue.id}`)
    })

    expect(getMetadataStub).toHaveBeenCalledTimes(1)
  })

  it('should make a request to get issue hierarchy when initialized', async () => {
    const TestElement = () => {
      const {sidePanelMetadata} = useIssueContext()
      if (sidePanelMetadata.itemKey.kind !== ItemKeyType.ISSUE) throw new Error("Item key isn't issue")
      return <span {...testIdProps('issue-metadata')}>{sidePanelMetadata.itemKey.itemId}</span>
    }

    stubGetSidePanelMetadata(DefaultOpenSidePanelMetadata)
    render(<TestElement />, {
      wrapper: getWrapper(),
    })

    await waitFor(() => {
      expect(screen.getByTestId('issue-metadata').textContent).toBe(`${DefaultOpenIssue.id}`)
    })
  })

  it('should make a request to sidepanel metadata when initialized', async () => {
    const TestElement = () => {
      const {sidePanelMetadata} = useIssueContext()
      if (sidePanelMetadata.itemKey.kind !== ItemKeyType.ISSUE) throw new Error("Item key isn't issue")
      return <span {...testIdProps('issue-metadata')}>{sidePanelMetadata.itemKey.itemId}</span>
    }

    const getSidePanelContentStub = stubGetSidePanelMetadata(DefaultOpenSidePanelMetadata)
    render(<TestElement />, {
      wrapper: getWrapper(),
    })

    await waitFor(() => {
      expect(screen.getByTestId('issue-metadata').textContent).toBe(`${DefaultOpenIssue.id}`)
    })

    expect(getSidePanelContentStub).toHaveBeenCalledTimes(1)
  })
})
