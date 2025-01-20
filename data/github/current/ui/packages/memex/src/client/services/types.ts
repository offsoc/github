export interface AliveConfig {
  presenceChannel: string
  messageChannel: string
}

export type AliveChannelType = 'presence' | 'message'

export interface ApiEndpointData {
  url: string
}

export type ApiMetadataJSONIsland = {
  'memex-refresh-api-data': ApiEndpointData
  'memex-preview-markdown-api-data': ApiEndpointData
  'memex-update-api-data': ApiEndpointData
  'memex-delete-api-data': ApiEndpointData
  'search-repositories-api-data': ApiEndpointData
  'suggested-repositories-api-data': ApiEndpointData
  'count-issues-and-pulls-api-data': ApiEndpointData
  'search-issues-and-pulls-api-data': ApiEndpointData
  'memex-item-get-api-data': ApiEndpointData
  'memex-sidepanel-item-suggestions-api-data': ApiEndpointData
  'memex-get-sidepanel-item-api-data': ApiEndpointData
  'memex-template-api-data': ApiEndpointData
  'memex-tracked-by-api-data': ApiEndpointData
  'memex-custom-templates-api-data': ApiEndpointData
  'memex-item-create-api-data': ApiEndpointData
  'memex-item-archive-api-data': ApiEndpointData
  'memex-item-create-bulk-api-data': ApiEndpointData
  'memex-item-update-bulk-api-data': ApiEndpointData
  'memex-item-convert-issue-api-data': ApiEndpointData
  'memex-item-delete-api-data': ApiEndpointData
  'memex-item-update-api-data': ApiEndpointData
  'memex-reindex-items-api-data': ApiEndpointData
  'memex-item-unarchive-api-data': ApiEndpointData
  'memex-archived-items-get-api-data': ApiEndpointData
  'memex-get-archive-status-api-data': ApiEndpointData
  'stats-post-api-data': ApiEndpointData
  'memex-paginated-items-get-api-data': ApiEndpointData
  'memex-update-organization-access-api-data': ApiEndpointData
  'memex-add-collaborators-api-data': ApiEndpointData
  'memex-remove-collaborators-api-data': ApiEndpointData
  'memex-suggested-collaborators-api-data': ApiEndpointData
  'memex-get-organization-access-api-data': ApiEndpointData
  'memex-collaborators-api-data': ApiEndpointData
  'memex-statuses-api-data': ApiEndpointData
  'memex-status-create-api-data': ApiEndpointData
  'memex-status-destroy-api-data': ApiEndpointData
  'memex-status-update-api-data': ApiEndpointData
  'memex-notification-subscription-create-api-data': ApiEndpointData
  'memex-notification-subscription-destroy-api-data': ApiEndpointData
  'memex-column-create-api-data': ApiEndpointData
  'memex-column-update-api-data': ApiEndpointData
  'memex-column-delete-api-data': ApiEndpointData
  'memex-column-option-create-api-data': ApiEndpointData
  'memex-column-option-update-api-data': ApiEndpointData
  'memex-column-option-delete-api-data': ApiEndpointData
  'memex-workflow-create-api-data': ApiEndpointData
  'memex-workflow-update-api-data': ApiEndpointData
  'memex-view-create-api-data': ApiEndpointData
  'memex-view-update-api-data': ApiEndpointData
  'memex-view-delete-api-data': ApiEndpointData
  'memex-without-limits-beta-signup-api-data': ApiEndpointData
  'memex-without-limits-beta-optout-api-data': ApiEndpointData
  'memex-chart-create-api-data': ApiEndpointData
  'memex-chart-update-api-data': ApiEndpointData
  'memex-chart-delete-api-data': ApiEndpointData
  'memex-update-sidepanel-item-api-data': ApiEndpointData
  'memex-comment-on-sidepanel-item-api-data': ApiEndpointData
  'memex-edit-sidepanel-comment-api-data': ApiEndpointData
  'memex-update-sidepanel-item-reaction-api-data': ApiEndpointData
  'memex-update-sidepanel-item-state-api-data': ApiEndpointData
  'memex-migration-get-api-data': ApiEndpointData
  'memex-migration-retry-api-data': ApiEndpointData
  'memex-migration-cancel-api-data': ApiEndpointData
  'memex-migration-acknowledge-completion-api-data': ApiEndpointData
  'memex-item-suggested-assignees-api-data': ApiEndpointData
  'memex-item-suggested-labels-api-data': ApiEndpointData
  'memex-item-suggested-milestones-api-data': ApiEndpointData
  'memex-item-suggested-issue-types-api-data': ApiEndpointData
  'memex-columns-get-api-data': ApiEndpointData
  'memex-dismiss-notice-api-data': ApiEndpointData
  'memex-filter-suggestions-api-data': ApiEndpointData
}
