import type {ItemProps} from '@primer/react/lib-esm/deprecated/ActionList/Item'
import {SelectPanel} from '@primer/react/lib-esm/SelectPanel/SelectPanel'
import {render, screen, waitFor, within} from '@testing-library/react'

import {SystemColumnId} from '../../../../client/api/columns/contracts/memex-column'
import {AssigneesEditor} from '../../../../client/components/react_table/editors'
import {usePostStats} from '../../../../client/hooks/common/use-post-stats'
import {useUpdateItem} from '../../../../client/hooks/use-update-item'
import {withValue} from '../../../../client/models/column-value'
import {createMemexItemModel, type IssueModel} from '../../../../client/models/memex-item-model'
import {mockSuggestedAssignees} from '../../../../mocks/data/users'
import {DefaultOpenIssue, DefaultOpenPullRequest} from '../../../../mocks/memex-items'
import {stubGetSuggestedAssignees} from '../../../mocks/api/memex-items'
import {mockSelectPanel} from '../../../mocks/components/select-panel-component'
import {asMockComponent, asMockHook} from '../../../mocks/stub-utilities'
import {createWrapper} from './helpers'

jest.mock('../../../../client/hooks/use-update-item')
jest.mock('../../../../client/hooks/common/use-post-stats')
jest.mock('../../../../client/components/react_table/renderers/assignees-renderer')
jest.mock('@primer/react/lib-esm/SelectPanel/SelectPanel')

let someIssue
let anotherIssue
let model: IssueModel
let anotherModel: IssueModel

async function waitForSuggestionsToLoad() {
  const selectPanel = screen.getByTestId('select-panel')
  await waitFor(() => within(selectPanel).getByText('dmarcey', {exact: false}))
}

describe('AssigneesEditor', () => {
  beforeEach(() => {
    someIssue = DefaultOpenIssue
    anotherIssue = DefaultOpenPullRequest
    model = createMemexItemModel(someIssue) as IssueModel
    anotherModel = createMemexItemModel(anotherIssue) as IssueModel

    asMockHook(useUpdateItem).mockReturnValue({updateItem: jest.fn()})
    asMockHook(usePostStats).mockReturnValue({postStats: jest.fn()})
    asMockComponent(SelectPanel).mockImplementation(mockSelectPanel())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('rendering AssigneesEditor will fetch suggested assignees', async () => {
    const getSuggestedAssigneesStub = stubGetSuggestedAssignees(mockSuggestedAssignees)

    render(
      <AssigneesEditor currentValue={withValue([])} model={model} columnId={SystemColumnId.Assignees} rowIndex={1} />,
      {
        wrapper: createWrapper(),
      },
    )

    await waitForSuggestionsToLoad()

    expect(getSuggestedAssigneesStub).toHaveBeenCalledTimes(1)

    const suggestedAssigneesFromMock = mockSuggestedAssignees.map(assignee => assignee.login)
    const suggestedAssigneesFromProps = asMockComponent(SelectPanel).mock.calls[1][0].items.map(
      (item: ItemProps) => item.text,
    )
    expect(suggestedAssigneesFromMock).toEqual(expect.arrayContaining(suggestedAssigneesFromProps))
  })

  it('rendering AssigneesEditor again with the same model will use a cached version of the fetched suggested assignees', async () => {
    const getSuggestedAssigneesStub = stubGetSuggestedAssignees(mockSuggestedAssignees)

    const {rerender} = render(
      <AssigneesEditor currentValue={withValue([])} model={model} columnId={SystemColumnId.Assignees} rowIndex={1} />,
      {
        wrapper: createWrapper(),
      },
    )

    await waitForSuggestionsToLoad()

    rerender(
      <AssigneesEditor currentValue={withValue([])} model={model} columnId={SystemColumnId.Assignees} rowIndex={2} />,
    )

    expect(getSuggestedAssigneesStub).toHaveBeenCalledTimes(1)
  })

  it('rendering AssigneesEditor again with a different model will fetch suggested assignees for that model', async () => {
    const getSuggestedAssigneesStub = stubGetSuggestedAssignees(mockSuggestedAssignees)

    const {rerender} = render(
      <AssigneesEditor currentValue={withValue([])} model={model} columnId={SystemColumnId.Assignees} rowIndex={1} />,
      {
        wrapper: createWrapper(),
      },
    )

    await waitForSuggestionsToLoad()

    /**
     * Note that `anotherModel` used here is actually a PullRequest (created at the top of the file).
     * We need the model's contentType to change, in order to properly trigger a re-render in this
     * test.
     *
     * The recommendation from react library, is to rather than rerendering with different props,
     * we should render the wrapping component and make it trigger the necessary changes.
     *
     * But in this case, the component hierarchy is complex, due to the generic logic of rendering
     * our table. Using an issue of a different contentType was an easy work around this complexity.
     */
    rerender(
      <AssigneesEditor
        currentValue={withValue([])}
        model={anotherModel}
        columnId={SystemColumnId.Assignees}
        rowIndex={1}
      />,
    )

    await waitForSuggestionsToLoad()

    expect(getSuggestedAssigneesStub).toHaveBeenCalledTimes(2)
  })
})
