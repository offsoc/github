import {act, screen} from '@testing-library/react'
import {renderRelay} from '@github-ui/relay-test-utils'
import {ThemeProvider} from '@primer/react'

import {graphql} from 'react-relay'
import {HeaderMenu} from '../HeaderMenu'
import {BUTTON_LABELS} from '../../../constants/buttons'
import {ISSUE_VIEWER_DEFAULT_CONFIG} from '../../OptionConfig'
import type {HeaderMenuTestQuery, HeaderMenuTestQuery$data} from './__generated__/HeaderMenuTestQuery.graphql'

const query = graphql`
  query HeaderMenuTestQuery @relay_test_operation {
    node(id: "issue1") {
      ...HeaderMenu
    }
  }
`

interface TestComponentProps {
  issue: HeaderMenuTestQuery$data
}

function TestComponent({issue}: TestComponentProps) {
  return (
    <ThemeProvider>
      <HeaderMenu
        metadataPaneTrigger={<></>}
        optionConfig={{
          ...ISSUE_VIEWER_DEFAULT_CONFIG,
          customEditMenuEntries: [<li key="1">Cool action 1</li>, <li key="2">Cool action 2</li>],
          showIssueCreateButton: true,
        }}
        headerMenuData={issue.node!}
      />
    </ThemeProvider>
  )
}

test('Renders custom menu entries with separator', async () => {
  renderRelay<{
    issue: HeaderMenuTestQuery
  }>(({queryData: {issue}}) => <TestComponent issue={issue} />, {
    relay: {
      queries: {
        issue: {
          type: 'fragment',
          query,
          variables: {},
        },
      },
      mockResolvers: {
        Issue() {
          return {
            id: 'issue1',
            viewerCanUpdateNext: true,
          }
        },
      },
    },
  })

  const menuButton = await screen.findByLabelText(BUTTON_LABELS.issueActions)

  await act(() => menuButton.click())

  expect(screen.getByRole('menu')).toBeInTheDocument()
  expect(screen.getByText('Cool action 1')).toBeInTheDocument()
  expect(screen.getByText('Cool action 2')).toBeInTheDocument()
})

test('renders create button if repository is not archived', async () => {
  renderRelay<{
    issue: HeaderMenuTestQuery
  }>(({queryData: {issue}}) => <TestComponent issue={issue} />, {
    relay: {
      queries: {
        issue: {
          type: 'fragment',
          query,
          variables: {},
        },
      },
      mockResolvers: {
        Issue() {
          return {
            id: 'issue1',
            viewerCanUpdateNext: true,
            repository: {
              isArchived: false,
            },
          }
        },
      },
    },
  })

  expect(screen.getByRole('link', {name: 'New issue'})).toBeInTheDocument()
})

test('renders create button if repository is archived', async () => {
  renderRelay<{
    issue: HeaderMenuTestQuery
  }>(({queryData: {issue}}) => <TestComponent issue={issue} />, {
    relay: {
      queries: {
        issue: {
          type: 'fragment',
          query,
          variables: {},
        },
      },
      mockResolvers: {
        Issue() {
          return {
            id: 'issue1',
            viewerCanUpdateNext: true,
            repository: {
              isArchived: true,
            },
          }
        },
      },
    },
  })

  expect(screen.queryByRole('link', {name: 'New issue'})).not.toBeInTheDocument()
})
