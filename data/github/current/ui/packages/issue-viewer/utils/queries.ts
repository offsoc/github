// Attempt to use the `org` parameter to filter the results if we have a `/` present in the query
// This is to be used with the `search` graphQL endpoint for type `Repository` only.
export function getRepositorySearchQuery(queryString: string): string {
  const orgIndexSplit = queryString.indexOf('/')

  // If there is no / in the query, or the org name is empty, just search for the repo name
  if (orgIndexSplit === -1 || orgIndexSplit === 0) {
    return `${queryString} in:name archived:false`
  }

  // Naively extract the org name and repo name from the query by assuming anything before the / is the org name
  const orgSearchName = queryString.slice(0, orgIndexSplit)
  const repoSearchName = queryString.slice(orgIndexSplit + 1)

  if (repoSearchName.length === 0) {
    return `org:${orgSearchName} in:name archived:false`
  }

  return `org:${orgSearchName} ${repoSearchName} in:name archived:false`
}
