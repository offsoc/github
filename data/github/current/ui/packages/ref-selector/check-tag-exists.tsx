// eslint-disable-next-line filenames/match-regex
import {verifiedFetch} from '@github-ui/verified-fetch'

export async function checkTagExists(path: string, newRefName: string): Promise<boolean> {
  const body = new FormData()
  body.set('value', newRefName)
  const res = await verifiedFetch(path, {
    method: 'POST',
    body,
    // Overwrite the default Accept header to make sure rails treat this request as a react_request
    // We don't use the verifiedFetchJSON as it sets the 'Content-Type' to 'application/json'
    headers: {Accept: 'application/json'},
  })

  if (!res.ok) {
    return false
  }

  return !!(await res.text())
}
