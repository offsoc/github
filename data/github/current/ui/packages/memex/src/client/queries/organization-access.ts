import {useMutation, useQueryClient} from '@tanstack/react-query'
import {useCallback, useMemo} from 'react'
import {createQuery, type inferData} from 'react-query-kit'

import {type Collaborator, CollaboratorRole, collaboratorRolesMap, Role, rolesMap} from '../api/common-contracts'
import {apiGetOrganizationAccess} from '../api/memex/api-get-organization-access'
import {apiUpdateOrganizationAccess} from '../api/memex/api-update-organization-access'
import type {GetOrganizationAccessResponse, SuggestedCollaborator} from '../api/memex/contracts'
import {getInitialState} from '../helpers/initial-state'

export function getCollaboratorDisplayValue(collaborator: Collaborator | SuggestedCollaborator) {
  const {projectOwner} = getInitialState()
  return collaborator.actor_type === 'user'
    ? collaborator.login
    : `${projectOwner ? `${projectOwner.login}/` : ''}${collaborator.slug}`
}

export const actorIdentifier = (actor: {actor_type: string; id: number}) => {
  return `${actor.actor_type}/${actor.id}`
}

const useOrganizationAccessQuery = createQuery<GetOrganizationAccessResponse, void>({
  queryKey: ['organization-access'],
  fetcher: (_, {signal}) => apiGetOrganizationAccess({signal}),
  initialData: {role: CollaboratorRole.None},
})

export const useOrganizationAccessRole = () => {
  return useOrganizationAccessQuery({
    select: useMemo(() => data => collaboratorRolesMap.get(data.role) ?? Role.None, []),
  })
}

export const usePrefetchOrganizationAccessRole = () => {
  const client = useQueryClient()
  return useCallback(() => {
    return client.prefetchQuery(useOrganizationAccessQuery.getFetchOptions())
  }, [client])
}

export const useUpdateOrganizationAccessRoleOptimistically = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: apiUpdateOrganizationAccess,
    onMutate: ({role}) => {
      // TODO: This needs to be refactored to use `query-client-api.ts`. Issue: https://github.com/github/memex/issues/15755
      // eslint-disable-next-line no-restricted-syntax
      client.setQueriesData<inferData<typeof useOrganizationAccessQuery>>(
        {queryKey: useOrganizationAccessQuery.getKey()},
        {role: rolesMap.get(role) ?? CollaboratorRole.None},
      )
    },
    onSettled: () => {
      client.invalidateQueries({
        queryKey: useOrganizationAccessQuery.getKey(),
      })
    },
  })
}
