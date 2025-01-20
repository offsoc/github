import type {Meta, StoryObj} from '@storybook/react'

import type {TargetsPanelProps} from '../TargetsPanel'
import {TargetsPanel as TargetsPanelComponent} from '../TargetsPanel'

import {conditions} from '../../../state/__tests__/helpers'
import type {Condition} from '../../../types/rules-types'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {createRepository} from '@github-ui/current-repository/test-helpers'

type TargetsPanelType = typeof TargetsPanelComponent

const meta: Meta<TargetsPanelType> = {
  title: 'Apps/Rulesets/Ruleset Page/TargetsPanel',
  decorators: [
    (Story, {args}) => {
      return (
        <Wrapper>
          <Story {...args} />
        </Wrapper>
      )
    },
  ],
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    readOnly: {
      control: 'boolean',
      defaultValue: false,
    },
    rulesetTarget: {
      options: ['branch', 'tag'],
      control: {
        type: 'radio',
      },
      defaultValue: 'branch',
    },
    fnmatchHelpUrl: {
      control: 'text',
      defaultValue: 'https://github.com',
    },
    addOrUpdateCondition: {
      action: 'Add or update condition',
    },
    removeCondition: {
      action: 'Remove condition',
    },
  },
}

const defaultArgs: Partial<TargetsPanelProps> = {
  readOnly: false,
  rulesetTarget: 'branch',
  rulesetPreviewCount: 1,
  rulesetPreviewSamples: ['smile'],
  fnmatchHelpUrl: 'https://github.com',
  supportedConditionTargetObjects: ['ref', 'repository'],
  conditions,
  dirtyConditions: [],
  source: createRepository({name: 'acme'}),
}

export default meta
type Story = StoryObj<TargetsPanelType>

export const PopulatedOrg: Story = {
  render: args => {
    return <TargetsPanelComponent {...defaultArgs} {...args} />
  },
}

export const PopulatedRepo: Story = {
  render: args => {
    const repoConditions = conditions.filter(c => c.target === 'ref_name')
    return (
      <TargetsPanelComponent
        {...defaultArgs}
        {...args}
        rulesetPreviewSamples={['main']}
        conditions={repoConditions}
        supportedConditionTargetObjects={['ref']}
      />
    )
  },
}

export const MoreThan10Repos: Story = {
  render: args => {
    return (
      <TargetsPanelComponent
        {...defaultArgs}
        {...args}
        rulesetPreviewCount={30}
        rulesetPreviewSamples={new Array(10).fill(0).map((_, index) => `smile-${index}`)}
      />
    )
  },
}

export const MultipleRepos: Story = {
  render: args => {
    return (
      <TargetsPanelComponent
        {...defaultArgs}
        {...args}
        rulesetPreviewCount={5}
        rulesetPreviewSamples={new Array(5).fill(0).map((_, index) => `smile-${index}`)}
      />
    )
  },
}

export const PropertyRuleset: Story = {
  render: args => {
    const propertyConditions: Condition[] = [
      {
        target: 'repository_property',
        parameters: {
          exclude: [],
          include: [
            {
              name: 'database',
              source: 'custom',
              property_values: ['mysql'],
            },
          ],
        },
        _dirty: false,
      },
    ]

    return (
      <TargetsPanelComponent
        {...defaultArgs}
        {...args}
        conditions={propertyConditions}
        rulesetPreviewCount={5}
        rulesetPreviewSamples={[]}
      />
    )
  },
}

export const Empty: Story = {
  render: args => {
    return (
      <TargetsPanelComponent
        {...defaultArgs}
        {...args}
        conditions={[]}
        rulesetPreviewCount={undefined}
        rulesetPreviewSamples={undefined}
      />
    )
  },
}

export const NoTargets: Story = {
  render: args => {
    return (
      <TargetsPanelComponent
        {...defaultArgs}
        {...args}
        conditions={[]}
        rulesetPreviewCount={0}
        rulesetPreviewSamples={[]}
      />
    )
  },
}

export const ShowErrorHighNumberTargets: Story = {
  render: args => {
    return (
      <TargetsPanelComponent
        {...defaultArgs}
        {...args}
        rulesetError="Unable to display affected targets due to a large number of branches in this repository."
      />
    )
  },
}
