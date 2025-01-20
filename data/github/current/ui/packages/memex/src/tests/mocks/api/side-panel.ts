import type {
  AddCommentRequest,
  EditCommentRequest,
  IssueComment,
  SidePanelMetadata,
  UpdateIssueStateRequest,
  UpdateSidePanelDataResponse,
  UpdateSidePanelItemData,
  UpdateSidePanelItemReactionRequest,
} from '../../../client/api/side-panel/contracts'
import type {GetRequestType} from '../../../mocks/msw-responders'
import {
  get_getSidePanelItem,
  post_addSidePanelComment,
  post_updateSidePanelItem,
  post_updateSidePanelItemReaction,
  post_updateSidePanelItemState,
  put_editSidePanelComment,
} from '../../../mocks/msw-responders/side-panel'
import {formDecodeToObject} from '../../../mocks/server/form-decode-to-object'
import {mswServer} from '../../msw-server'
import {stubApiMethod} from './stub-api-method'

export function stubGetSidePanelMetadata(response: Partial<SidePanelMetadata>) {
  return stubApiMethod<GetRequestType, SidePanelMetadata>(get_getSidePanelItem, response as SidePanelMetadata)
}

export function stubUpdateSidePanelItem(response: UpdateSidePanelDataResponse) {
  return stubApiMethod<UpdateSidePanelItemData, UpdateSidePanelDataResponse>(post_updateSidePanelItem, response)
}

export function stubUpdateSidePanelItemReaction() {
  const stub = jest.fn<void, [UpdateSidePanelItemReactionRequest]>()
  const handler = post_updateSidePanelItemReaction(async (_body, req) => {
    const textBody = formDecodeToObject<UpdateSidePanelItemReactionRequest>(await req.text())
    const parsedBody: UpdateSidePanelItemReactionRequest = {
      ...textBody,
      itemId: parseInt(textBody.itemId),
      repositoryId: parseInt(textBody.repositoryId),
      commentId: textBody.commentId ? parseInt(textBody.commentId) : undefined,
    }
    stub(parsedBody)
    return Promise.resolve()
  })
  mswServer.use(handler)
  return stub
}

export function stubUpdateSidePanelItemState() {
  const stub = jest.fn<void, [UpdateIssueStateRequest]>()
  const handler = post_updateSidePanelItemState(async (_body, req) => {
    const textBody = formDecodeToObject<UpdateIssueStateRequest>(await req.text())
    const parsedBody: UpdateIssueStateRequest = {
      ...textBody,
      itemId: parseInt(textBody.itemId),
      repositoryId: parseInt(textBody.repositoryId),
    }
    stub(parsedBody)
    return Promise.resolve()
  })
  mswServer.use(handler)
  return stub
}

export function stubAddComment(comment: IssueComment) {
  const stub = jest.fn<IssueComment, [AddCommentRequest]>()
  const handler = post_addSidePanelComment(async (_body, req) => {
    const textBody = formDecodeToObject<AddCommentRequest>(await req.text())
    const parsedBody: AddCommentRequest = {
      ...textBody,
      itemId: parseInt(textBody.itemId),
      repositoryId: parseInt(textBody.repositoryId),
    }
    stub(parsedBody)
    return Promise.resolve(comment)
  })
  mswServer.use(handler)
  return stub
}

export function stubEditComment(comment: IssueComment) {
  const stub = jest.fn<IssueComment, [EditCommentRequest]>()
  const handler = put_editSidePanelComment(async (_body, req) => {
    const textBody = formDecodeToObject<EditCommentRequest>(await req.text())
    const parsedBody: EditCommentRequest = {
      ...textBody,
      itemId: parseInt(textBody.itemId),
      repositoryId: parseInt(textBody.repositoryId),
      commentId: parseInt(textBody.commentId),
    }
    stub(parsedBody)
    return Promise.resolve(comment)
  })
  mswServer.use(handler)
  return stub
}
