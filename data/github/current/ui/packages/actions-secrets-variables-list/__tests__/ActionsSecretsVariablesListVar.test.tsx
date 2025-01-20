import {act, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {ActionsSecretsVariablesList} from '../ActionsSecretsVariablesList'
import {getActionsVariablesListProps} from '../test-utils/mock-data'
import {ItemsScope} from '../types'

test('Renders the ActionsSecretsVariablesList with the variable names', () => {
  const props = getActionsVariablesListProps(ItemsScope.Repository)
  render(<ActionsSecretsVariablesList {...props} />)
  for (const item of props.items) {
    expect(screen.getByText(item.name)).toBeInTheDocument()
  }
})

test('Renders the ActionsSecretsVariablesList with org variables', () => {
  const props = getActionsVariablesListProps(ItemsScope.Organization)
  render(<ActionsSecretsVariablesList {...props} />)
  for (const item of props.items) {
    expect(screen.getByText(item.name)).toBeInTheDocument()
  }
})

test('Renders the ActionsSecretsVariablesList with env names and links', () => {
  const props = getActionsVariablesListProps(ItemsScope.Environment)
  render(<ActionsSecretsVariablesList {...props} />)
  for (const item of props.items) {
    expect(screen.getByText(item.name)).toBeInTheDocument()
    const envLink = screen.getByText(item.environment_name!)
    expect(envLink).toBeInTheDocument()
    expect(envLink).toHaveAttribute('href', `repo/environments/${item.environment_name}`)
  }
})

test('Renders the ActionsSecretsVariablesList override status for orgs and repos', () => {
  let props = getActionsVariablesListProps(ItemsScope.Repository)
  render(<ActionsSecretsVariablesList {...props} />)
  expect(screen.getByText('This variable overrides an organization variable')).toBeInTheDocument()

  props = getActionsVariablesListProps(ItemsScope.Organization)
  render(<ActionsSecretsVariablesList {...props} />)
  expect(screen.getByText('This variable is overridden by a repository variable')).toBeInTheDocument()
})

test('Renders the ActionsSecretsVariablesList management buttons for orgs and environments', () => {
  let props = getActionsVariablesListProps(ItemsScope.Organization)
  render(<ActionsSecretsVariablesList {...props} />)
  expect(screen.getByText('Manage organization variables')).toBeInTheDocument()

  props = getActionsVariablesListProps(ItemsScope.Environment)
  render(<ActionsSecretsVariablesList {...props} />)
  expect(screen.getByText('Manage environment variables')).toBeInTheDocument()
})

test('Renders the ActionsSecretsVariablesList variable creation button for repos', () => {
  const props = getActionsVariablesListProps(ItemsScope.Repository)
  render(<ActionsSecretsVariablesList {...props} />)
  expect(screen.getByText('New repository variable')).toBeInTheDocument()
})

test('Does not render the ActionsSecretsVariablesList management button when no url present', () => {
  const props = getActionsVariablesListProps(ItemsScope.Organization)
  props.tableActionProps.url = undefined
  render(<ActionsSecretsVariablesList {...props} />)
  expect(screen.queryByText('Manage organization variables')).not.toBeInTheDocument()
})

test('Does not render the ActionsSecretsVariablesList add variable button when no url present', () => {
  const props = getActionsVariablesListProps(ItemsScope.Repository)
  props.tableActionProps.url = undefined
  render(<ActionsSecretsVariablesList {...props} />)
  expect(screen.queryByText('New repository variable')).not.toBeInTheDocument()
})

test('Renders the relative time of each variable', () => {
  const props = getActionsVariablesListProps(ItemsScope.Repository)
  render(<ActionsSecretsVariablesList {...props} />)
  expect(screen.queryAllByTestId(/var.*-relative-time/)).toHaveLength(3)
})

test('Renders the value of each variable', () => {
  const props = getActionsVariablesListProps(ItemsScope.Repository)
  render(<ActionsSecretsVariablesList {...props} />)
  expect(screen.getByText('value1')).toBeInTheDocument()
})

test('Renders the ActionsSecretsVariablesList crud operations menu buttons when kebab menu clicked', () => {
  const props = getActionsVariablesListProps(ItemsScope.Repository)
  render(<ActionsSecretsVariablesList {...props} />)

  expect(screen.queryAllByTestId(/var.*-edit/)).toHaveLength(3)
  expect(screen.queryAllByTestId(/var.*-delete/)).toHaveLength(3)
})

test('Renders the ActionsSecretsVariablesList variable deletion dialog', () => {
  const props = getActionsVariablesListProps(ItemsScope.Repository)
  render(<ActionsSecretsVariablesList {...props} />)

  expect(screen.queryAllByTestId(/var.*-delete/)).toHaveLength(3)

  expect(screen.queryByText(/Are you sure you want to delete.*/)).not.toBeInTheDocument()
  expect(screen.queryAllByText('var1')).toHaveLength(1)
  expect(screen.queryByText('Yes, delete this variable')).not.toBeInTheDocument()

  const deleteButton = screen.getByTestId(/var1-delete/)
  act(() => {
    deleteButton.click()
  })

  expect(screen.getByText(/Are you sure you want to delete.*/)).toBeInTheDocument()
  expect(screen.queryAllByText('var1')).toHaveLength(2)
  expect(screen.getByText('Yes, delete this variable')).toBeInTheDocument()
})

test('Renders the ActionsSecretsVariablesList environment links', () => {
  const props = getActionsVariablesListProps(ItemsScope.Environment)
  render(<ActionsSecretsVariablesList {...props} />)
  const links = screen.queryAllByTestId(/var.*-env-link/)
  expect(links).toHaveLength(3)
  expect(links[0]).toHaveTextContent('prod')
  expect(links[1]).toHaveTextContent('dev')
  expect(links[2]).toHaveTextContent('test')

  expect(links[0]).toHaveAttribute('href', 'repo/environments/prod')
  expect(links[1]).toHaveAttribute('href', 'repo/environments/dev')
  expect(links[2]).toHaveAttribute('href', 'repo/environments/test')
})

test('Renders the ActionsSecretsVariablesList empty state when there are no variables', () => {
  const props = getActionsVariablesListProps(ItemsScope.Repository)
  props.items = []
  render(<ActionsSecretsVariablesList {...props} />)
  expect(screen.getByText('This repository has no variables.')).toBeInTheDocument()
})
