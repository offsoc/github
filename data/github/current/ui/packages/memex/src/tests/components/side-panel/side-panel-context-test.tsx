/* eslint eslint-comments/no-use: off */

import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {createMockEnvironment} from 'relay-test-utils'

import {apiPostStats} from '../../../client/api/stats/api-post-stats'
import {TitleRenderer} from '../../../client/components/react_table/renderers/title-renderer'
import {withValue} from '../../../client/models/column-value'
import {RelayProvider} from '../../../client/state-providers/relay'
import {stubResolvedApiResponse} from '../../mocks/api/memex'
import {getDraftIssueModel, setupEnvironment} from './side-panel-test-helpers'

jest.mock('../../../client/api/stats/api-post-stats')

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom')
  return {
    ...originalModule,
    useSearchParams: jest.fn().mockImplementation(() => {
      return [new URLSearchParams(), jest.fn()]
    }),
  }
})

describe('SidePanelContext', () => {
  it('opening the item pane posts the draft_open stat', async () => {
    const user = userEvent.setup()
    const {wrapper, itemModels} = setupEnvironment()
    const item = getDraftIssueModel(itemModels)
    const postStatsStub = stubResolvedApiResponse(apiPostStats, {success: true})

    const titleValue = item.columns.Title
    const environment = createMockEnvironment()
    render(
      <RelayProvider environment={environment}>
        <TitleRenderer currentValue={withValue(titleValue!)} model={item} />,
      </RelayProvider>,
      {wrapper},
    )

    const cell = await screen.findByText('Implement draft issue editor', {exact: false})
    await user.click(cell)

    expect(postStatsStub).toHaveBeenCalledWith({
      payload: {
        memexProjectItemId: item.id,
        name: 'draft_open',
      },
    })
    expect(postStatsStub).toHaveBeenCalledWith({
      payload: {
        name: 'side_panel_table_open',
        context: JSON.stringify({contentType: 'DraftIssue'}),
      },
    })
  })
})
