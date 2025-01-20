import {render} from '@github-ui/react-core/test-utils'
import {MockPayloadGenerator, type createMockEnvironment} from 'relay-test-utils'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {RelayEnvironmentProvider, readInlineData, useLazyLoadQuery} from 'react-relay'
import {
  BranchPickerInternal,
  type BranchPickerInternalProps,
  BranchPickerRepositoryBranchRefsFragment,
  BranchPickerRepositoryBranchesGraphqlQuery,
} from '../components/BranchPicker'
import {Suspense} from 'react'
import type {BranchPickerRepositoryBranchesQuery} from '../components/__generated__/BranchPickerRepositoryBranchesQuery.graphql'
import {act, fireEvent, screen, waitFor} from '@testing-library/react'
import {buildBranch} from '../test-utils/BranchPickerHelpers'
import type {BranchPickerRepositoryBranchRefs$key} from '../components/__generated__/BranchPickerRepositoryBranchRefs.graphql'

type TestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
} & Omit<BranchPickerInternalProps, 'branchesKey'>

function WrappedComponent({...props}: Omit<BranchPickerInternalProps, 'branchesKey'>) {
  const branches = useLazyLoadQuery<BranchPickerRepositoryBranchesQuery>(BranchPickerRepositoryBranchesGraphqlQuery, {
    name: 'repo',
    owner: 'owner',
  })
  if (!branches.repository) {
    return null
  }
  // eslint-disable-next-line no-restricted-syntax
  const repoBranchRefs = readInlineData<BranchPickerRepositoryBranchRefs$key>(
    BranchPickerRepositoryBranchRefsFragment,
    branches.repository,
  )

  const branchesKey = repoBranchRefs?.refs ?? null

  return (
    <Suspense fallback="...Loading">
      <BranchPickerInternal branchesKey={branchesKey} {...props} />
    </Suspense>
  )
}

function TestComponent({environment, ...props}: TestComponentProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <WrappedComponent {...props} />
    </RelayEnvironmentProvider>
  )
}

test('renders top branches', async () => {
  const {environment} = createRelayMockEnvironment()

  render(
    <TestComponent
      environment={environment}
      owner={'owner'}
      repo={'repo'}
      onSelect={() => {}}
      initialBranch={null}
      defaultBranchId={undefined}
    />,
  )
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        RefConnection() {
          return {
            edges: [
              {node: buildBranch({id: 'b1', name: 'branch1'})},
              {node: buildBranch({id: 'b2', name: 'branch2'})},
              {node: buildBranch({id: 'b3', name: 'branch3'})},
            ],
          }
        },
      }),
    )
  })

  const button = await screen.findByRole('button')
  expect(button).toHaveTextContent('Select a branch')
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  const options = await screen.findAllByRole('option')

  expect(options[0]).toHaveTextContent('branch1')
  expect(options[0]).not.toHaveTextContent('Default')

  expect(options[1]).toHaveTextContent('branch2')
  expect(options[1]).not.toHaveTextContent('Default')

  expect(options[2]).toHaveTextContent('branch3')
  expect(options[2]).not.toHaveTextContent('Default')
})

test('renders top branches with a default branch and an initial selection', async () => {
  const {environment} = createRelayMockEnvironment()

  render(
    <TestComponent
      environment={environment}
      owner={'owner'}
      repo={'repo'}
      onSelect={() => {}}
      initialBranch={buildBranch({id: 'b3', name: 'branch3'})}
      defaultBranchId={'b2'}
    />,
  )
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        RefConnection() {
          return {
            edges: [
              {node: buildBranch({id: 'b1', name: 'branch1'})},
              {node: buildBranch({id: 'b2', name: 'branch2'})},
              {node: buildBranch({id: 'b3', name: 'branch3'})},
            ],
          }
        },
      }),
    )
  })

  const button = await screen.findByRole('button')
  expect(button).toHaveTextContent('branch3')

  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  const options = await screen.findAllByRole('option')

  expect(options[0]).toHaveTextContent('branch3')
  expect(options[0]).not.toHaveTextContent('Default')

  expect(options[1]).toHaveTextContent('branch1')
  expect(options[1]).not.toHaveTextContent('Default')

  expect(options[2]).toHaveTextContent('branch2')
  expect(options[2]).toHaveTextContent('Default')
})
