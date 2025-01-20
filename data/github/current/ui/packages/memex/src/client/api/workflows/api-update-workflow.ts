import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {UpdateWorkflowRequest, UpdateWorkflowResponse} from './contracts'

export async function apiUpdateWorkflow(body: UpdateWorkflowRequest): Promise<UpdateWorkflowResponse> {
  const apiData = getApiMetadata('memex-workflow-update-api-data')

  const {data} = await fetchJSONWith<UpdateWorkflowResponse>(apiData.url, {
    method: 'PUT',
    body,
  })

  return data
}
