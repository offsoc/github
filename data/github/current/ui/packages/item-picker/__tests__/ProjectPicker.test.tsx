import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import type {OperationDescriptor} from 'relay-runtime'
import {MockPayloadGenerator} from 'relay-test-utils'

import {TestProjectPickerComponent, buildClassicProject, buildProject} from '../test-utils/ProjectPickerHelpers'
import {ProjectPickerGraphqlQuery} from '../components/ProjectPicker'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
// eslint-disable-next-line no-restricted-imports
import userEvent from 'user-event-13'

const mockUseFeatureFlags = jest.fn().mockReturnValue({})
jest.mock('@github-ui/react-core/use-feature-flag', () => ({
  useFeatureFlags: () => mockUseFeatureFlags({}),
}))

beforeEach(() => {
  mockUseFeatureFlags.mockClear()
})

test('render projects when clicking on the anchor', async () => {
  const environment = setupEnvironment()

  render(<TestProjectPickerComponent environment={environment} shortcutEnabled={false} readonly={false} />)

  const button = await screen.findByRole('button')
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  const options = await screen.findAllByRole('option')

  expect(options[0]).toHaveTextContent('projectA')
  expect(options[1]).toHaveTextContent('projectB')
})

test('render projects when hitting shortcut key', async () => {
  const environment = setupEnvironment()

  render(<TestProjectPickerComponent environment={environment} shortcutEnabled={true} readonly={false} />)

  fireEvent.keyDown(document, {key: 'p'})

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  const options = await screen.findAllByRole('option')

  expect(options[0]).toHaveTextContent('projectA')
  expect(options[1]).toHaveTextContent('projectB')
})

test('renders both classic and memex projects', async () => {
  const environment = setupEnvironment({
    projects: {nodes: [buildClassicProject({title: 'classicProjectA', closed: false})]},
  })

  render(
    <TestProjectPickerComponent
      environment={environment}
      shortcutEnabled={false}
      readonly={false}
      includeClassicProjects={true}
    />,
  )

  const button = await screen.findByRole('button')
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  const options = await screen.findAllByRole('option')

  expect(options[0]).toHaveTextContent('classicProjectA')
  expect(options[1]).toHaveTextContent('projectA')
  expect(options[2]).toHaveTextContent('projectB')
})

test('does not render classic project if column is empty', async () => {
  const environment = setupEnvironment({
    projects: {nodes: [buildClassicProject({title: 'classicProjectA', closed: false, columns: []})]},
  })

  render(
    <TestProjectPickerComponent
      environment={environment}
      shortcutEnabled={false}
      readonly={false}
      includeClassicProjects={true}
    />,
  )

  const button = await screen.findByRole('button')
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  const options = await screen.findAllByRole('option')

  expect(options[0]).not.toHaveTextContent('classicProjectA')
  expect(options[0]).toHaveTextContent('projectA')
  expect(options[1]).toHaveTextContent('projectB')
})

test('pressing space while on a selected should toggle the selection', async () => {
  const environment = setupEnvironment()
  const selectedProject = buildProject({title: 'selectedProject', closed: false})

  render(
    <TestProjectPickerComponent
      environment={environment}
      shortcutEnabled={false}
      readonly={false}
      selectedProjects={[selectedProject]}
    />,
  )

  const button = await screen.findByRole('button')
  fireEvent.click(button)

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  let options = await screen.findAllByRole('option')

  userEvent.keyboard('{arrowdown}')

  // We use the 2nd option, since a key down press will go to the 2nd option given the first one is already indirectly
  // activated. This is the primer behaviour.
  expect(options[1]).toHaveAttribute('data-is-active-descendant', 'activated-directly')

  userEvent.keyboard('{space}')
  await waitFor(async () => {
    options = await screen.findAllByRole('option')
    expect(options[1]).toHaveAttribute('aria-selected', 'true')
  })
  // Press space again to deselect the first option
  userEvent.keyboard('{space}')
  // Assert selection status
  expect(options[1]).toHaveAttribute('aria-selected', 'false')
})

test('renders selected projects', async () => {
  const environment = setupEnvironment()
  const selectedProject = buildProject({title: 'selectedProject', closed: false})
  const selectedClassicProjects = buildClassicProject({title: 'selectedClassicProject', closed: false})

  render(
    <TestProjectPickerComponent
      environment={environment}
      shortcutEnabled={false}
      readonly={false}
      selectedProjects={[selectedProject, selectedClassicProjects]}
    />,
  )

  const button = await screen.findByRole('button')
  fireEvent.click(button)

  // assert that 3 options are visible including the selected one
  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(4)
  })

  const options = await screen.findAllByRole('option')

  // assert that selectedProject appears first
  expect(options[0]).toHaveTextContent('selectedProject')
  expect(options[1]).toHaveTextContent('selectedClassicProject')
  expect(options[2]).toHaveTextContent('projectA')
  expect(options[3]).toHaveTextContent('projectB')

  // assert that selected project is actually selected
  expect(options[0]).toHaveAttribute('aria-selected', 'true')
  expect(options[1]).toHaveAttribute('aria-selected', 'true')
  expect(options[2]).toHaveAttribute('aria-selected', 'false')
  expect(options[3]).toHaveAttribute('aria-selected', 'false')
})

test('shows first selected project title', async () => {
  const environment = setupEnvironment()
  const selectedProject = buildProject({
    title: 'Project title with a very long name for a title. If we continue typing this title will be extremely long.',
    closed: false,
  })

  render(
    <TestProjectPickerComponent
      environment={environment}
      shortcutEnabled={false}
      readonly={false}
      firstSelectedProjectTitle={selectedProject.title}
    />,
  )

  const button = await screen.findByRole('button')

  await waitFor(() => {
    expect(button).toHaveTextContent(selectedProject.title)
  })
})

function setupEnvironment(overwrites?: object) {
  const {environment} = createRelayMockEnvironment()

  environment.mock.queuePendingOperation(ProjectPickerGraphqlQuery, {
    owner: 'github',
    repo: 'issues',
    query: 'some query',
  })
  environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
    return MockPayloadGenerator.generate(operation, {
      Repository() {
        return {
          projectsV2: {
            nodes: [buildProject({title: 'projectA', closed: false}), buildProject({title: 'projectB', closed: false})],
          },
          recentProjects: {edges: []},
          owner: {
            projectsV2: {edges: []},
            recentProjects: {edges: []},
          },
          ...overwrites,
        }
      },
    })
  })

  return environment
}
