import type {Meta} from '@storybook/react'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {getPageRoutePayload} from '../test-utils/mock-data'
import {RelayPage} from './RelayPage'

const routePayload = getPageRoutePayload()

const meta = {
  title: 'Apps/React Core/Navigation Test/RelayPage',
  component: RelayPage,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof RelayPage>

export default meta

export const RelayPageExample = {
  args: {},
  render: () => <Wrapper routePayload={routePayload}>{/* <RelayPage /> */}</Wrapper>,
}
