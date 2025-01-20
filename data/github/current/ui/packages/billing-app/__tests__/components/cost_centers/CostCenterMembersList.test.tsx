import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {createMockEnvironment} from 'relay-test-utils'
import {RelayEnvironmentProvider} from 'react-relay'
import CostCenterMembersList from '../../../components/cost_centers/CostCenterMembersList'
import {USER_RESOURCE_LIST, mockCostCenterUserQueries} from '../../../test-utils/mock-data'

describe('CostCenterMembersList', () => {
  test('renders members list', async () => {
    const environment = createMockEnvironment()
    mockCostCenterUserQueries(environment)
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(() => {
      render(
        <RelayEnvironmentProvider environment={environment}>
          <CostCenterMembersList resources={USER_RESOURCE_LIST} />
        </RelayEnvironmentProvider>,
      )
    })

    expect(screen.getByTestId('members-list-wrapper')).toBeVisible()
    expect(screen.getByTestId('members-list-header')).toHaveTextContent('Members')
    const membersList = screen.getByTestId('selected-rows-list')
    expect(membersList).toBeVisible()
    const listItem = membersList.childNodes[0]
    expect(listItem).toHaveTextContent(USER_RESOURCE_LIST[0]!.id)
    expect(screen.getByTestId('selected-rows-count')).toHaveTextContent(USER_RESOURCE_LIST.length.toString())
  })
})
