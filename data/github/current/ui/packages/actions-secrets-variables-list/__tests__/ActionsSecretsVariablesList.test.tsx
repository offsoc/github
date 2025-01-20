import {act, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {ActionsSecretsVariablesList} from '../ActionsSecretsVariablesList'
import {ItemsScope} from '../types'
import {getActionsSecretsListProps} from '../test-utils/mock-data'

test('Renders the ActionsSecretsVariablesList with the secret names', () => {
  const props = getActionsSecretsListProps(ItemsScope.Repository)
  render(<ActionsSecretsVariablesList {...props} />)
  for (const secret of props.items) {
    expect(screen.getByText(secret.name)).toBeInTheDocument()
  }
})

test('Renders the ActionsSecretsVariablesList with org secrets', () => {
  const props = getActionsSecretsListProps(ItemsScope.Organization)
  render(<ActionsSecretsVariablesList {...props} />)
  for (const secret of props.items) {
    expect(screen.getByText(secret.name)).toBeInTheDocument()
  }
})

test('Renders the ActionsSecretsVariablesList with codespace user secrets', () => {
  const props = getActionsSecretsListProps(ItemsScope.CodespaceUser)
  render(<ActionsSecretsVariablesList {...props} />)
  for (const secret of props.items) {
    expect(screen.getByText(secret.name)).toBeInTheDocument()
  }
})

test('Renders the ActionsSecretsVariablesList with env names and links', () => {
  const props = getActionsSecretsListProps(ItemsScope.Environment)

  render(<ActionsSecretsVariablesList {...props} />)
  for (const secret of props.items) {
    expect(screen.getByText(secret.name)).toBeInTheDocument()
    const envLink = screen.getByText(secret.environment_name!)
    expect(envLink).toBeInTheDocument()
    expect(envLink).toHaveAttribute('href', `repo/environments/${secret.environment_name}`)
  }
})

test('Renders the ActionsSecretsVariablesList override status for orgs and repos', () => {
  let props = getActionsSecretsListProps(ItemsScope.Repository)
  render(<ActionsSecretsVariablesList {...props} />)
  expect(screen.getByText('This secret overrides an organization secret')).toBeInTheDocument()

  props = getActionsSecretsListProps(ItemsScope.Organization)
  render(<ActionsSecretsVariablesList {...props} />)
  expect(screen.getByText('This secret is overridden by a repository secret')).toBeInTheDocument()
})

test('Renders the ActionsSecretsVariablesList management buttons for orgs and environments', () => {
  let props = getActionsSecretsListProps(ItemsScope.Organization)
  render(<ActionsSecretsVariablesList {...props} />)
  expect(screen.getByText('Manage organization secrets')).toBeInTheDocument()

  props = getActionsSecretsListProps(ItemsScope.Environment)
  render(<ActionsSecretsVariablesList {...props} />)
  expect(screen.getByText('Manage environment secrets')).toBeInTheDocument()
})

test('Renders the ActionsSecretsVariablesList secret creation button for repos', () => {
  const props = getActionsSecretsListProps(ItemsScope.Repository)
  render(<ActionsSecretsVariablesList {...props} />)
  expect(screen.getByText('New repository secret')).toBeInTheDocument()
})

test('Does not render the ActionsSecretsVariablesList management button when no url present', () => {
  const props = getActionsSecretsListProps(ItemsScope.Organization)
  props.tableActionProps.url = undefined
  render(<ActionsSecretsVariablesList {...props} />)
  expect(screen.queryByText('Manage organization secrets')).not.toBeInTheDocument()
})

test('Does not render the ActionsSecretsVariablesList add secret button when no url present', () => {
  const props = getActionsSecretsListProps(ItemsScope.Repository)
  props.tableActionProps.url = undefined
  render(<ActionsSecretsVariablesList {...props} />)
  expect(screen.queryByText('New repository secret')).not.toBeInTheDocument()
})

test('Renders the relative time of each secrets', () => {
  const props = getActionsSecretsListProps(ItemsScope.Repository)
  render(<ActionsSecretsVariablesList {...props} />)
  expect(screen.queryAllByTestId(/secret.*-relative-time/)).toHaveLength(3)
})

test('Renders the name of each secret', () => {
  const props = getActionsSecretsListProps(ItemsScope.Repository)
  render(<ActionsSecretsVariablesList {...props} />)
  expect(screen.getByText('secret1')).toBeInTheDocument()
})

test('Renders the ActionsSecretsVariablesList crud operations buttons', () => {
  const props = getActionsSecretsListProps(ItemsScope.Repository)
  render(<ActionsSecretsVariablesList {...props} />)

  expect(screen.queryAllByTestId(/secret.*-edit/)).toHaveLength(3)
  expect(screen.queryAllByTestId(/secret.*-delete/)).toHaveLength(3)
})

test('Renders the ActionsSecretsVariablesList secret deletion dialog', () => {
  const props = getActionsSecretsListProps(ItemsScope.Repository)
  render(<ActionsSecretsVariablesList {...props} />)

  expect(screen.queryAllByTestId(/secret.*-delete/)).toHaveLength(3)

  expect(screen.queryByText(/Are you sure you want to delete.*/)).not.toBeInTheDocument()
  expect(screen.queryAllByText('secret1')).toHaveLength(1)
  expect(screen.queryByText('Yes, delete this secret')).not.toBeInTheDocument()

  const deleteButton = screen.getByTestId(/secret1-delete/)
  act(() => {
    deleteButton.click()
  })

  expect(screen.getByText(/Are you sure you want to delete.*/)).toBeInTheDocument()
  expect(screen.queryAllByText('secret1')).toHaveLength(2)
  expect(screen.getByText('Yes, delete this secret')).toBeInTheDocument()
})

test('Renders the ActionsSecretsVariablesList environment links', () => {
  const props = getActionsSecretsListProps(ItemsScope.Environment)
  render(<ActionsSecretsVariablesList {...props} />)
  const links = screen.queryAllByTestId(/secret.*-env-link/)
  expect(links).toHaveLength(3)
  expect(links[0]).toHaveTextContent('prod')
  expect(links[1]).toHaveTextContent('dev')
  expect(links[2]).toHaveTextContent('test')

  expect(links[0]).toHaveAttribute('href', 'repo/environments/prod')
  expect(links[1]).toHaveAttribute('href', 'repo/environments/dev')
  expect(links[2]).toHaveAttribute('href', 'repo/environments/test')
})

test('Sorts the ActionsSecretsVariablesList environment secrets correctly', () => {
  const props = getActionsSecretsListProps(ItemsScope.Environment)

  // Add a secret that has the name name as another but in a different environment
  props.items.push({
    name: 'secret1',
    updated_at: new Date(Date.now() - 1000 * 60 * 60),
    scope: ItemsScope.Environment,
    environment_name: 'dev',
    environment_url: 'repo/environments/dev',
  })

  // Add crud URLs for the new secret
  props.crudUrls!.editUrls = {
    ...props.crudUrls!.editUrls,
    'secret1-dev': '/edit/secret1',
  }
  props.crudUrls!.deleteUrls = {
    ...props.crudUrls!.deleteUrls,
    'secret1-dev': '/delete/secret',
  }

  const {container} = render(<ActionsSecretsVariablesList {...props} />)

  // Ensure the list length is correct before sorting
  let links = screen.queryAllByTestId(/secret.*-env-link/)
  expect(links).toHaveLength(4)

  // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
  const sortButtons = container.getElementsByClassName('TableSortButton')
  const nameSortButton = sortButtons[0] // Name sort button is the first column

  act(() => {
    ;(nameSortButton! as HTMLButtonElement).click()
    ;(nameSortButton! as HTMLButtonElement).click()
  })

  // Ensure the list length is correct after sorting
  // (Previously, a bug caused environment secrets with the same name to duplicate when sorting)
  links = screen.queryAllByTestId(/secret.*-env-link/)
  expect(links).toHaveLength(4)
})

test('Renders the ActionsSecretsVariablesList empty state when there are no secrets', () => {
  const props = getActionsSecretsListProps(ItemsScope.Repository)
  props.items = []
  render(<ActionsSecretsVariablesList {...props} />)
  expect(screen.getByText('This repository has no secrets.')).toBeInTheDocument()
})

test('Renders the ActionsSecretsVariablesList free org public repo blankslate when true', () => {
  const props = getActionsSecretsListProps(ItemsScope.Organization, false, true)
  render(<ActionsSecretsVariablesList {...props} />)
  expect(
    screen.getByText(
      'Organization secrets can only be used by public repositories on your plan. If you would like to use organization secrets in a private repository, you will need to upgrade your plan.',
    ),
  ).toBeInTheDocument()
})
