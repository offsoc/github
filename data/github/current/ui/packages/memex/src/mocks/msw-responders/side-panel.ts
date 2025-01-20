import type {
  EditCommentRequest,
  IssueComment,
  SidePanelMetadata,
  UpdateIssueStateRequest,
  UpdateSidePanelDataResponse,
  UpdateSidePanelItemData,
  UpdateSidePanelItemReactionRequest,
} from '../../client/api/side-panel/contracts'
import {createRequestHandler, type GetRequestType, type MswResponseResolver} from '.'

export const get_getSidePanelItem = (responseResolver: MswResponseResolver<GetRequestType, SidePanelMetadata>) => {
  return createRequestHandler('get', 'memex-get-sidepanel-item-api-data', responseResolver)
}

export const post_updateSidePanelItem = (
  responseResolver: MswResponseResolver<UpdateSidePanelItemData, UpdateSidePanelDataResponse>,
) => {
  return createRequestHandler('post', 'memex-update-sidepanel-item-api-data', responseResolver, {ignoreJsonBody: true})
}

export const post_addSidePanelComment = (responseResolver: MswResponseResolver<EditCommentRequest, IssueComment>) => {
  return createRequestHandler('post', 'memex-comment-on-sidepanel-item-api-data', responseResolver, {
    ignoreJsonBody: true,
  })
}

export const put_editSidePanelComment = (responseResolver: MswResponseResolver<EditCommentRequest, IssueComment>) => {
  return createRequestHandler('put', 'memex-edit-sidepanel-comment-api-data', responseResolver, {ignoreJsonBody: true})
}

export const post_updateSidePanelItemReaction = (
  responseResolver: MswResponseResolver<UpdateSidePanelItemReactionRequest, void>,
) => {
  return createRequestHandler('post', 'memex-update-sidepanel-item-reaction-api-data', responseResolver, {
    ignoreJsonBody: true,
  })
}

export const post_updateSidePanelItemState = (responseResolver: MswResponseResolver<UpdateIssueStateRequest, void>) => {
  return createRequestHandler('post', 'memex-update-sidepanel-item-state-api-data', responseResolver, {
    ignoreJsonBody: true,
  })
}
