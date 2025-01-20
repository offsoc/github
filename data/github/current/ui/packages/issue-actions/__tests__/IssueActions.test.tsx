import {noop} from '@github-ui/noop'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {renderRelay} from '@github-ui/relay-test-utils'
import type {RelayMockProps} from '@github-ui/relay-test-utils/RelayTestFactories'
import {screen} from '@testing-library/react'
import {graphql} from 'relay-runtime'

import {IssueActions} from '../IssueActions'
import type {IssueActionsTestQuery} from './__generated__/IssueActionsTestQuery.graphql'

type IssueActionsQueries = {
  actions: IssueActionsTestQuery
}
const relayMock: RelayMockProps<IssueActionsQueries> = {
  queries: {
    actions: {
      type: 'fragment',
      query: graphql`
        query IssueActionsTestQuery($owner: String!, $repo: String!, $number: Int!) @relay_test_operation {
          repository(owner: $owner, name: $repo) {
            issue(number: $number) {
              ...IssueActions
            }
          }
        }
      `,
      variables: {owner: 'owner', repo: 'repo', number: 1},
    },
  },
  mockResolvers: {
    Issue: () => ({
      state: 'OPEN',
      viewerCanClose: true,
    }),
  },
}

it('shows close button and additional actions', async () => {
  const {user} = renderRelay<IssueActionsQueries>(
    ({queryData}) => (
      <IssueActions
        actionRef={queryData.actions.repository!.issue!}
        onAction={noop}
        hasComment={false}
        closeButtonState="CLOSED"
        setCloseButtonState={noop}
        viewerCanClose={true}
      />
    ),
    {
      relay: relayMock,
      wrapper: Wrapper,
    },
  )

  expect(screen.getByRole('button', {name: 'Close issue'})).toBeInTheDocument()

  const moreActionsButton = screen.getByRole('button', {name: 'More options'})
  expect(moreActionsButton).toBeInTheDocument()

  expect(screen.queryByRole('menuitemradio')).not.toBeInTheDocument()

  await user.click(moreActionsButton)

  expect(
    screen.getByRole('menuitemradio', {
      name: 'Close as completed',
      description: 'Done, closed, fixed, resolved',
    }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('menuitemradio', {
      name: 'Close as not planned',
      description: "Won't fix, can't repro, duplicate, stale",
    }),
  ).toBeInTheDocument()
})

it('calls callbacks on button clicks', async () => {
  const onActionMock = jest.fn()
  const setCloseButtonStateMock = jest.fn()

  const {user} = renderRelay<IssueActionsQueries>(
    ({queryData}) => (
      <IssueActions
        actionRef={queryData.actions.repository!.issue!}
        onAction={onActionMock}
        hasComment={false}
        closeButtonState="CLOSED"
        setCloseButtonState={setCloseButtonStateMock}
        viewerCanClose={true}
      />
    ),
    {
      relay: relayMock,
      wrapper: Wrapper,
    },
  )

  expect(setCloseButtonStateMock).toHaveBeenCalledWith('CLOSED')
  await user.click(screen.getByLabelText('More options'))
  await user.click(screen.getByText('Close as not planned'))
  expect(setCloseButtonStateMock).toHaveBeenCalledWith('NOT_PLANNED')

  await user.click(screen.getByText('Close issue'))
  expect(onActionMock).toHaveBeenCalledTimes(1)
})

it('shows a more complete button name when changing from COMPLETE to NOT_PLANNED for a CLOSED issue', () => {
  renderRelay<IssueActionsQueries>(
    ({queryData}) => (
      <IssueActions
        actionRef={queryData.actions.repository!.issue!}
        onAction={noop}
        hasComment={false}
        closeButtonState="NOT_PLANNED"
        setCloseButtonState={noop}
      />
    ),
    {
      relay: {
        ...relayMock,
        mockResolvers: {
          Issue: () => ({
            state: 'CLOSED',
            viewerCanClose: true,
            viewerCanReopen: true,
          }),
        },
      },
    },
  )

  expect(screen.getByText('Close as not planned')).toBeInTheDocument()
})

it('shows a more complete button name when changing from NOT_PLANNED to COMPLETE for a CLOSED issue', () => {
  renderRelay<IssueActionsQueries>(
    ({queryData}) => (
      <IssueActions
        actionRef={queryData.actions.repository!.issue!}
        onAction={noop}
        hasComment={false}
        closeButtonState="CLOSED"
        setCloseButtonState={noop}
      />
    ),
    {
      relay: {
        ...relayMock,
        mockResolvers: {
          Issue: () => ({
            state: 'CLOSED',
            viewerCanClose: true,
            viewerCanReopen: true,
          }),
        },
      },
    },
  )

  expect(screen.getByText('Close as completed')).toBeInTheDocument()
})

describe('permission checks', () => {
  it('shows the close button as disabled when issue is OPEN but user has no permissions to close', () => {
    renderRelay<IssueActionsQueries>(
      ({queryData}) => (
        <IssueActions
          actionRef={queryData.actions.repository!.issue!}
          onAction={noop}
          hasComment={false}
          closeButtonState="CLOSED"
          setCloseButtonState={noop}
        />
      ),
      {
        relay: {
          ...relayMock,
          mockResolvers: {
            Issue: () => ({
              state: 'OPEN',
              viewerCanClose: false,
            }),
          },
        },
      },
    )

    expect(screen.getByRole('button', {name: 'Close issue'})).toBeDisabled()
  })

  it('shows the reopen button as disabled when issue is CLOSED but user has no permissions to reopen', () => {
    renderRelay<IssueActionsQueries>(
      ({queryData}) => (
        <IssueActions
          actionRef={queryData.actions.repository!.issue!}
          onAction={noop}
          hasComment={false}
          closeButtonState="OPEN"
          setCloseButtonState={noop}
        />
      ),
      {
        relay: {
          ...relayMock,
          mockResolvers: {
            Issue: () => ({
              state: 'CLOSED',
              viewerCanReopen: false,
            }),
          },
        },
      },
    )

    expect(screen.getByRole('button', {name: 'Reopen Issue'})).toBeDisabled()
  })
})
