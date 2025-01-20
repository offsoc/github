import {jsonRoute} from '@github-ui/react-core/json-route'
import {renderHook} from '@testing-library/react'

import {businessCustomPropertiesRoute, definitionsRoute, propertiesRoute} from '../../custom-properties'
import {getRouteWrapper} from '../../test-utils/RouteWrapper'
import {usePropertySource} from '../use-property-source'

describe('usePropertySource', () => {
  it('parses organization from route', () => {
    const {result} = renderHook(usePropertySource, {
      wrapper: getRouteWrapper('/organizations/acme/settings/custom-properties', definitionsRoute),
    })

    const {pathPrefix, sourceName} = result.current
    expect(pathPrefix).toEqual('organizations')
    expect(sourceName).toEqual('acme')
  })

  it('parses enterprise from route', () => {
    const {result} = renderHook(usePropertySource, {
      wrapper: getRouteWrapper('/enterprises/acme-corp/settings/custom-properties', businessCustomPropertiesRoute),
    })

    const {pathPrefix, sourceName} = result.current
    expect(pathPrefix).toEqual('enterprises')
    expect(sourceName).toEqual('acme-corp')
  })

  it('errors if pathname is invalid', () => {
    jest.spyOn(console, 'error').mockImplementation()

    expect(() =>
      renderHook(usePropertySource, {
        wrapper: getRouteWrapper('/monalisa/smile/settings/custom-properties', propertiesRoute),
      }),
    ).toThrow('Current path must start with /enterprises or /organizations')
  })

  it('errors if organization cannot be parsed', () => {
    jest.spyOn(console, 'error').mockImplementation()

    const badOrganizationRoute = jsonRoute({
      path: '/organizations/:WRONG/settings/custom-properties',
      Component: DummyComponent,
    })

    expect(() =>
      renderHook(usePropertySource, {
        wrapper: getRouteWrapper('/organizations/acme/settings/custom-properties', badOrganizationRoute),
      }),
    ).toThrow('Could not parse organization from route')
  })

  it('errors if enterprise cannot be parsed', () => {
    jest.spyOn(console, 'error').mockImplementation()

    const badBusinessRoute = jsonRoute({
      path: '/enterprises/:WRONG/settings/custom-properties',
      Component: DummyComponent,
    })

    expect(() =>
      renderHook(usePropertySource, {
        wrapper: getRouteWrapper('/enterprises/acme-corp/settings/custom-properties', badBusinessRoute),
      }),
    ).toThrow('Could not parse business from route')
  })
})

function DummyComponent() {
  return <p>This has the wrong params</p>
}
