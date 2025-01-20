import type {ItemProps} from '@primer/react/lib-esm/deprecated/ActionList/Item'
import {SelectPanel} from '@primer/react/lib-esm/SelectPanel/SelectPanel'
import {render, screen, waitFor, within} from '@testing-library/react'

import {SystemColumnId} from '../../../../client/api/columns/contracts/memex-column'
import type {SuggestedLabel} from '../../../../client/api/memex-items/contracts'
import {LabelsEditor} from '../../../../client/components/react_table/editors/labels-editor'
import {usePostStats} from '../../../../client/hooks/common/use-post-stats'
import {useUpdateItem} from '../../../../client/hooks/use-update-item'
import {EmptyValue, withValue} from '../../../../client/models/column-value'
import {createMemexItemModel, type IssueModel, type PullRequestModel} from '../../../../client/models/memex-item-model'
import {mockSuggestedLabels} from '../../../../mocks/data/labels'
import {DefaultOpenIssue, DefaultOpenPullRequest, OpenPullRequestInPrivateRepo} from '../../../../mocks/memex-items'
import {stubGetSuggestedLabels} from '../../../mocks/api/memex-items'
import {mockSelectPanel} from '../../../mocks/components/select-panel-component'
import {asMockComponent, asMockHook} from '../../../mocks/stub-utilities'
import {createWrapper} from './helpers'

jest.mock('../../../../client/hooks/use-update-item')
jest.mock('../../../../client/hooks/common/use-post-stats')
jest.mock('../../../../client/components/react_table/renderers/labels-renderer')
jest.mock('@primer/react/lib-esm/SelectPanel/SelectPanel')

let someIssue
let somePullRequest
let model: IssueModel
let anotherModel: PullRequestModel

async function waitForSuggestionsToLoad() {
  const selectPanel = screen.getByTestId('select-panel')
  await waitFor(() => within(selectPanel).getByText('frontend', {exact: false}))
}

describe('LabelsEditor', () => {
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

  it('rendering LabelsEditor will fetch suggested labels', async () => {
    const getSuggestedLabelsStub = stubGetSuggestedLabels(mockSuggestedLabels)
    render(<LabelsEditor currentValue={withValue([])} model={model} columnId={SystemColumnId.Labels} rowIndex={1} />, {
      wrapper: createWrapper(),
    })

    await waitForSuggestionsToLoad()

    expect(getSuggestedLabelsStub).toHaveBeenCalledTimes(1)

    const suggestedLabelsFromMock = mockSuggestedLabels.map(label => label.name)
    const suggestedLabelsFromProps = asMockComponent(SelectPanel).mock.calls[1][0].items.map(
      (item: ItemProps & SuggestedLabel) => {
        return item.name
      },
    )
    expect(suggestedLabelsFromMock).toEqual(expect.arrayContaining(suggestedLabelsFromProps))
  })

  it('rendering LabelsEditor again with the same model will use a cached version of the fetched suggested labels', async () => {
    const getSuggestedLabelsStub = stubGetSuggestedLabels(mockSuggestedLabels)

    const {rerender} = render(
      <LabelsEditor currentValue={withValue([])} model={model} columnId={SystemColumnId.Labels} rowIndex={1} />,
      {
        wrapper: createWrapper(),
      },
    )

    await waitForSuggestionsToLoad()

    rerender(<LabelsEditor currentValue={withValue([])} model={model} columnId={SystemColumnId.Labels} rowIndex={2} />)

    expect(getSuggestedLabelsStub).toHaveBeenCalledTimes(1)
  })

  it('rendering LabelsEditor again with a different model will refetch suggested labels even if they share a repository', async () => {
    const getSuggestedLabelsStub = stubGetSuggestedLabels(mockSuggestedLabels)

    const {rerender} = render(
      <LabelsEditor currentValue={withValue([])} model={model} columnId={SystemColumnId.Labels} rowIndex={1} />,
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
      <LabelsEditor currentValue={EmptyValue} model={anotherModel} columnId={SystemColumnId.Labels} rowIndex={1} />,
    )

    await waitForSuggestionsToLoad()

    expect(getSuggestedLabelsStub).toHaveBeenCalledTimes(2)
  })

  it('rendering LabelsEditor again with a different model will suggested labels if they do not share a repository', async () => {
    const getSuggestedLabelsStub = stubGetSuggestedLabels(mockSuggestedLabels)

    const {rerender} = render(
      <LabelsEditor currentValue={withValue([])} model={model} columnId={SystemColumnId.Labels} rowIndex={1} />,
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

    const otherRepoModel = createMemexItemModel(OpenPullRequestInPrivateRepo) as PullRequestModel
    rerender(
      <LabelsEditor currentValue={EmptyValue} model={otherRepoModel} columnId={SystemColumnId.Labels} rowIndex={1} />,
    )

    await waitForSuggestionsToLoad()

    expect(getSuggestedLabelsStub).toHaveBeenCalledTimes(2)
  })
})
