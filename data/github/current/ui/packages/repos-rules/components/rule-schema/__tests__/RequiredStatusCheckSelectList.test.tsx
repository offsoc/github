import {render, type User} from '@github-ui/react-core/test-utils'
import {mockFetch} from '@github-ui/mock-fetch'
import {screen, act} from '@testing-library/react'
import {RequiredStatusCheckSelectList} from '../RequiredStatusCheckSelectList'
import type {StatusCheckSuggestion, Integration} from '../RequiredStatusCheckSelectList'

jest.useFakeTimers()

const renderComponent = ({
  integrations = [],
  ...props
}: Partial<Parameters<typeof RequiredStatusCheckSelectList>[0]> & {
  integrations?: Integration[]
} = {}) => {
  const {user} = render(
    <RequiredStatusCheckSelectList
      rulesetId={2}
      sourceType="repository"
      value={[]}
      errors={[]}
      onValueChange={jest.fn()}
      field={{
        name: 'required_status_checks',
        display_name: 'Required status checks',
        description: 'Required status checks',
        type: 'array',
        required: true,
        content_type: 'object',
        content_object: {
          name: 'required_status_checks',
          fields: [],
        },
      }}
      {...props}
    />,
    {
      pathname: '/monalisa/smile/rules/2',
    },
  )

  mockFetch.resolvePendingRequest('/monalisa/smile/rules/integration_suggestions.json', integrations)
  return {user}
}

const inputSearch = async (user: User, filter: string, statusChecks: StatusCheckSuggestion[] = []) => {
  await user.type(screen.getByPlaceholderText(/^Search for checks/), filter)

  act(() => {
    jest.runAllTimers()
  })

  await act(async () => {
    await mockFetch.resolvePendingRequest(
      `/monalisa/smile/rules/status_check_suggestions.json?query=${encodeURIComponent(filter)}`,
      statusChecks,
    )
  })
}

describe('RequiredStatusCheckSelectList', () => {
  test('should allow requiring a user created status check', async () => {
    const onValueChange = jest.fn()

    const {user} = await renderComponent({
      onValueChange,
    })

    await user.click(screen.getByRole('button', {name: /^Click to change required status check/}))
    await inputSearch(user, 'New check')

    await user.click(await screen.findByText('Add New check', undefined))
    await user.click(screen.getByText('No required checks'))

    expect(onValueChange).toHaveBeenCalledWith([{context: 'New check', integration_id: undefined}])
  })

  test('should allow requiring an existing status check', async () => {
    const onValueChange = jest.fn()

    const {user} = renderComponent({
      onValueChange,
    })

    await user.click(screen.getByRole('button', {name: /^Click to change required status check/}))
    await inputSearch(user, 'Check 1', [{context: 'Check 1'}])

    await user.click(await screen.findByText('Check 1', undefined))
    await user.click(screen.getByText('No required checks'))

    expect(onValueChange).toHaveBeenCalledWith([{context: 'Check 1', integration_id: undefined}])
  })

  test('should allow requiring multiple existing status checks', async () => {
    const onValueChange = jest.fn()

    const {user} = renderComponent({
      onValueChange,
    })

    await user.click(screen.getByRole('button', {name: /^Click to change required status check/}))
    await inputSearch(user, 'Check', [{context: 'Check 1'}, {context: 'Check 2'}])

    await user.click(await screen.findByText('Check 1', undefined))
    await user.click(screen.getByText('Check 2', undefined))
    await user.click(screen.getByText('No required checks'))

    expect(onValueChange).toHaveBeenCalledWith([
      {context: 'Check 1', integration_id: undefined},
      {context: 'Check 2', integration_id: undefined},
    ])
  })

  test('should allow requiring multiple existing status checks across different searches', async () => {
    const onValueChange = jest.fn()

    const {user} = renderComponent({
      onValueChange,
    })

    await user.click(screen.getByRole('button', {name: /^Click to change required status check/}))
    await inputSearch(user, 'Check 1', [{context: 'Check 1'}])

    await user.click(await screen.findByText('Check 1', undefined))

    await user.clear(screen.getByPlaceholderText(/^Search for checks/))
    await inputSearch(user, 'Check 2', [{context: 'Check 2'}])

    await user.click(await screen.findByText('Check 2', undefined))

    await user.click(screen.getByText('No required checks'))

    expect(onValueChange).toHaveBeenCalledWith([
      {context: 'Check 1', integration_id: undefined},
      {context: 'Check 2', integration_id: undefined},
    ])
  })

  test('should allow requiring multiple user created and existing status checks across different searches', async () => {
    const onValueChange = jest.fn()

    const {user} = renderComponent({
      onValueChange,
    })

    await user.click(screen.getByRole('button', {name: /^Click to change required status check/}))
    await inputSearch(user, 'New check')

    await user.click(await screen.findByText('Add New check', undefined))

    await user.clear(screen.getByPlaceholderText(/^Search for checks/))
    await inputSearch(user, 'Check 1', [{context: 'Check 1'}])

    await user.click(await screen.findByText('Check 1', undefined))

    await user.clear(screen.getByPlaceholderText(/^Search for checks/))
    await inputSearch(user, 'Check 2', [{context: 'Check 2'}])

    await user.click(await screen.findByText('Check 2', undefined))

    await user.click(screen.getByText('No required checks'))

    expect(onValueChange).toHaveBeenCalledWith([
      {context: 'New check', integration_id: undefined},
      {context: 'Check 1', integration_id: undefined},
      {context: 'Check 2', integration_id: undefined},
    ])
  })

  test('should select first integration for existing status checks', async () => {
    const onValueChange = jest.fn()

    const {user} = renderComponent({
      onValueChange,
    })

    await user.click(screen.getByRole('button', {name: /^Click to change required status check/}))
    await inputSearch(user, 'Check', [{context: 'Check 1', latest_integration_id: 9}, {context: 'Check 2'}])

    await user.click(await screen.findByText('Check 1', undefined))
    await user.click(screen.getByText('Check 2', undefined))

    await user.click(screen.getByText('No required checks'))

    expect(onValueChange).toHaveBeenCalledWith([
      {context: 'Check 1', integration_id: 9},
      {context: 'Check 2', integration_id: undefined},
    ])
  })
})
