import persistedQueries from '../../../../../../config/persisted_graphql_queries/github_ui.json'

type PersistedQueriesModule = {
  [key: string]: string
}

const pattern = /(query|mutation) (.*?)(\(| \{).*/
const regex = new RegExp(pattern)

const persistedQueriesMap = new Map<string, string>()
const pq = persistedQueries as unknown as PersistedQueriesModule

Object.keys(pq).reduce((acc, queryId) => {
  const val = pq[queryId]
  if (val) {
    const matches = regex.exec(val)
    const queryName = matches ? matches[2] : null
    if (queryName) {
      persistedQueriesMap.set(queryId, queryName)
    }
  }
  return acc
}, persistedQueriesMap)

export function getPersistedQueryName(queryId: string | undefined) {
  if (!queryId) {
    return undefined
  }
  return persistedQueriesMap.get(queryId)
}
