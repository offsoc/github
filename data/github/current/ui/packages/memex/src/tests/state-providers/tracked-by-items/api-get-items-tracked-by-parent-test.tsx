import {IssueState, IssueStateReason} from '../../../client/api/common-contracts'
import {apiGetItemsTrackedByParent} from '../../../client/api/memex-items/api-get-items-tracked-by-parent'
import {DefaultOpenIssue} from '../../../mocks/memex-items'
import {stubGetItemsTrackedByParent} from '../../mocks/api/memex-items'

describe('apiGetItemsTrackedByParent', () => {
  it('returns results obtained from  server request', async () => {
    const mockTrackedItemsByParent = {
      count: 1,
      items: [
        {
          uuid: 'b7180bad-5c02-4073-96e4-b30cb0fdd5bd',
          itemId: 3,
          title: 'child 2',
          state: IssueState.Open,
          stateReason: IssueStateReason.NotPlanned,
          url: 'http://github.localhost:56055/github/public-server/issues/3',
          displayNumber: 3,
          repositoryId: 3,
          repositoryName: 'public-server',
          ownerLogin: 'github',
          assignees: [],
          labels: [],
          position: 400,
          ownerId: 3,
        },
        {
          uuid: 'b7180bad-5c02-4073-96e4-b30cb0fdd5bd',
          itemId: 4,
          title: 'child 3',
          state: IssueState.Closed,
          stateReason: IssueStateReason.Completed,
          url: 'http://github.localhost:56055/github/public-server/issues/4',
          displayNumber: 4,
          repositoryId: 4,
          repositoryName: 'public-server',
          ownerLogin: 'github',
          assignees: [],
          labels: [],
          position: 500,
          ownerId: 3,
        },
      ],
      parentCompletion: {
        total: 2,
        completed: 1,
        percent: 50,
      },
    }

    const getItemsTrackedByParentStub = stubGetItemsTrackedByParent(mockTrackedItemsByParent)

    const response = await apiGetItemsTrackedByParent({issueId: DefaultOpenIssue.id})

    expect(response).toEqual(mockTrackedItemsByParent)
    expect(getItemsTrackedByParentStub).toHaveBeenCalledTimes(1)
  })
})
