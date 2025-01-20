import type {Meta} from '@storybook/react'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {getPageRoutePayload} from '../test-utils/mock-data'
import {Page} from './Page'

const routePayload = getPageRoutePayload()

const meta = {
  title: 'Apps/React Core/Navigation Test/Page',
  component: Page,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof Page>

export default meta

export const PageExample = {
  args: {},
  render: () => (
    <Wrapper routePayload={routePayload}>
      <Page />
    </Wrapper>
  ),
}
