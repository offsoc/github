import {renderHook} from '@testing-library/react'

import {businessCustomPropertiesRoute, definitionsRoute} from '../../custom-properties'
import {getRouteWrapper} from '../../test-utils/RouteWrapper'
import {useEditPropertyPath, useNewPropertyPath} from '../use-property-details-paths'

describe('useNewPropertyPath', () => {
  it('returns path from organization route', () => {
    const {result} = renderHook(() => useNewPropertyPath(), {
      wrapper: getRouteWrapper('/organizations/acme/settings/custom-properties', definitionsRoute),
    })

    expect(result.current).toEqual('/organizations/acme/settings/custom-property')
  })

  it('returns path from enterprise route', () => {
    const {result} = renderHook(() => useNewPropertyPath(), {
      wrapper: getRouteWrapper('/enterprises/acme-corp/settings/custom-properties', businessCustomPropertiesRoute),
    })

    expect(result.current).toEqual('/enterprises/acme-corp/settings/custom-property')
  })
})

describe('useEditPropertyPath', () => {
  it('returns path from organization route', () => {
    const {result} = renderHook(() => useEditPropertyPath('environment'), {
      wrapper: getRouteWrapper('/organizations/acme/settings/custom-properties', definitionsRoute),
    })

    expect(result.current).toEqual('/organizations/acme/settings/custom-property/environment')
  })

  it('returns path from enterprise route', () => {
    const {result} = renderHook(() => useEditPropertyPath('environment'), {
      wrapper: getRouteWrapper('/enterprises/acme-corp/settings/custom-properties', businessCustomPropertiesRoute),
    })

    expect(result.current).toEqual('/enterprises/acme-corp/settings/custom-property/environment')
  })
})
