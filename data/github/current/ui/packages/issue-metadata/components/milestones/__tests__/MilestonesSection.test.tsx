import {act, screen, within} from '@testing-library/react'
import {createMockEnvironment} from 'relay-test-utils'

import {graphql} from 'react-relay'
import {
  CreateIssueMilestonesSection,
  EditIssueMilestonesSection,
  type CreateIssueMilestonesSectionProps,
} from '../MilestonesSection'
import {TEST_IDS} from '../../../constants/test-ids'
import {renderRelay} from '@github-ui/relay-test-utils'
import type {MilestonesSectionTestQuery} from './__generated__/MilestonesSectionTestQuery.graphql'
import type {MilestonePickerQuery} from '@github-ui/item-picker/MilestonePickerQuery.graphql'
import type {MockResolvers} from 'relay-test-utils/lib/RelayMockPayloadGenerator'
import {noop} from '@github-ui/noop'
import {Wrapper} from '@github-ui/react-core/test-utils'

const renderEditIssueMilestonesSection = (mockResolvers: MockResolvers) => {
  const environment = createMockEnvironment()

  renderRelay<{issueMilestones: MilestonesSectionTestQuery; milestonePicker: MilestonePickerQuery}>(
    ({queryData}) => (
      <EditIssueMilestonesSection
        issue={queryData.issueMilestones.repository!.issue!}
        singleKeyShortcutsEnabled={true}
      />
    ),
    {
      relay: {
        queries: {
          issueMilestones: {
            type: 'fragment',
            query: graphql`
              query MilestonesSectionTestQuery($owner: String!, $repo: String!, $number: Int!) {
                repository(owner: $owner, name: $repo) {
                  issue(number: $number) {
                    ...MilestonesSectionFragment
                  }
                }
              }
            `,
            variables: {owner: 'owner', repo: 'repo', number: 1},
          },
          milestonePicker: {
            type: 'lazy',
          },
        },
        mockResolvers,
        environment,
      },
    },
  )

  return environment
}

describe('EditIssueMilestonesSection', () => {
  describe('Button conditional rendering for permissions', () => {
    test('renders no buttons without permissions', async () => {
      renderEditIssueMilestonesSection({
        Issue: () => ({
          milestone: null,
          viewerCanSetMilestone: false,
        }),
      })

      expect(screen.queryByText('Edit Milestone')).not.toBeInTheDocument()
    })

    test('renders milestones edit button', async () => {
      renderEditIssueMilestonesSection({
        Issue: () => ({
          milestone: null,
          viewerCanSetMilestone: true,
        }),
      })

      expect(await screen.findByText('Edit Milestone')).toBeInTheDocument()
    })
  })

  test('renders milestones data', async () => {
    renderEditIssueMilestonesSection({
      Milestone: () => ({
        title: 'New Milestone',
        progressPercentage: 30,
      }),
    })

    // Find the milestone
    const milestones = await screen.findByTestId(TEST_IDS.milestoneContainer)
    expect(within(milestones).getAllByText('New Milestone').length).toBe(1)
    expect(within(milestones).getByTestId(TEST_IDS.milestoneProgressIcon)).toBeTruthy()
  })
})

const renderCreateIssueMilestonesSection = ({
  mockResolvers,
  props,
}: {
  mockResolvers?: MockResolvers
  props?: Partial<CreateIssueMilestonesSectionProps>
}) => {
  const environment = createMockEnvironment()

  renderRelay<{milestonePicker: MilestonePickerQuery}>(
    () => (
      <CreateIssueMilestonesSection
        repo="issues"
        owner="github"
        milestone={null}
        onSelectionChange={noop}
        viewerCanSetMilestone={false}
        insidePortal={false}
        shortcutEnabled={false}
        {...props}
      />
    ),
    {
      relay: {
        queries: {
          milestonePicker: {
            type: 'lazy',
          },
        },
        mockResolvers,
        environment,
      },
      wrapper: Wrapper,
    },
  )

  return environment
}

describe('CreateIssueMilestonesSection', () => {
  test('renders active milestone', () => {
    renderCreateIssueMilestonesSection({
      props: {
        viewerCanSetMilestone: false,
        milestone: {
          id: '1',
          closed: false,
          dueOn: null,
          url: 'url',
          title: 'New Milestone',
          progressPercentage: 30,
          closedAt: null,
          ' $fragmentType': 'MilestonePickerMilestone',
        },
      },
    })

    // Find the milestone
    expect(screen.getByText('New Milestone')).toBeInTheDocument()
    expect(screen.getByTestId(TEST_IDS.milestoneProgressIcon)).toBeTruthy()
    expect(screen.queryByRole('button', {name: 'Edit Milestone'})).not.toBeInTheDocument()
  })

  test('renders edit button when permitted', () => {
    renderCreateIssueMilestonesSection({
      props: {
        viewerCanSetMilestone: true,
      },
    })

    expect(screen.getByRole('button', {name: 'Edit Milestone'})).toBeInTheDocument()
  })

  test('callback is called when selecting milestone', () => {
    const onSelectMock = jest.fn()
    renderCreateIssueMilestonesSection({
      mockResolvers: {
        Milestone: () => ({
          title: 'New Milestone',
          closed: false,
          dueOn: null,
          progressPercentage: 30,
        }),
      },
      props: {
        viewerCanSetMilestone: true,
        onSelectionChange: onSelectMock,
      },
    })

    act(() => screen.getByRole('button', {name: 'Edit Milestone'}).click())

    expect(onSelectMock).not.toHaveBeenCalled()

    act(() => screen.getByText('New Milestone').click())

    expect(onSelectMock).toHaveBeenCalledTimes(1)
  })
})
