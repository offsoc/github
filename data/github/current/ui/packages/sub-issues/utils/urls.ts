import type {QUERY_FIELDS} from '../constants/queries'

// Returns the repository "scoped" issues search url for the provided metadata
// For example, this is used to generate the search url used when clicking on an issue type token
export const getIssueSearchURL = (
  {owner, repo}: {owner: string; repo: string},
  field: keyof typeof QUERY_FIELDS,
  value: string,
) => {
  if (!owner || !repo) {
    return ''
  }

  const baseUrl = `/${owner}/${repo}/issues`

  if (!field || !value) {
    return baseUrl
  }

  const query = encodeURIComponent(`${field}:${value}`)
  return `${baseUrl}?q=${query}`
}
