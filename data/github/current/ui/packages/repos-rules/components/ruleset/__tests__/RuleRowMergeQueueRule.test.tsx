import {act, fireEvent, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {RuleRow} from '../RuleRow'
import type {Rule, RuleSchema} from '../../../types/rules-types'
import {mockFetch} from '@github-ui/mock-fetch'

const routePayload = {source: {name: 'github/github'}, sourceType: 'repository'}

type MergeMethodOptions = 'MERGE' | 'REBASE' | 'SQUASH'
type GroupingStrategyOptions = 'ALLGREEN' | 'HEADGREEN'

type MergeQueueRuleOptions = {
  grouping_strategy?: GroupingStrategyOptions
  merge_method?: MergeMethodOptions
}

const fetchMergeMethods = async () => {
  await mockFetch.resolvePendingRequest(`/merge_queue_merge_methods.json`, [
    {
      label: 'Merge commit',
      value: 'MERGE',
      enabled: true,
    },
    {
      label: 'Squash and merge',
      value: 'SQUASH',
      enabled: true,
    },
    {
      label: 'Rebase and merge',
      value: 'REBASE',
      enabled: true,
    },
  ])
}

const createPartialMergeQueueRule = ({grouping_strategy, merge_method}: MergeQueueRuleOptions = {}): Rule => {
  const parameters: Partial<MergeQueueRuleOptions> = {}
  if (grouping_strategy !== undefined) parameters.grouping_strategy = grouping_strategy
  if (merge_method !== undefined) parameters.merge_method = merge_method

  return {
    id: 1,
    _enabled: true,
    _dirty: true,
    ruleType: 'merge_queue',
    parameters,
  }
}

const partialMergeQueueRuleSchema: RuleSchema = {
  type: 'merge_queue',
  displayName: 'Require merge queue',
  description: 'Merges must be performed via a merge queue.',
  beta: true,
  parameterSchema: {
    name: 'merge queue',
    fields: [
      {
        type: 'string',
        name: 'merge_method',
        display_name: 'Merge method',
        description: 'Method to use when merging changes from queued pull requests.',
        required: true,
        default_value: 'MERGE',
        ui_control: 'merge_queue_merge_method',
        allowed_options: [
          {
            display_name: 'Merge commit',
            value: 'MERGE',
          },
          {
            display_name: 'Squash and merge',
            value: 'SQUASH',
          },
          {
            display_name: 'Rebase and merge',
            value: 'REBASE',
          },
        ],
        allowed_values: ['MERGE', 'SQUASH', 'REBASE'],
        ui_prefer_dropdown: true,
      },
      {
        type: 'string',
        name: 'grouping_strategy',
        display_name: 'Require all queue entries to pass required checks',
        description:
          'When set to ALLGREEN, the merge commit created by merge queue for each PR in the group must pass all required checks to merge. When set to HEADGREEN, only the commit at the head of the merge group, i.e. the commit containing changes from all of the PRs in the group, must pass its required checks to merge.',
        required: true,
        default_value: 'ALLGREEN',
        ui_control: 'merge_queue_grouping_strategy',
        allowed_values: ['ALLGREEN', 'HEADGREEN'],
        ui_prefer_dropdown: true,
      },
    ],
  },
}

const renderRule = (mergeQueueRuleOptions: MergeQueueRuleOptions, readOnly: boolean) => {
  const rule = createPartialMergeQueueRule(mergeQueueRuleOptions)
  render(
    <RuleRow
      readOnly={readOnly}
      rule={rule}
      ruleSchema={partialMergeQueueRuleSchema}
      sourceType="repository"
      errors={[]}
      onAdd={() => null}
      onRemove={() => null}
      onUpdateParameters={() => null}
    />,
    {routePayload},
  )

  const showSettingsButton = screen.getByText('Show additional settings')
  fireEvent.click(showSettingsButton)
}

const expectMergeMethodSettings = async (mergeMethod: MergeMethodOptions, readOnly: boolean) => {
  const expectedValues: Record<MergeMethodOptions, string> = {
    MERGE: 'Merge commit',
    REBASE: 'Rebase and merge',
    SQUASH: 'Squash and merge',
  }

  renderRule({merge_method: mergeMethod}, readOnly)

  if (readOnly) {
    const method = screen.getByText(expectedValues[mergeMethod])
    expect(method).toBeDefined()
    const mergeMethodButton = screen.queryByRole('button', {name: 'Select merge method'})
    expect(mergeMethodButton).not.toBeInTheDocument()
  } else {
    const mergeMethodButton = screen.getByRole('button', {name: 'Select merge method'})
    expect(mergeMethodButton.textContent).toBe(expectedValues[mergeMethod])

    fireEvent.click(mergeMethodButton)
    await act(fetchMergeMethods)

    const menuItems = screen.getAllByRole('menuitemradio')
    expect(menuItems).toHaveLength(3)
    const mergeItem = menuItems.find(item => item.textContent === 'Merge commit')
    expect(mergeItem).toBeDefined()
    expect(mergeItem).toHaveAttribute('aria-checked', (expectedValues[mergeMethod] === 'Merge commit').toString())
    const rebaseItem = menuItems.find(item => item.textContent === 'Rebase and merge')
    expect(rebaseItem).toBeDefined()
    expect(rebaseItem).toHaveAttribute('aria-checked', (expectedValues[mergeMethod] === 'Rebase and merge').toString())
    const squashItem = menuItems.find(item => item.textContent === 'Squash and merge')
    expect(squashItem).toBeDefined()
    expect(squashItem).toHaveAttribute('aria-checked', (expectedValues[mergeMethod] === 'Squash and merge').toString())
  }
}

const expectGroupingStrategySettings = async (
  groupingStrategy?: GroupingStrategyOptions,
  readOnly: boolean = false,
) => {
  renderRule({grouping_strategy: groupingStrategy}, readOnly)

  const label = 'Require all queue entries to pass required checks'

  if (readOnly) {
    const checkbox = screen.queryByLabelText(label)
    expect(checkbox).not.toBeInTheDocument()
    const displayName = screen.queryByText(label)
    if (groupingStrategy === 'ALLGREEN') {
      expect(displayName).toBeInTheDocument()
    } else {
      expect(displayName).not.toBeInTheDocument()
    }
  } else {
    const checkbox = screen.getByLabelText(label)
    if (groupingStrategy === 'ALLGREEN') {
      expect(checkbox).toBeChecked()
    } else {
      expect(checkbox).not.toBeChecked()
    }
  }
}

describe('RuleRow for merge queue', () => {
  describe('with merge method MERGE', () => {
    describe('with readOnly true', () => {
      test("render 'Merge commit' as readonly setting", async () => {
        await expectMergeMethodSettings('MERGE', true)
      })
    })
    describe('with readOnly false', () => {
      test("render 'Merge commit' as setting", async () => {
        await expectMergeMethodSettings('MERGE', false)
      })
    })
  })

  describe('with merge method REBASE', () => {
    describe('with readOnly true', () => {
      test("render 'Rebase and Merge' as readonly setting", async () => {
        await expectMergeMethodSettings('REBASE', true)
      })
    })
    describe('with readOnly false', () => {
      test("render 'Rebase and Merge' as setting", async () => {
        await expectMergeMethodSettings('REBASE', false)
      })
    })
  })

  describe('with merge method SQUASH', () => {
    describe('with readOnly true', () => {
      test("render 'Squash and Merge' as readonly setting", async () => {
        await expectMergeMethodSettings('SQUASH', true)
      })
    })
    describe('with readOnly false', () => {
      test("render 'Squash and Merge' as setting", async () => {
        await expectMergeMethodSettings('SQUASH', false)
      })
    })
  })

  describe('with grouping strategy ALLGREEN', () => {
    describe('with readOnly true', () => {
      test('render display name', () => {
        expectGroupingStrategySettings('ALLGREEN', true)
      })
    })
    describe('with readOnly false', () => {
      test('render checked checkbox', () => {
        expectGroupingStrategySettings('ALLGREEN', false)
      })
    })
  })

  describe('with grouping strategy HEADGREEN', () => {
    describe('with readOnly true', () => {
      test('do not render setting', () => {
        expectGroupingStrategySettings('HEADGREEN', true)
      })
    })
    describe('with readOnly false', () => {
      test('render unchecked checkbox', () => {
        expectGroupingStrategySettings('HEADGREEN', false)
      })
    })
  })
})
