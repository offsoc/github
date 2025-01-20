import type {Meta} from '@storybook/react'
import {HttpResponse, http} from '@github-ui/storybook/msw'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {Index, type IndexProps} from './Index'
import smallData from '../test-utils/small-data'

const meta = {
  title: 'Recipes/ReposContributorsChart/Index',
  component: Index,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
    msw: {
      handlers: [
        http.get(`/contributors-data`, () => {
          return HttpResponse.json(smallData)
        }),
      ],
    },
    // TODO This should be fixed upstream in the chart-card package
    a11y: {
      element: '#storybook-root',
      config: {
        rules: [
          {
            id: 'landmark-unique',
            enabled: false,
          },
        ],
      },
    },
  },
  argTypes: {},
} satisfies Meta<typeof Index>

export default meta

const defaultArgs: Partial<IndexProps> = {
  graphDataPath: '/contributors-data?big',
}

export const SmallChart = {
  args: {
    ...defaultArgs,
    graphDataPath: '/contributors-data',
  },
  render: (args: IndexProps) => <WrappedChart {...args} />,
}

const WrappedChart = (args: Partial<IndexProps>) => (
  <Wrapper routePayload={args}>
    <Index />
  </Wrapper>
)
