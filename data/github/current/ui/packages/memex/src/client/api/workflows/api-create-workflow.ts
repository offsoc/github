import {getApiMetadata} from '../../helpers/api-metadata'
import {fetchJSONWith} from '../../platform/functional-fetch-wrapper'
import type {CreateWorkflowRequest, CreateWorkflowResponse} from './contracts'

export async function apiCreateWorkflow(body: CreateWorkflowRequest): Promise<CreateWorkflowResponse> {
  const apiData = getApiMetadata('memex-workflow-create-api-data')
  const {data} = await fetchJSONWith<CreateWorkflowResponse>(apiData.url, {
    method: 'POST',
    body,
  })

  return data
}
