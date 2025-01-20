import {renderHook} from '@testing-library/react'

import {businessCustomPropertiesRoute, definitionsRoute} from '../../custom-properties'
import {getRouteWrapper} from '../../test-utils/RouteWrapper'
import {useDeletePropertyPath, useListPropertiesPath, useSavePropertyPath} from '../use-properties-paths'

describe('useDeletePropertyPath', () => {
  it('returns path from organization route', () => {
    const {result} = renderHook(() => useDeletePropertyPath('environment'), {
      wrapper: getRouteWrapper('/organizations/acme/settings/custom-properties', definitionsRoute),
    })

    expect(result.current).toEqual('/organizations/acme/settings/custom-property/environment')
  })

  it('returns path from enterprise route', () => {
    const {result} = renderHook(() => useDeletePropertyPath('environment'), {
      wrapper: getRouteWrapper('/enterprises/acme-corp/settings/custom-properties', businessCustomPropertiesRoute),
    })

    expect(result.current).toEqual('/enterprises/acme-corp/settings/custom-property/environment')
  })
})

describe('useSavePropertyPath', () => {
  it('returns path from organization route', () => {
    const {result} = renderHook(() => useSavePropertyPath(), {
      wrapper: getRouteWrapper('/organizations/acme/settings/custom-properties', definitionsRoute),
    })

    expect(result.current).toEqual('/organizations/acme/settings/custom-properties')
  })

  it('returns path from enterprise route', () => {
    const {result} = renderHook(() => useSavePropertyPath(), {
      wrapper: getRouteWrapper('/enterprises/acme-corp/settings/custom-properties', businessCustomPropertiesRoute),
    })

    expect(result.current).toEqual('/enterprises/acme-corp/settings/custom-properties')
  })
})

describe('useListPropertiesPath', () => {
  it('returns path from organization route', () => {
    const {result} = renderHook(() => useListPropertiesPath(), {
      wrapper: getRouteWrapper('/organizations/acme/settings/custom-properties', definitionsRoute),
    })

    expect(result.current).toEqual('/organizations/acme/settings/custom-properties')
  })

  it('returns path from enterprise route', () => {
    const {result} = renderHook(() => useListPropertiesPath(), {
      wrapper: getRouteWrapper('/enterprises/acme-corp/settings/custom-properties', businessCustomPropertiesRoute),
    })

    expect(result.current).toEqual('/enterprises/acme-corp/settings/custom-properties')
  })
})
