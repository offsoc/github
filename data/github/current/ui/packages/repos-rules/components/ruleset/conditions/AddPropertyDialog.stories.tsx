import type {Meta} from '@storybook/react'
import {AddPropertyDialog, type AddPropertyDialogProps} from './AddPropertyDialog'
import {Wrapper} from '@github-ui/react-core/test-utils'
import type {PropertyDescriptor} from '../../../types/rules-types'

interface StoryArgs {
  includeOrExclude: 'include' | 'exclude'
}

const meta: Meta<StoryArgs> = {
  title: 'Apps/Rulesets/Ruleset Page/AddPropertyDialog',
  decorators: [
    (Story, {args}) => (
      <Wrapper appPayload={{['enabled_features']: args}}>
        <Story {...args} />
      </Wrapper>
    ),
  ],
  args: {
    includeOrExclude: 'include',
  },
  argTypes: {
    includeOrExclude: {
      options: ['include', 'exclude'],
      control: {type: 'radio'},
    },
  },
}

export default meta

const customProperties: PropertyDescriptor[] = [
  {
    name: 'ci_enabled',
    description: '',
    valueType: 'true_false',
    allowedValues: undefined,
    source: 'custom',
    icon: 'note',
    displayName: 'Property: ci_enabled',
  },
  {
    name: 'database',
    description:
      'Tenetur aperiam commodi. Aliquam vitae aut. Eius saepe veniam. Quo itaque voluptas. Voluptatem et voluptate. Aut ex eum. Molestiae voluptas tempora. Aut asperiores nobis. Qui quo dolor. Placeat eum eveniet. Reiciendis ad temporibus. Culpa et quas. A.',
    valueType: 'single_select',
    allowedValues: ['postgresql', 'mysql', 'mongo'],
    source: 'custom',
    icon: 'note',
    displayName: 'Property: database',
  },
  {
    name: 'deployment',
    description: 'Enim commodi eum. Rerum et qui. Aut et labore.',
    valueType: 'string',
    allowedValues: undefined,
    source: 'custom',
    icon: 'note',
    displayName: 'Property: deployment',
  },
  {
    name: 'fork',
    description: 'Enim commodi eum. Rerum et qui. Aut et labore.',
    valueType: 'true_false',
    allowedValues: ['true', 'false'],
    source: 'custom',
    icon: 'note',
    displayName: 'Property: fork',
  },
  {
    name: 'fork',
    description: '',
    valueType: 'true_false',
    allowedValues: ['true', 'false'],
    source: 'system',
    icon: 'repo-forked',
    displayName: 'Fork',
  },
  {
    name: 'language',
    description: '',
    valueType: 'single_select',
    allowedValues: undefined,
    source: 'system',
    icon: 'code',
    displayName: 'Language',
  },
  {
    name: 'visibility',
    description: '',
    valueType: 'single_select',
    allowedValues: ['public', 'private', 'internal'],
    source: 'system',
    icon: 'eye',
    displayName: 'Visibility',
  },
]

const defaultProps: AddPropertyDialogProps = {
  properties: customProperties,
  onAdd: () => undefined,
  onClose: () => undefined,
  includeOrExclude: 'include',
}

export const Default = ({includeOrExclude}: StoryArgs) => {
  return <AddPropertyDialog {...defaultProps} includeOrExclude={includeOrExclude} />
}
