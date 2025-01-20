import {useEffect, useState} from 'react'
import type {QueryFn, RepoQueryDatum} from './types'

interface Props {
  query: string
  queryFn: QueryFn
}

interface UseRepos {
  isQuerying: boolean
  repos: RepoQueryDatum[]
}

export function useQueryForRepos({query, queryFn}: Props): UseRepos {
  const [isQuerying, setIsQuerying] = useState(false)
  const [repos, setRepos] = useState<RepoQueryDatum[]>([])

  useEffect(() => {
    const call = async () => {
      setIsQuerying(true)

      const fetchedRepos = await queryFn(query)
      setRepos(fetchedRepos)

      setIsQuerying(false)
    }

    call()
  }, [query, queryFn])

  return {isQuerying, repos}
}
