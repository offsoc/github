import {RelayEnvironmentProvider} from 'react-relay'
import {createMockEnvironment} from 'relay-test-utils'
import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen} from '@testing-library/react'

import {UsageSearchBar} from '../../../components/usage'

import {GITHUB_INC_CUSTOMER, ORGANIZATION_CUSTOMER} from '../../../test-utils/mock-data'

describe('UsageSearchBar', () => {
  test('Renders a usage search bar and updates the search query with input change', async () => {
    const setSearchQueryMock = jest.fn()
    const environment = createMockEnvironment()
    jest.useFakeTimers()

    render(
      <RelayEnvironmentProvider environment={environment}>
        <UsageSearchBar
          searchQuery=""
          setSearchQuery={setSearchQueryMock}
          customer={GITHUB_INC_CUSTOMER}
          useUsageChartDataEndpoint={false}
        />
      </RelayEnvironmentProvider>,
    )

    const input = screen.getByRole('combobox')
    fireEvent.change(input, {target: {value: 'org:github'}})

    jest.runAllTimers()
    expect(setSearchQueryMock).toHaveBeenCalledTimes(1)
    expect(setSearchQueryMock).toHaveBeenCalledWith('org:github')
  })

  test('Renders a usage search bar and does not set the search query if there are two filters', async () => {
    const setSearchQueryMock = jest.fn()
    const environment = createMockEnvironment()

    render(
      <RelayEnvironmentProvider environment={environment}>
        <UsageSearchBar
          searchQuery=""
          setSearchQuery={setSearchQueryMock}
          customer={GITHUB_INC_CUSTOMER}
          useUsageChartDataEndpoint={false}
        />
      </RelayEnvironmentProvider>,
    )

    const input = screen.getByRole('combobox')
    fireEvent.change(input, {target: {value: 'org:github repo:github'}})

    expect(setSearchQueryMock).toHaveBeenCalledTimes(0)
  })

  test('Does not add "organization" to suggested filters if the customer is an organization', async () => {
    const setSearchQueryMock = jest.fn()
    const environment = createMockEnvironment()

    render(
      <RelayEnvironmentProvider environment={environment}>
        <UsageSearchBar
          searchQuery=""
          setSearchQuery={setSearchQueryMock}
          customer={ORGANIZATION_CUSTOMER}
          useUsageChartDataEndpoint={false}
        />
      </RelayEnvironmentProvider>,
    )

    // Simulate the onRequestProvider event by focusing on the input element
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)

    // Query the DOM for the specific <span> elements with the class and text
    const repositoryFilter = await screen.findByText((content, element) => {
      return (
        element !== null &&
        element.tagName.toLowerCase() === 'span' &&
        element.classList.contains('ActionListItem-label') &&
        content.includes('Repository')
      )
    })
    const organizationFilter = screen.queryByText((content, element) => {
      return (
        element !== null &&
        element.tagName.toLowerCase() === 'span' &&
        element.classList.contains('ActionListItem-label') &&
        content.includes('Organization')
      )
    })
    expect(repositoryFilter).toBeInTheDocument()
    expect(organizationFilter).not.toBeInTheDocument()
  })
})
