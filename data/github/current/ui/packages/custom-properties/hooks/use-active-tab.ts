import type {OrgEditPermissions} from '@github-ui/custom-properties-types'
import {useSearchParams} from '@github-ui/use-navigate'

import {useListPropertiesPath} from './use-properties-paths'

export function useActiveTab(
  permissions: OrgEditPermissions,
): [PropertiesPageTabName, (tab: PropertiesPageTabName) => string] {
  const [params] = useSearchParams()
  const listPropertiesPath = useListPropertiesPath()

  function hrefBuilder(tab: PropertiesPageTabName): string {
    const newParams = new URLSearchParams(params)
    newParams.set('tab', tab)
    return `${listPropertiesPath}?${newParams.toString()}`
  }

  return [validTabOrDefault(params.get('tab'), permissions), hrefBuilder]
}

function validTabOrDefault(tab: string | null, permissions: OrgEditPermissions): PropertiesPageTabName {
  if (permissions === 'all') {
    return ['set-values', 'properties'].includes(tab || '') ? (tab as PropertiesPageTabName) : 'properties'
  } else if (permissions === 'definitions') {
    return 'properties'
  } else {
    return 'set-values'
  }
}

type PropertiesPageTabName = 'set-values' | 'properties'
