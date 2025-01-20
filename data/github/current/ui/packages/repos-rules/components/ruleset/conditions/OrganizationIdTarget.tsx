import type {FC} from 'react'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {OrgSelector} from '@github-ui/org-selector'
import type {
  OrganizationIdParameters,
  OrganizationIdConditionMetadata,
  SimpleOrganization,
  RulesetRoutePayload,
} from '../../../types/rules-types'
import {useRelativeNavigation} from '../../../hooks/use-relative-navigation'
import {TargetsTable, type IncludeExcludeType} from '../TargetsTable'
import {getOrgSuggestionsForEnterprise} from '../../../services/api'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'

interface OrganizationIdTargetProps {
  readOnly: boolean
  parameters: OrganizationIdParameters
  metadata?: OrganizationIdConditionMetadata
  updateParameters: (parameters: OrganizationIdParameters) => void
  headerRowText?: string
  excludePublicRepos?: boolean
  blankslate: {
    heading: string
    description?: React.ReactNode
  }
}

export const OrganizationIdTarget: FC<OrganizationIdTargetProps> = ({
  readOnly,
  parameters,
  metadata,
  updateParameters,
  headerRowText,
  blankslate,
}) => {
  const {baseAvatarUrl} = useRoutePayload<RulesetRoutePayload>()
  const [fetchedMetadata, setFetchedMetadata] = useState<SimpleOrganization[]>([])

  const selectedOrgs = useMemo(() => {
    const orgsById = (metadata?.organizations || []).concat(fetchedMetadata).reduce(
      (acc, org) => {
        acc[org.nodeId] = org
        return acc
      },
      {} as Record<string, SimpleOrganization>,
    )

    return parameters.organization_ids.reduce((acc, id) => {
      if (orgsById[id]) {
        acc.push(orgsById[id])
      }
      return acc
    }, [] as SimpleOrganization[])
  }, [metadata, parameters, fetchedMetadata])

  const {resolvePath} = useRelativeNavigation()

  const queryForOrgs = async (query: string) => {
    return await getOrgSuggestionsForEnterprise(resolvePath('org_suggestions'), {query})
  }

  const changeOrgs = useCallback(
    async (newOrgs: SimpleOrganization[]) => {
      if (readOnly) {
        return
      }

      updateParameters({
        organization_ids: newOrgs.map(o => o.nodeId),
      })
      setFetchedMetadata(newOrgs)
    },
    [readOnly, updateParameters],
  )

  // If the server does not return the full set of repos that are currently configured, this most likely
  // means that an org has been deleted or moved outside of the Enterprise. In this case, remove it from the
  // condition so we do not fail ruleset save
  useEffect(() => {
    if (selectedOrgs.length !== parameters.organization_ids.length) {
      changeOrgs(selectedOrgs)
    }
  }, [selectedOrgs, parameters, changeOrgs])

  const selectOrg = (id: number, nodeId: string, name: string) => {
    if (!readOnly) {
      updateParameters({organization_ids: [...parameters.organization_ids, nodeId]})
      setFetchedMetadata([...fetchedMetadata, {id, nodeId, name}])
    }
  }

  const removeOrg = (orgNodeId: string) => {
    if (!readOnly) {
      updateParameters({organization_ids: parameters.organization_ids.filter(o => o !== orgNodeId)})
      setFetchedMetadata(fetchedMetadata.filter(f => f.nodeId !== orgNodeId))
    }
  }

  const targets = useMemo(
    () =>
      selectedOrgs.map(org => ({
        type: 'include' as IncludeExcludeType,
        prefix: 'org',
        value: org.nodeId,
        display: org.name,
      })),
    [selectedOrgs],
  )

  return (
    <TargetsTable
      renderTitle={() => <h3 className="Box-title">Organizations</h3>}
      renderAction={() => (
        <OrgSelector
          baseAvatarUrl={baseAvatarUrl}
          selectedOrgs={selectedOrgs}
          selectOrg={selectOrg}
          removeOrg={removeOrg}
          orgLoader={queryForOrgs}
        />
      )}
      headerRowText={headerRowText}
      blankslate={blankslate}
      targets={targets}
      onRemove={(_, v) => removeOrg(v)}
      readOnly={readOnly}
    />
  )
}
