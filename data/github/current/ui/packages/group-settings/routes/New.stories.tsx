import type {Meta, StoryObj} from '@storybook/react'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {HttpResponse, http} from '@github-ui/storybook/msw'
import {getAppPayload, getListRoutePayload, getNewRoutePayload} from '../test-utils/mock-data'
import {ReadOnlyProvider} from '../contexts/ReadOnlyContext'
import {BasePathProvider} from '../contexts/BasePathContext'
import {OrganizationProvider} from '../contexts/OrganizationContext'
import {New} from './New'

const appPayload = getAppPayload()
const routePayload = getNewRoutePayload()
const basePath = '/groups'

const ignoreScrollableRegionFocusable = {
  parameters: {
    a11y: {
      element: '#storybook-root',
      config: {
        rules: [
          {
            id: 'scrollable-region-focusable',
            selector: '*:not([data-listview-component="items-list"])',
          },
        ],
      },
    },
  },
}

const meta: Meta<typeof New> = {
  title: 'Apps/Group settings/New',
  component: New,
  parameters: {
    msw: {
      handlers: [
        http.get(basePath, () => {
          return HttpResponse.json({payload: getListRoutePayload()})
        }),
        http.post(`${basePath}/new`, () => {
          return HttpResponse.json(getNewRoutePayload())
        }),
      ],
    },
  },
}

export const Default: StoryObj<typeof New> = {
  ...ignoreScrollableRegionFocusable,
  render: () => {
    return (
      <Wrapper routePayload={routePayload} appPayload={appPayload}>
        <ReadOnlyProvider readOnly={false}>
          <BasePathProvider basePath={basePath}>
            <OrganizationProvider organization={appPayload.organization}>
              <New />
            </OrganizationProvider>
          </BasePathProvider>
        </ReadOnlyProvider>
      </Wrapper>
    )
  },
}

export default meta
