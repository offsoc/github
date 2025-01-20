import {renderHook} from '@testing-library/react'

import {businessCustomPropertiesRoute, definitionsRoute} from '../../custom-properties'
import {getRouteWrapper} from '../../test-utils/RouteWrapper'
import {useCheckUsagePath} from '../use-check-usage-path'

describe('useCheckUsagePath', () => {
  it('returns path from organization route', () => {
    const {result} = renderHook(() => useCheckUsagePath('environment'), {
      wrapper: getRouteWrapper('/organizations/acme/settings/custom-properties', definitionsRoute),
    })

    expect(result.current).toEqual('/organizations/acme/settings/custom-properties-usage/environment')
  })

  it('returns path from enterprise route', () => {
    const {result} = renderHook(() => useCheckUsagePath('environment'), {
      wrapper: getRouteWrapper('/enterprises/acme-corp/settings/custom-properties', businessCustomPropertiesRoute),
    })

    expect(result.current).toEqual('/enterprises/acme-corp/settings/custom-properties-usage/environment')
  })
})
