import {useCallback} from 'react'
import {createQuery} from 'react-query-kit'

import {apiGetSuggestedCollaborators} from '../api/memex/api-get-suggested-collaborators'
import type {GetSuggestedCollaboratorsResponse, IGetSuggestedCollaboratorsRequest} from '../api/memex/contracts'
import {assertNever} from '../helpers/assert-never'
import {useAllCollaboratorIdentifiers} from './collaborators'
import {actorIdentifier} from './organization-access'

function isSuggestedCollaboratorsQueryEnabled(query: IGetSuggestedCollaboratorsRequest['query']): boolean {
  return query.trim().replace(/^@/, '').length > 0
}

const useSuggestedCollaboratorsQuery = createQuery<
  GetSuggestedCollaboratorsResponse,
  IGetSuggestedCollaboratorsRequest
>({
  queryKey: ['suggested-collaborators'],
  fetcher: (variables, {signal}) => apiGetSuggestedCollaborators(variables, {signal}),
  use: [
    useNext => {
      return options => {
        return useNext({
          ...options,
          /**
           * Only query when the query string is not empty, after removing the @ prefix if it exists
           */
          enabled: isSuggestedCollaboratorsQueryEnabled(options.variables?.query ?? ''),
        })
      }
    },
  ],
})

export const useSuggestedCollaborators = (opts: Parameters<typeof useSuggestedCollaboratorsQuery>[0]) => {
  const {data: allCollaborators} = useAllCollaboratorIdentifiers()

  const toSuggestedCollaborators = useCallback(
    (result: GetSuggestedCollaboratorsResponse) => {
      return result.suggestions.map(suggestion => {
        if ('user' in suggestion) {
          const actor_type = 'user'
          return {
            ...suggestion.user,
            isCollaborator: allCollaborators?.has(actorIdentifier({id: suggestion.user.id, actor_type})) ?? false,
            actor_type,
          } as const
        }

        if ('team' in suggestion) {
          const actor_type = 'team'
          return {
            ...suggestion.team,
            isCollaborator: allCollaborators?.has(actorIdentifier({id: suggestion.team.id, actor_type})) ?? false,
            actor_type,
          } as const
        }
        assertNever(suggestion)
      })
    },
    [allCollaborators],
  )

  return useSuggestedCollaboratorsQuery({
    ...opts,
    select: toSuggestedCollaborators,
  })
}
