import {screen} from '@testing-library/react'
import {render, RouteContext} from '@github-ui/react-core/test-utils'
import {RequestsTable} from '../../components/RequestsTable'
import {getInstallationsPayload, getUsersPayload} from '../../test-utils/mock-data'

beforeAll(() => {
  performance.clearResourceTimings = jest.fn()
  performance.mark = jest.fn()
})

test('RequestsTable renders a title', async () => {
  const {requests_table} = getInstallationsPayload()
  const {title} = requests_table
  render(<RequestsTable {...requests_table} />)

  expect(screen.getByRole('heading', {name: title})).toBeInTheDocument()
})

test('RequestsTable renders a description', async () => {
  const {requests_table} = getInstallationsPayload()
  const {description} = requests_table
  render(<RequestsTable {...requests_table} />)

  expect(screen.getByText(description)).toBeInTheDocument()
})

test('RequestsTable renders a search', async () => {
  const {requests_table} = getInstallationsPayload()
  const {placeholder_text} = requests_table
  const {user} = render(<RequestsTable {...requests_table} />)

  const search = screen.getByRole('textbox')
  expect(search).toBeInTheDocument()
  expect(search).toHaveAttribute('placeholder', placeholder_text)

  expect(RouteContext.location?.pathname).toEqual('/')
  expect(RouteContext.location?.search).toEqual('')

  await user.type(search, 'slack')

  const submit = screen.getByLabelText('Search')
  expect(submit).toBeInTheDocument()

  await user.click(submit)

  expect(RouteContext.location?.pathname).toEqual('/')
  expect(RouteContext.location?.search).toEqual('?q=slack')
})

test('RequestsTable renders a list of rows', async () => {
  const {requests_table} = getInstallationsPayload()
  const {rows} = requests_table
  render(<RequestsTable {...requests_table} />)

  const tableRows = screen.getAllByRole('row')
  expect(tableRows).toHaveLength(rows.length + 1) // Plus one for custom header

  const expected = rows[0] || {name: 'fail'}
  expect(tableRows[1]).toHaveTextContent(expected.name)
})

test('Renders with requests variant', async () => {
  const {requests_table} = getUsersPayload()
  const {variant} = requests_table
  expect(variant).toEqual(undefined)
  render(<RequestsTable {...requests_table} />)

  const rowHeaders = screen.getAllByRole('rowheader')
  expect(rowHeaders).toHaveLength(5)

  const icons = screen.getAllByTestId('github-avatar')
  expect(icons).toHaveLength(5)
})

test('Renders with route variant', async () => {
  const {requests_table} = getInstallationsPayload()
  const {variant} = requests_table
  expect(variant).toEqual('routes')
  render(<RequestsTable {...requests_table} />)

  const rowHeaders = screen.getAllByRole('rowheader')
  expect(rowHeaders).toHaveLength(10)

  const icons = screen.queryByTestId('github-avatar')
  expect(icons).toBeNull()
})
