import type {OperationDescriptor, PreloadedQuery} from 'react-relay'
import {RelayEnvironmentProvider} from 'react-relay'
import type {MockEnvironment} from 'relay-test-utils'
import {MockPayloadGenerator, createMockEnvironment} from 'relay-test-utils'
import {UserPicker, UserPickerEnterpriseOwnersQuery, UserPickerQuery} from '../../../components/pickers/UserPicker'
import type {UserPickerEnterpriseOwnersQuery as UserPickerEnterpriseOwnersQueryType} from '../../../components/pickers/__generated__/UserPickerEnterpriseOwnersQuery.graphql'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {ThemeProvider} from '@primer/react'
import {ComponentWithPreloadedQueryRef} from '@github-ui/relay-test-utils/RelayComponents'
import {Suspense} from 'react'

type TestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
} & Partial<React.ComponentProps<typeof UserPicker>>

const mockOnSelectionChange = jest.fn()

function WrappedUserPicker({queryRef}: {queryRef: PreloadedQuery<UserPickerEnterpriseOwnersQueryType>}) {
  return (
    <UserPicker
      slug="github-inc"
      onSelectionChange={mockOnSelectionChange}
      initialRecipients={[]}
      preloadedEnterpriseOwnersData={queryRef}
    />
  )
}

function TestComponent({environment}: TestComponentProps) {
  return (
    <ThemeProvider>
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback="...Loading">
          <ComponentWithPreloadedQueryRef
            component={WrappedUserPicker}
            query={UserPickerEnterpriseOwnersQuery}
            queryVariables={{slug: 'github-inc'}}
          />
        </Suspense>
      </RelayEnvironmentProvider>
    </ThemeProvider>
  )
}

function SetupAndRenderComponent(environment: MockEnvironment) {
  environment.mock.queuePendingOperation(UserPickerEnterpriseOwnersQuery, {slug: 'github-inc'})
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      EnterpriseAdministratorConnection() {
        return {
          nodes: [
            {id: 'U_1', login: 'owner1', name: 'owner 1', avatarUrl: 'url1'},
            {id: 'U_2', login: 'owner2', name: 'owner 2', avatarUrl: 'url2'},
          ],
        }
      },
    })
  })
  render(<TestComponent environment={environment} />)
}

test('Shows search results', async () => {
  const environment = createMockEnvironment()
  SetupAndRenderComponent(environment)

  // open dropdown, initial suggestions are enterprise owners
  const button = await screen.findByRole('button', {name: 'Select recipients'})
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })
  const preloadedOptions = await screen.findAllByRole('option')
  expect(preloadedOptions[0]).toHaveTextContent('owner1')
  expect(preloadedOptions[1]).toHaveTextContent('owner2')

  environment.mock.queuePendingOperation(UserPickerQuery, {slug: 'github-inc', query: 'test'})
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      EnterpriseMemberConnection() {
        return {
          nodes: [
            {user: {id: 'U_1', login: 'test-login-1', name: 'test1', avatarUrl: 'url1'}},
            {user: {id: 'U_2', login: 'test-login-2', name: 'test2', avatarUrl: 'url2'}},
            {user: {id: 'U_3', login: 'test-login-3', name: 'test3', avatarUrl: 'url3'}},
          ],
        }
      },
    })
  })

  // search for users
  const input = await screen.findByPlaceholderText('Search for users')
  fireEvent.change(input, {target: {value: 'test'}})

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })
  const options = await screen.findAllByRole('option')
  expect(options[0]).toHaveTextContent('test-login-1')
  expect(options[1]).toHaveTextContent('test-login-2')
  expect(options[2]).toHaveTextContent('test-login-3')

  // select a user
  fireEvent.click(await screen.findByLabelText('test-login-2'))

  await waitFor(() => {
    expect(screen.getByLabelText('test-login-2')).toHaveAttribute('aria-selected', 'true')
  })

  // close the dropdown
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
  await waitFor(() => {
    expect(mockOnSelectionChange).toHaveBeenCalledWith([
      {id: 'U_2', login: 'test-login-2', name: 'test2', avatarUrl: 'url2'},
    ])
  })
  expect(await screen.findByText('1 selected')).toBeVisible()
  expect(await screen.findByText('test-login-2')).toBeVisible()

  // open the dropdown again
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getByLabelText('test-login-2')).toHaveAttribute('aria-selected', 'true')
  })

  // deselect a user
  fireEvent.click(await screen.findByLabelText('test-login-2'))

  await waitFor(() => {
    expect(screen.getByLabelText('test-login-2')).toHaveAttribute('aria-selected', 'false')
  })

  // close the dropdown
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getByText('0 selected')).toBeInTheDocument()
  })
  await waitFor(() => {
    expect(screen.queryByText('test-login-2')).not.toBeInTheDocument()
  })
  await waitFor(() => {
    expect(mockOnSelectionChange).toHaveBeenCalledWith([])
  })
})
