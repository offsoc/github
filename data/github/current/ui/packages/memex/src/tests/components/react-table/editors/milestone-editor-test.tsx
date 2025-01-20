import type {ItemProps} from '@primer/react/lib-esm/deprecated/ActionList/Item'
import {SelectPanel} from '@primer/react/lib-esm/SelectPanel/SelectPanel'
import {render, screen, waitFor, within} from '@testing-library/react'

import {SystemColumnId} from '../../../../client/api/columns/contracts/memex-column'
import {MilestoneEditor} from '../../../../client/components/react_table/editors/milestone-editor'
import {usePostStats} from '../../../../client/hooks/common/use-post-stats'
import {useUpdateItem} from '../../../../client/hooks/use-update-item'
import {EmptyValue} from '../../../../client/models/column-value'
import {createMemexItemModel, type IssueModel, type PullRequestModel} from '../../../../client/models/memex-item-model'
import {mockSuggestedMilestones} from '../../../../mocks/data/milestones'
import {DefaultOpenIssue, DefaultOpenPullRequest} from '../../../../mocks/memex-items'
import {stubGetSuggestedMilestones} from '../../../mocks/api/memex-items'
import {mockSelectPanel} from '../../../mocks/components/select-panel-component'
import {asMockComponent, asMockHook} from '../../../mocks/stub-utilities'
import {createWrapper} from './helpers'

jest.mock('../../../../client/hooks/use-update-item')
jest.mock('../../../../client/hooks/common/use-post-stats')
jest.mock('../../../../client/components/react_table/renderers/milestone-renderer')
jest.mock('@primer/react/lib-esm/SelectPanel/SelectPanel')

let someIssue
let somePullRequest
let model: IssueModel
let anotherModel: PullRequestModel

async function waitForSuggestionsToLoad() {
  const selectPanel = screen.getByTestId('select-panel')
  await waitFor(() => within(selectPanel).getByText('v0.1', {exact: false}))
}

describe('MilestoneEditor', () => {
  beforeEach(() => {
    someIssue = DefaultOpenIssue
    somePullRequest = DefaultOpenPullRequest
    model = createMemexItemModel(someIssue) as IssueModel
    anotherModel = createMemexItemModel(somePullRequest) as PullRequestModel

    asMockHook(useUpdateItem).mockReturnValue({updateItem: jest.fn()})
    asMockHook(usePostStats).mockReturnValue({postStats: jest.fn()})
    asMockComponent(SelectPanel).mockImplementation(mockSelectPanel())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('rendering MilestoneEditor will fetch suggested milestones', async () => {
    const getSuggestedMilestonesStub = stubGetSuggestedMilestones(mockSuggestedMilestones)

    render(
      <MilestoneEditor currentValue={EmptyValue} model={model} columnId={SystemColumnId.Milestone} rowIndex={1} />,
      {
        wrapper: createWrapper(),
      },
    )

    await waitForSuggestionsToLoad()

    expect(getSuggestedMilestonesStub).toHaveBeenCalledTimes(1)

    const suggestedMilestonesFromMock = mockSuggestedMilestones.map(milestone => milestone.title)
    const suggestedMilestonesFromProps = asMockComponent(SelectPanel).mock.calls[2][0].items.map((item: ItemProps) => {
      return item.text
    })
    expect(suggestedMilestonesFromMock).toEqual(expect.arrayContaining(suggestedMilestonesFromProps))
  })

  it('rendering MilestoneEditor again with the same model will use a cached version of the fetched suggested milestones', async () => {
    const getSuggestedMilestonesStub = stubGetSuggestedMilestones(mockSuggestedMilestones)

    const {rerender} = render(
      <MilestoneEditor currentValue={EmptyValue} model={model} columnId={SystemColumnId.Milestone} rowIndex={1} />,
      {
        wrapper: createWrapper(),
      },
    )

    await waitForSuggestionsToLoad()

    rerender(
      <MilestoneEditor currentValue={EmptyValue} model={model} columnId={SystemColumnId.Milestone} rowIndex={2} />,
    )

    expect(getSuggestedMilestonesStub).toHaveBeenCalledTimes(1)
  })

  it('rendering MilestoneEditor again with a different model will fetch suggested milestones for that model', async () => {
    const getSuggestedMilestonesStub = stubGetSuggestedMilestones(mockSuggestedMilestones)

    const {rerender} = render(
      <MilestoneEditor currentValue={EmptyValue} model={model} columnId={SystemColumnId.Milestone} rowIndex={1} />,
      {
        wrapper: createWrapper(),
      },
    )

    await waitForSuggestionsToLoad()

    rerender(
      <MilestoneEditor
        currentValue={EmptyValue}
        model={anotherModel}
        columnId={SystemColumnId.Milestone}
        rowIndex={1}
      />,
    )

    await waitForSuggestionsToLoad()

    expect(getSuggestedMilestonesStub).toHaveBeenCalledTimes(2)
  })
})
