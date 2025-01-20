import {fireEvent, screen, waitFor} from '@testing-library/react'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {buildAssignee} from '../test-utils/AssigneePickerHelpers'
import {
  AssigneeRepositoryPicker,
  DefaultAssigneePickerAnchor,
  type AssigneeRepositoryPickerProps,
  AssigneePicker,
  SearchAssignableUsersQuery,
  type AssigneePickerProps,
  SearchAssignableRepositoryUsersWithLoginsQuery,
} from '../components/AssigneePicker'
import {noop} from '@github-ui/noop'
import type {AssigneePickerAssignee$data} from '../components/__generated__/AssigneePickerAssignee.graphql'
import {renderRelay} from '@github-ui/relay-test-utils'
import type {AssigneePickerSearchAssignableUsersQuery} from '../components/__generated__/AssigneePickerSearchAssignableUsersQuery.graphql'
import type {AssigneePickerSearchAssignableRepositoryUsersWithLoginsQuery} from '../components/__generated__/AssigneePickerSearchAssignableRepositoryUsersWithLoginsQuery.graphql'

type TestAssigneePickerProps = Pick<
  AssigneePickerProps,
  'shortcutEnabled' | 'readonly' | 'assignees' | 'showNoMatchItem' | 'name' | 'suggestions'
> & {
  maximumAssignees?: number
}

type TestAssigneeRepositoryPickerProps = TestAssigneePickerProps & Pick<AssigneeRepositoryPickerProps, 'assigneeTokens'>

const setupAssigneeRepositoryPicker = ({
  shortcutEnabled = true,
  readonly = false,
  assignees = [],
  assigneeTokens = [],
  maximumAssignees = 10,
  showNoMatchItem = false,
  name = 'assignee',
  suggestions = [],
}: TestAssigneeRepositoryPickerProps) => {
  return renderRelay<{fetchQuery: AssigneePickerSearchAssignableRepositoryUsersWithLoginsQuery}>(
    () => (
      <AssigneeRepositoryPicker
        readonly={readonly}
        shortcutEnabled={shortcutEnabled}
        assignees={assignees}
        assigneeTokens={assigneeTokens}
        repo="issues"
        owner="github"
        onSelectionChange={noop}
        anchorElement={anchorProps => (
          <DefaultAssigneePickerAnchor assignees={assignees} readonly={readonly} anchorProps={anchorProps} />
        )}
        maximumAssignees={maximumAssignees}
        showNoMatchItem={showNoMatchItem}
        name={name}
        suggestions={suggestions}
      />
    ),
    {
      relay: {
        queries: {
          fetchQuery: {
            type: 'preloaded',
            query: SearchAssignableRepositoryUsersWithLoginsQuery,
            variables: {owner: 'github', name: 'issues', query: 'loginA,loginB,loginC', first: 3},
          },
        },
        mockResolvers: {
          Repository() {
            return {assignableUsers: {nodes: assigneesFromTokens}}
          },
        },
      },
      wrapper: Wrapper,
    },
  )
}

const setupAssigneeIssuePicker = ({
  shortcutEnabled = true,
  readonly = false,
  assignees = [],
  maximumAssignees = 10,
}: TestAssigneePickerProps) => {
  renderRelay<{fetchQuery: AssigneePickerSearchAssignableUsersQuery}>(
    () => (
      <AssigneePicker
        readonly={readonly}
        shortcutEnabled={shortcutEnabled}
        assignees={assignees}
        repo="issues"
        owner="github"
        number={123}
        onSelectionChange={noop}
        anchorElement={anchorProps => (
          <DefaultAssigneePickerAnchor assignees={assignees} readonly={readonly} anchorProps={anchorProps} />
        )}
        maximumAssignees={maximumAssignees ?? 10}
      />
    ),
    {
      relay: {
        queries: {
          fetchQuery: {
            type: 'preloaded',
            query: SearchAssignableUsersQuery,
            variables: {owner: 'github', name: 'issues', number: 123, query: '', first: 10},
          },
        },
        mockResolvers: {
          Assignable() {
            return {suggestedAssignees: []}
          },
        },
      },
      wrapper: Wrapper,
    },
  )
}

const assignees = [
  buildAssignee({login: 'login1', name: 'name1'}),
  buildAssignee({login: 'login2', name: 'name2'}),
  buildAssignee({login: 'login3', name: 'name3'}),
] as AssigneePickerAssignee$data[]

const assigneesFromTokens = [
  buildAssignee({login: 'loginA', name: 'nameA'}),
  buildAssignee({login: 'loginB', name: 'nameB'}),
  buildAssignee({login: 'loginC', name: 'nameC'}),
] as AssigneePickerAssignee$data[]

