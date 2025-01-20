import {Wrapper} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'

import {
  DefaultMilestonePickerAnchor,
  MilestonePicker,
  MilestonePickerSearchGraphqlQuery,
  type MilestonePickerProps,
} from '../components/MilestonePicker'
import {noop} from '@github-ui/noop'
import {renderRelay} from '@github-ui/relay-test-utils'
import {MockPayloadGenerator, createMockEnvironment} from 'relay-test-utils'
import type {OperationDescriptor} from 'relay-runtime'
import {VALUES} from '../constants/values'

test('open picker via click', async () => {
  const {user} = renderRelay(
    () => {
      const sharedProps = {
        shortcutEnabled: false,
        activeMilestone: null,
      } as MilestonePickerProps

      return (
        <MilestonePicker
          {...sharedProps}
          repo="github"
          owner="issues"
          readonly={false}
          onSelectionChanged={noop}
          anchorElement={props => <DefaultMilestonePickerAnchor anchorProps={props} {...sharedProps} />}
        />
      )
    },
    {
      relay: {
        queries: {
          recentMilestones: {
            type: 'lazy',
          },
        },
        mockResolvers: {
          Repository: () => ({
            milestones: {
              nodes: Array(2).fill(undefined),
            },
          }),
        },
      },
      wrapper: Wrapper,
    },
  )

  await user.click(screen.getByRole('button', {name: 'Select milestone'}))

  expect(screen.getByRole('heading', {name: 'Set milestone'})).toBeInTheDocument()
  expect(screen.getByRole('textbox', {name: 'Filter milestones'})).toBeInTheDocument()

  const milestones = screen.getAllByRole('option')
  expect(milestones).toHaveLength(2)
})

test('open picker via keyboard when shortcutEnabled is true', async () => {
  const {user} = renderRelay(
    () => {
      const sharedProps = {
        shortcutEnabled: true,
        activeMilestone: null,
      } as MilestonePickerProps

      return (
        <MilestonePicker
          {...sharedProps}
          repo="github"
          owner="issues"
          readonly={false}
          onSelectionChanged={noop}
          anchorElement={props => <DefaultMilestonePickerAnchor anchorProps={props} {...sharedProps} />}
        />
      )
    },
    {
      relay: {
        queries: {
          recentMilestones: {
            type: 'lazy',
          },
        },
      },
      wrapper: Wrapper,
    },
  )

  expect(screen.queryByText('Set milestone')).not.toBeInTheDocument()

  await user.keyboard('m')

  expect(screen.getByText('Set milestone')).toBeInTheDocument()
})

test('selecting a milestone is calling the onSelectionChanged callback', async () => {
  const onSelectionChangeMock = jest.fn()
  const {user} = renderRelay(
    () => {
      const sharedProps = {
        shortcutEnabled: true,
        activeMilestone: null,
      } as MilestonePickerProps

      return (
        <MilestonePicker
          {...sharedProps}
          repo="github"
          owner="issues"
          readonly={false}
          onSelectionChanged={onSelectionChangeMock}
          anchorElement={props => <DefaultMilestonePickerAnchor anchorProps={props} {...sharedProps} />}
        />
      )
    },
    {
      relay: {
        queries: {
          recentMilestones: {
            type: 'lazy',
          },
        },
      },
      wrapper: Wrapper,
    },
  )

  await user.keyboard('m')

  const milestones = screen.getAllByRole('option')
  const firstMilestone = milestones[0]!

  await user.click(firstMilestone)

  expect(onSelectionChangeMock).toHaveBeenNthCalledWith(1, [
    expect.objectContaining({title: firstMilestone.textContent}),
  ])
})

test('do not open picker via keyboard when shortcutEnabled is false', async () => {
  const {user} = renderRelay(
    () => {
      const sharedProps = {
        shortcutEnabled: false,
        activeMilestone: null,
      } as MilestonePickerProps

      return (
        <MilestonePicker
          {...sharedProps}
          repo="github"
          owner="issues"
          readonly={false}
          onSelectionChanged={noop}
          anchorElement={props => <DefaultMilestonePickerAnchor anchorProps={props} {...sharedProps} />}
        />
      )
    },
    {
      relay: {
        queries: {
          recentMilestones: {
            type: 'lazy',
          },
        },
      },
      wrapper: Wrapper,
    },
  )

  await user.keyboard('m')

  expect(screen.queryByText('Set milestone')).not.toBeInTheDocument()
})

