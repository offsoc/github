// eslint-disable-next-line filenames/match-regex
import {verifiedFetch} from '@github-ui/verified-fetch'

export async function createBranch(
  path: string,
  newRefName: string,
  baseRef: string,
): Promise<{success: true; name: string} | {success: false; error: string}> {
  const body = new FormData()
  body.set('name', newRefName)
  body.set('branch', baseRef)
  const res = await verifiedFetch(path, {
    method: 'POST',
    body,
    // Overwrite the default Accept header to make sure rails treat this request as a react_request
    // We don't use the verifiedFetchJSON as it sets the 'Content-Type' to 'application/json'
    headers: {Accept: 'application/json'},
  })

  if (res.ok) {
    return {success: true, name: (await res.json()).name}
  } else {
    try {
      const {error} = (await res.json()) as {error: string}
      if (error) {
        return {success: false, error}
      }
      throw new Error('Unknown response from create branch API')
    } catch {
      return {success: false, error: 'Something went wrong.'}
    }
  }
}