describe('AssigneeRepositoryPicker', () => {
  test('render assignees when clicking the button anchor', async () => {
    setupAssigneeRepositoryPicker({assignees, assigneeTokens: [], shortcutEnabled: true, readonly: false})

    const button = await screen.findByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(3)
    })
    const options = await screen.findAllByRole('option')

    expect(options[0]).toHaveTextContent('login1name1')
    expect(options[1]).toHaveTextContent('login2name2')
    expect(options[2]).toHaveTextContent('login3name3')
  })

  test('render picker with a different name', async () => {
    setupAssigneeRepositoryPicker({
      assignees: [],
      assigneeTokens: [],
      shortcutEnabled: true,
      readonly: false,
      name: 'author',
    })

    const button = await screen.findByRole('button')
    fireEvent.click(button)

    const searchInput = screen.getByRole('textbox', {name: 'Filter authors'})

    expect(searchInput).toBeInTheDocument()
  })

  test('render no match custom item', async () => {
    const {user} = setupAssigneeRepositoryPicker({
      assignees: [],
      assigneeTokens: [],
      shortcutEnabled: true,
      readonly: false,
      showNoMatchItem: true,
    })

    const button = await screen.findByRole('button')
    fireEvent.click(button)

    const searchInput = screen.getByRole('textbox', {name: 'Filter assignees'})
    await user.type(searchInput, 'no-match')

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(1)
    })

    const options = await screen.findAllByRole('option')

    // Item text and description
    expect(options[0]).toHaveTextContent('assignee:no-matchFilter by user')
  })

  test('Do not render no match custom item', async () => {
    const {user} = setupAssigneeRepositoryPicker({
      assignees: [],
      assigneeTokens: [],
      shortcutEnabled: true,
      readonly: false,
      showNoMatchItem: false,
    })

    const button = await screen.findByRole('button')
    fireEvent.click(button)

    const searchInput = screen.getByRole('textbox', {name: 'Filter assignees'})
    await user.type(searchInput, 'no-match')

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(1)
    })

    const options = await screen.findAllByRole('option')

    // Item text and description
    expect(options[0]).toHaveTextContent('No matches')
  })

  test('render assignees when hitting shortcut key', async () => {
    setupAssigneeRepositoryPicker({assignees, assigneeTokens: [], shortcutEnabled: true, readonly: false})

    fireEvent.keyDown(document, {key: 'a'})

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(3)
    })
    const options = await screen.findAllByRole('option')

    expect(options[0]).toHaveTextContent('login1name1')
    expect(options[1]).toHaveTextContent('login2name2')
    expect(options[2]).toHaveTextContent('login3name3')
  })

  test('render assignees from tokens', async () => {
    setupAssigneeRepositoryPicker({
      assignees: [],
      assigneeTokens: ['loginA', 'loginB', 'loginC'],
      shortcutEnabled: true,
      readonly: false,
    })

    const button = await screen.findByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(3)
    })
    const options = await screen.findAllByRole('option')

    expect(options[0]).toHaveTextContent('loginAnameA')
    expect(options[1]).toHaveTextContent('loginBnameB')
    expect(options[2]).toHaveTextContent('loginCnameC')
  })
})

describe('AssigneePicker', () => {
  test('render assignees when clicking the button anchor', async () => {
    setupAssigneeIssuePicker({assignees, shortcutEnabled: true, readonly: false})

    const button = await screen.findByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(4)
    })
    const options = await screen.findAllByRole('option')

    expect(options[0]).toHaveTextContent('login1name1')
    expect(options[1]).toHaveTextContent('login2name2')
    expect(options[2]).toHaveTextContent('login3name3')
  })

  test('render assignees when hitting shortcut key', async () => {
    setupAssigneeIssuePicker({assignees, shortcutEnabled: true, readonly: false})

    fireEvent.keyDown(document, {key: 'a'})

    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(4)
    })
    const options = await screen.findAllByRole('option')

    expect(options[0]).toHaveTextContent('login1name1')
    expect(options[1]).toHaveTextContent('login2name2')
    expect(options[2]).toHaveTextContent('login3name3')
  })
})

test('renders as a single select if there is a single user limit based on the plan', async () => {
  setupAssigneeIssuePicker({assignees, shortcutEnabled: true, readonly: false, maximumAssignees: 1})

  fireEvent.keyDown(document, {key: 'a'})
  expect(screen.getByText('Assign up to 1 people to this issue')).toBeInTheDocument()

  const picker = screen.getByTestId('item-picker-root')
  expect(picker.getAttribute('aria-multiselectable')).toBe('false')
})

test('renders as a multi select if there is a multi user limit based on the plan', async () => {
  setupAssigneeIssuePicker({assignees, shortcutEnabled: true, readonly: false, maximumAssignees: 5})

  fireEvent.keyDown(document, {key: 'a'})
  expect(screen.getByText('Assign up to 5 people to this issue')).toBeInTheDocument()

  const picker = screen.getByTestId('item-picker-root')
  expect(picker.getAttribute('aria-multiselectable')).toBe('true')
})
