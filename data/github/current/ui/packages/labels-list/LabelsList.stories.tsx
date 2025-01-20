import type {Meta} from '@storybook/react'
import {LabelsList} from './LabelsList'
import {buildLabel} from './build-label'

const meta = {
  title: 'Recipes/Labels/LabelsList',
  component: LabelsList,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
    a11y: {
      config: {
        rules: [
          {
            // Currently matching the legacy experience which also has this violation
            id: 'color-contrast',
            enabled: false,
          },
        ],
      },
    },
  },
} satisfies Meta<typeof LabelsList>

export default meta

export const Empty = {
  render: () => <LabelsList labels={[]} />,
}

const labels = [
  buildLabel({
    name: 'good for new contributors',
    color: '0000FF',
  }),
  buildLabel({
    name: 'here there be dragons',
    color: 'FF0000',
  }),
  buildLabel({
    name: 'bug',
    color: 'FFA500',
  }),
  buildLabel({
    name: 'enhancement',
    color: '008000',
  }),
  buildLabel({
    name: 'documentation',
    color: '9400D3',
  }),
]
export const SeveralLabels = {
  render: () => <LabelsList labels={labels} />,
}