test('server request searching', async () => {
  const environment = createMockEnvironment()
  const owner = 'github'
  const repo = 'issues'
  const {user} = renderRelay(
    () => {
      const sharedProps = {
        shortcutEnabled: true,
        activeMilestone: null,
      } as MilestonePickerProps

      return (
        <MilestonePicker
          {...sharedProps}
          owner={owner}
          repo={repo}
          readonly={false}
          onSelectionChanged={noop}
          anchorElement={props => <DefaultMilestonePickerAnchor anchorProps={props} {...sharedProps} />}
        />
      )
    },
    {
      relay: {
        queries: {
          recentMilestones: {
            type: 'lazy',
          },
        },
        mockResolvers: {
          Repository: () => ({
            milestones: {
              nodes: [{title: 'milestone A'}, {title: 'milestone B'}],
            },
          }),
        },
        environment,
      },
      wrapper: Wrapper,
    },
  )

  await user.keyboard('m')

  // Expect preloaded milestones
  expect(screen.getByText('milestone A')).toBeInTheDocument()
  expect(screen.getByText('milestone B')).toBeInTheDocument()

  // Type on the input, should be auto-focused
  const filterInput = screen.getByRole('textbox', {name: 'Filter milestones'})
  expect(filterInput).toHaveFocus()

  await act(async () => {
    await user.type(filterInput, 'give me my mocked milestones')
  })

  await act(async () => {
    // Mock search request
    environment.mock.queuePendingOperation(MilestonePickerSearchGraphqlQuery, {
      query: 'give me my mocked milestones',
      owner,
      repo,
      count: 10,
    })
    environment.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        Repository: () => ({
          milestones: {
            nodes: [{title: 'Cool mocked milestone'}],
          },
        }),
      }),
    )
  })

  // Expect filtered milestone only, async required due to debounce
  await screen.findByText('Cool mocked milestone', undefined, {timeout: VALUES.pickerDebounceTime + 100})
  expect(screen.queryByText('milestone A')).not.toBeInTheDocument()
  expect(screen.queryByText('milestone B')).not.toBeInTheDocument()
})

test('shows the correct milestone description', async () => {
  const environment = createMockEnvironment()
  const owner = 'github'
  const repo = 'issues'

  const previousDateDateTime = () => {
    const date = new Date()
    date.setDate(date.getDate() - 2)
    return date.toISOString()
  }

  const futureDateDateTime = () => {
    const date = new Date()
    date.setDate(date.getDate() + 2)
    return date.toISOString()
  }

  const previousDate = previousDateDateTime()
  const futureDate = futureDateDateTime()

  const {user} = renderRelay(
    () => {
      const sharedProps = {
        shortcutEnabled: true,
        activeMilestone: null,
      } as MilestonePickerProps

      return (
        <MilestonePicker
          {...sharedProps}
          owner={owner}
          repo={repo}
          readonly={false}
          onSelectionChanged={noop}
          anchorElement={props => <DefaultMilestonePickerAnchor anchorProps={props} {...sharedProps} />}
          showMilestoneDescription={true}
        />
      )
    },
    {
      relay: {
        queries: {
          recentMilestones: {
            type: 'lazy',
          },
        },
        mockResolvers: {
          Repository: () => ({
            milestones: {
              nodes: [
                {title: 'milestone A', dueOn: previousDate, closed: false},
                {title: 'milestone B', dueOn: futureDate, closed: false},
                {title: 'milestone C', closed: false},
                {title: 'milestone D', closed: true, closedAt: previousDate},
              ],
            },
          }),
        },
        environment,
      },
      wrapper: Wrapper,
    },
  )

  await user.keyboard('m')

  // eslint-disable-next-line testing-library/no-node-access
  const previousRelativeTime = document.querySelector(`[datetime="${previousDate}"]`)

  // Expect preloaded milestones
  expect(screen.getByText('Past due by')).toBeInTheDocument()
  expect(screen.getByText(/Due\s+by\s+/)).toBeInTheDocument()
  expect(screen.getByText('No due date')).toBeInTheDocument()
  // these are two as we have a section that shows the closed milestones titled `Closed`
  expect(screen.getAllByText('Closed').length).toBe(2)

  expect(previousRelativeTime).toBeInTheDocument()
})
