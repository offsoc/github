import type {Meta} from '@storybook/react'
import {buildLabel} from '../test-utils/LabelPickerHelpers'
import {LabelPicker} from '../components/LabelPicker'
import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import type {LabelPickerQuery} from './__generated__/LabelPickerQuery.graphql'
import {Button} from '@primer/react'
import {noop} from '@github-ui/noop'

type LabelPickerQueries = {
  labelPickerQuery: LabelPickerQuery
}

function TestLabelPicker() {
  return (
    <LabelPicker
      repo="issues"
      owner="github"
      readonly={false}
      shortcutEnabled={true}
      onSelectionChanged={noop}
      labels={[]}
      anchorElement={anchorProps => <Button {...anchorProps}>Label</Button>}
    />
  )
}

const meta: Meta<typeof LabelPicker> = {
  title: 'ItemPicker/LabelPicker',
  component: TestLabelPicker,
}

export default meta

export const DefaultState = {
  decorators: [relayDecorator<typeof TestLabelPicker, LabelPickerQueries>],
  parameters: {
    relay: {
      queries: {
        labelPickerQuery: {
          type: 'lazy',
        },
      },
      mockResolvers: {
        Repository() {
          return {
            nameWithOwner: 'owner/repo',
            labels: {
              edges: [{node: buildLabel({name: 'labelA'})}, {node: buildLabel({name: 'labelB'})}],
            },
          }
        },
      },
      mapStoryArgs: () => ({
        labels: [],
      }),
    },
  },
} satisfies RelayStoryObj<typeof LabelPicker, LabelPickerQueries>
