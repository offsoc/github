import {useQueryClient} from '@tanstack/react-query'
import {useCallback} from 'react'
import {createMutation, createQuery, type inferData} from 'react-query-kit'

import {CollaboratorRole, rolesMap} from '../api/common-contracts'
import {apiGetCollaborators} from '../api/memex/api-get-collaborators'
import {apiRemoveCollaborators} from '../api/memex/api-remove-collaborators'
import {apiUpdateCollaborators} from '../api/memex/api-update-collaborators'
import type {GetCollaboratorsResponse} from '../api/memex/contracts'
import {actorIdentifier} from './organization-access'

export const useAllCollaborators = createQuery<GetCollaboratorsResponse, void>({
  queryKey: ['all-collaborators'],
  fetcher: (_, {signal}) => apiGetCollaborators({signal}),
})

function toSetOfCollaboratorIdentifiers(result: GetCollaboratorsResponse) {
  return new Set(result.collaborators.map(collaborator => actorIdentifier(collaborator)))
}
export const useAllCollaboratorIdentifiers = () => {
  return useAllCollaborators({
    select: toSetOfCollaboratorIdentifiers,
  })
}

const toMapByCollaboratorIdentifier = (result: GetCollaboratorsResponse) => {
  return new Map(result.collaborators.map(c => [actorIdentifier(c), c]))
}
export const useAllCollaboratorsByIdentifier = () => {
  return useAllCollaborators({
    select: toMapByCollaboratorIdentifier,
  })
}

export const usePrefetchCollaborators = () => {
  const client = useQueryClient()
  return useCallback(() => client.prefetchQuery(useAllCollaborators.getFetchOptions()), [client])
}

const useRemoveCollaborators = createMutation({
  mutationFn: apiRemoveCollaborators,
})

export const useRemoveCollaboratorsOptimistically = () => {
  const client = useQueryClient()
  return useRemoveCollaborators({
    onMutate: ({collaborators}) => {
      // TODO: This needs to be refactored to use `query-client-api.ts`. Issue: https://github.com/github/memex/issues/15755
      // eslint-disable-next-line no-restricted-syntax
      client.setQueriesData<inferData<typeof useAllCollaborators>>(
        {queryKey: useAllCollaborators.getKey()},
        oldData => {
          if (!oldData) return oldData
          return {
            collaborators: oldData.collaborators.filter(
              collaborator => !collaborators.includes(actorIdentifier(collaborator)),
            ),
          }
        },
      )
    },
    onSettled: () => {
      client.invalidateQueries({
        queryKey: useAllCollaborators.getKey(),
      })
    },
  })
}

const useUpdateCollaborators = createMutation({
  mutationFn: apiUpdateCollaborators,
})

export const useUpdateCollaboratorsOptimistically = () => {
  const client = useQueryClient()
  return useUpdateCollaborators({
    onMutate: ({collaborators, role}) => {
      // TODO: This needs to be refactored to use `query-client-api.ts`. Issue: https://github.com/github/memex/issues/15755
      // eslint-disable-next-line no-restricted-syntax
      client.setQueriesData<inferData<typeof useAllCollaborators>>(
        {queryKey: useAllCollaborators.getKey()},
        oldData => {
          if (!oldData) return oldData
          const updatedCollaboratorActorIdentifiers = new Set(collaborators)

          const newData = {
            collaborators: oldData.collaborators.map(collaborator => {
              if (updatedCollaboratorActorIdentifiers.has(actorIdentifier(collaborator))) {
                return {
                  ...collaborator,
                  role: rolesMap.get(role) ?? CollaboratorRole.None,
                  isUpdated: true,
                }
              }
              return collaborator
            }),
          }

          return newData
        },
      )
    },
    onSettled: () => {
      client.invalidateQueries({
        queryKey: useAllCollaborators.getKey(),
      })
    },
  })
}
