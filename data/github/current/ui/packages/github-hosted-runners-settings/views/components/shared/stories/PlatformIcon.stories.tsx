import type {Meta} from '@storybook/react'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {PlatformIcon} from '../PlatformIcon'
import {PlatformOsType as OsType} from '../../../../types/platform'

import {getNewRunnerRoutePayload} from '../../../../test-utils/mock-data'

const routePayload = getNewRunnerRoutePayload()

const meta = {
  title: 'Apps/GitHub Hosted Runners Settings/Platform Icon',
  component: PlatformIcon,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof PlatformIcon>

export default meta

export const PlatformIconExample = {
  args: {},
  render: () => (
    <Wrapper routePayload={routePayload}>
      <PlatformIcon osType={OsType.Linux} size={24} />
      <PlatformIcon osType={OsType.Windows} size={24} />
      <PlatformIcon />
    </Wrapper>
  ),
}
