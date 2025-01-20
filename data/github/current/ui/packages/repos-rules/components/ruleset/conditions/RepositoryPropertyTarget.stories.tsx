import type {Meta} from '@storybook/react'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {RepositoryPropertyTarget, type RepositoryPropertyTargetProps} from './RepositoryPropertyTarget'
import type {PropertyConfiguration} from '../../../types/rules-types'

const meta: Meta = {
  title: 'Apps/Rulesets/Ruleset Page/RepositoryPropertyTarget',
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
}

export default meta

const defaultIncludeParameters: PropertyConfiguration[] = [
  {name: 'database', source: 'custom', property_values: ['mysql']},
  {name: 'fork', source: 'system', property_values: ['true']},
  {name: 'language', source: 'system', property_values: ['python']},
]

const defaultProps: RepositoryPropertyTargetProps = {
  parameters: {
    include: defaultIncludeParameters,
    exclude: [],
  },
  readOnly: false,
  rulesetTarget: 'branch',
  updateParameters: () => undefined,
  blankslate: {
    heading: 'No repository targets have been added yet',
  },
}

export const Default = () => {
  return <RepositoryPropertyTarget {...defaultProps} />
}
