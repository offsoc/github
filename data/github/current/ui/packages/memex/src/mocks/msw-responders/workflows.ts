import type {
  CreateWorkflowRequest,
  CreateWorkflowResponse,
  UpdateWorkflowRequest,
  UpdateWorkflowResponse,
} from '../../client/api/workflows/contracts'
import {createRequestHandler, type MswResponseResolver} from '.'

export const post_createWorkflow = (
  responseResolver: MswResponseResolver<CreateWorkflowRequest, CreateWorkflowResponse>,
) => {
  return createRequestHandler('post', 'memex-workflow-create-api-data', responseResolver)
}

export const put_updateWorkflow = (
  responseResolver: MswResponseResolver<UpdateWorkflowRequest, UpdateWorkflowResponse>,
) => {
  return createRequestHandler('put', 'memex-workflow-update-api-data', responseResolver)
}
