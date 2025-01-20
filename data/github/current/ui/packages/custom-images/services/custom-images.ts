import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {ERRORS} from '../helpers/constants'
import {imageDefinitionDeletePath, imageVersionDeletePath} from '../helpers/paths'

async function request(url: string, method: string) {
  const response = await verifiedFetchJSON(url, {method})
  const statusCode = response?.status
  let data = null
  try {
    data = await response.json()
  } catch {
    /* can't parse the JSON response; still want to return status code */
  }
  return {...data, statusCode}
}

export async function deleteImageDefinition(
  imageDefinitionId: string,
  entityLogin: string,
  isEnterprise: boolean = false,
) {
  const url = imageDefinitionDeletePath({imageDefinitionId, entityLogin, isEnterprise})
  const method = 'DELETE'

  const result = await request(url, method)
  if (result.success) {
    return {success: true}
  }

  const errorMessage = result && result.errors ? result.errors[0] : ERRORS.IMAGE_DEFINITION_DELETE_FAILED_REASON_UNKNOWN
  return {
    success: false,
    errorMessage,
  }
}

export async function deleteImageVersion(
  imageDefinitionId: string,
  version: string,
  entityLogin: string,
  isEnterprise: boolean = false,
) {
  const url = imageVersionDeletePath({imageDefinitionId, version, entityLogin, isEnterprise})
  const method = 'DELETE'

  const result = await request(url, method)
  if (result.success) {
    return {success: true}
  }

  const errorMessage = result && result.errors ? result.errors[0] : ERRORS.IMAGE_VERSION_DELETE_FAILED_REASON_UNKNOWN
  return {
    success: false,
    errorMessage,
  }
}
