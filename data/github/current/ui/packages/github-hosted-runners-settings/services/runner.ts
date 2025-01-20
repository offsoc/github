import {verifiedFetchJSON} from '@github-ui/verified-fetch'

import type {RunnerEditForm, RunnerCreateForm} from '../types/runner'
import {ERRORS} from '../helpers/constants'
import {createRunnerPath, updateRunnerPath} from '../helpers/paths'

const request = async (url: string, method: string, body: RunnerCreateForm | RunnerEditForm) => {
  const response = await verifiedFetchJSON(url, {
    method,
    body,
  })

  try {
    return {
      ...(await response.json()),
      status: response.status,
    }
  } catch (e) {
    throw new Error('Failed to read response')
  }
}

export const createRunner = async (payload: RunnerCreateForm, entityLogin: string, isEnterprise: boolean = false) => {
  const url = createRunnerPath({isEnterprise, entityLogin})
  const result = await request(url, 'POST', payload)
  if (result.success) {
    return result.data.runnerId
  }

  switch (result.status) {
    case 409:
      throw new Error(ERRORS.RUNNER_NAME_ALREADY_EXISTS(payload.name))
    case 422:
      if (result.error_category === 'known') {
        throw new Error(result.error)
      }
    // eslint-disable-next-line no-fallthrough
    default:
      throw new Error(ERRORS.CREATION_FAILED_REASON_UNKNOWN)
  }
}

export const updateRunner = async (
  payload: RunnerEditForm,
  runnerId: number,
  entityLogin: string,
  isEnterprise: boolean = false,
) => {
  const url = updateRunnerPath({runnerId, isEnterprise, entityLogin})
  const result = await request(url, 'PATCH', payload)

  switch (result.status) {
    case 200:
      return result.success
    case 409:
      throw new Error(ERRORS.RUNNER_NAME_ALREADY_EXISTS(payload.name))
    case 422:
      if (result.error_category === 'known') {
        throw new Error(result.error)
      }
    // eslint-disable-next-line no-fallthrough
    default:
      throw new Error(ERRORS.UPDATE_FAILED_REASON_UNKNOWN)
  }
}
