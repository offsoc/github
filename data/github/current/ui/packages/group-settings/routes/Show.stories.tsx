import type {Meta, StoryObj} from '@storybook/react'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {HttpResponse, http} from '@github-ui/storybook/msw'
import {getAppPayload, getShowRoutePayload, getListRoutePayload} from '../test-utils/mock-data'
import {ReadOnlyProvider} from '../contexts/ReadOnlyContext'
import {BasePathProvider} from '../contexts/BasePathContext'
import {OrganizationProvider} from '../contexts/OrganizationContext'
import {Show} from './Show'

const appPayload = getAppPayload()
const routePayload = getShowRoutePayload()
const basePath = '/groups'

const meta: Meta<typeof Show> = {
  title: 'Apps/Group settings/Show',
  component: Show,
  parameters: {
    msw: {
      handlers: [
        http.get(basePath, () => {
          return HttpResponse.json({payload: getListRoutePayload()})
        }),
        http.post(`${basePath}/**/*`, () => {
          return HttpResponse.json(getShowRoutePayload())
        }),
      ],
    },
  },
}

export const Default: StoryObj<typeof Show> = {
  render: () => {
    return (
      <Wrapper routePayload={routePayload} appPayload={appPayload}>
        <ReadOnlyProvider readOnly={false}>
          <BasePathProvider basePath={basePath}>
            <OrganizationProvider organization={appPayload.organization}>
              <Show />
            </OrganizationProvider>
          </BasePathProvider>
        </ReadOnlyProvider>
      </Wrapper>
    )
  },
}

export default meta
