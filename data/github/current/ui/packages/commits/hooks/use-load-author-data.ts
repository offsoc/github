import memoize from '@github/memoize'
import {useCurrentRepository} from '@github-ui/current-repository'
import type {User, UsersState} from '@github-ui/user-selector'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useEffect, useState} from 'react'

interface ActorsResponse {
  actors: User[]
}

async function fetchJSON(url: string): Promise<ActorsResponse | undefined> {
  const response = await verifiedFetchJSON(url)
  if (response.ok) {
    return await response.json()
  } else {
    return undefined
  }
}

const memoizeCache = new Map()
const memoizeFetchJSON = memoize(fetchJSON, {cache: memoizeCache})

export function useLoadAuthorData(url: string): UsersState {
  const repo = useCurrentRepository()
  const baseUrl = ''
  const timePeriod = 'all'
  const [usersState, setUsersState] = useState<UsersState>({
    users: [],
    error: false,
    loading: true,
  })

  useEffect(() => {
    let cancelled = false
    const update = async () => {
      setUsersState({
        users: [],
        error: false,
        loading: true,
      })
      const actorsResponse = await memoizeFetchJSON(url)

      if (cancelled) {
        return
      }

      let users: User[] = []
      let error = false

      try {
        if (actorsResponse) {
          users = actorsResponse.authors
        } else {
          error = true
        }
      } catch (e) {
        error = true
      }

      setUsersState({
        users,
        error,
        loading: false,
      })
    }

    update()

    return function cancel() {
      cancelled = true
    }
  }, [repo, baseUrl, url, timePeriod])

  return usersState
}
