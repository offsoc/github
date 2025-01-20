import type {PathFunction} from '@github-ui/paths'

export const appendQuery: PathFunction<{
  baseUrl: string
  query: string
}> = ({baseUrl, query}) => {
  const url = new URL(baseUrl, window.location.origin)
  const params = new URLSearchParams(url.search)

  const currentQuery = params.get('query')
  const newQuery = currentQuery ? `${currentQuery} ${query}` : query
  params.set('query', newQuery)
  url.search = params.toString()

  return `${url.pathname}${url.search}`
}

export const appendParam: PathFunction<{
  baseUrl: string
  param: string
  value: string
}> = ({baseUrl, param, value}) => {
  const url = new URL(baseUrl, window.location.origin)
  url.searchParams.append(param, value)
  return `${url.pathname}${url.search}`
}
