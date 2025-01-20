import type {Meta, StoryObj} from '@storybook/react'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {getAppPayload, getListRoutePayload} from '../test-utils/mock-data'
import {ReadOnlyProvider} from '../contexts/ReadOnlyContext'
import {BasePathProvider} from '../contexts/BasePathContext'
import {OrganizationProvider} from '../contexts/OrganizationContext'
import {List} from './List'

const appPayload = getAppPayload()
const routePayload = getListRoutePayload()
const basePath = '/groups'

const meta: Meta<typeof List> = {
  title: 'Apps/Group settings/List',
  component: List,
}

export const Default: StoryObj<typeof List> = {
  render: () => {
    return (
      <Wrapper routePayload={routePayload} appPayload={appPayload}>
        <ReadOnlyProvider readOnly={false}>
          <BasePathProvider basePath={basePath}>
            <OrganizationProvider organization={appPayload.organization}>
              <List />
            </OrganizationProvider>
          </BasePathProvider>
        </ReadOnlyProvider>
      </Wrapper>
    )
  },
}

export default meta
