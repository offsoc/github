import {screen} from '@testing-library/react'
import {render as reactRender} from '@github-ui/react-core/test-utils'
import {TestWrapper} from '@github-ui/security-campaigns-shared/test-utils/TestWrapper'
import {RepositoriesPanel, type RepositoriesPanelProps} from '../../components/RepositoriesPanel'
import type {AlertsSummaryResponse} from '../../hooks/use-alerts-summary-query'

const alertsSummary: AlertsSummaryResponse = {
  repositories: [
    {
      repository: {
        name: 'octodemo',
        ownerLogin: 'github',
        path: '/github/octodemo',
        typeIcon: 'lock',
      },
      alertCount: 50,
    },
    {
      repository: {
        name: 'octocat',
        ownerLogin: 'github',
        path: '/github/octocat',
        typeIcon: 'lock',
      },
      alertCount: 70,
    },
  ],
}

const render = (props?: Partial<RepositoriesPanelProps>) =>
  reactRender(<RepositoriesPanel alertsSummary={alertsSummary} {...props} />, {wrapper: TestWrapper})

test('renders the list of repositories', () => {
  render()

  const listItems = screen.getAllByRole('listitem')
  expect(listItems).toHaveLength(2)

  expect(listItems[0]).toHaveTextContent('octocat')
  expect(listItems[0]).toHaveTextContent('70 alerts')

  expect(listItems[1]).toHaveTextContent('octodemo')
  expect(listItems[1]).toHaveTextContent('50 alerts')
})

test('can filter the list of repositories', async () => {
  const {user} = render()

  await user.type(screen.getByRole('searchbox'), 'cat')

  const listItems = screen.getAllByRole('listitem')
  expect(listItems).toHaveLength(1)

  expect(listItems[0]).toHaveTextContent('octocat')
})

test('renders an empty list when the alerts summary is undefined', () => {
  render({
    alertsSummary: undefined,
  })

  expect(screen.getByRole('list')).toBeInTheDocument()
  expect(screen.getByRole('searchbox')).toBeInTheDocument()

  const listItems = screen.queryAllByRole('listitem')
  expect(listItems).toHaveLength(0)
})
