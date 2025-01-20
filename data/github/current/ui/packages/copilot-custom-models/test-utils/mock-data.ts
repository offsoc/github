import type {RoutePayload as ShowRoutePayload} from '../routes/Show/types'
import type {RoutePayload as NewRoutePayload} from '../routes/New/types'
import type {RoutePayload as IndexRoutePayload} from '../routes/Index/types'
import type {PipelineDetails, PipelineItem} from '../types'
import type {RoutePayload as EditRoutePayload} from '../routes/Edit/types'

export function getPipelineDetails(): PipelineDetails {
  return {
    id: 'def',
    cancelPath: '/organizations/abc/settings/copilot/custom_model/def/cancel',
    createdAt: null,
    destroyPath: '/organizations/abc/settings/copilot/custom_model/def',
    editPath: 'edit/path',
    isDeployed: false,
    languages: [],
    repoSearchPath: '/organizations/abc/settings/copilot/custom_model/repositories/xyz',
    repositoryCount: 0,
    showPath: '/organizations/abc/settings/copilot/custom_model/def',
    stages: [],
    status: 'PIPELINE_STATUS_UNSPECIFIED',
    wasPrivateTelemetryCollected: false,
  }
}

export function getNewRoutePayload(): NewRoutePayload {
  return {
    adminEmail: 'admin@example.com',
    availableLanguages: [],
    canCollectPrivateTelemetry: true,
    createPath: 'test/route.com',
    enoughDataToTrain: true,
    organization: 'Test org',
  }
}

export function getShowRoutePayload(): ShowRoutePayload {
  return {
    adminEmail: 'a@a.co',
    editPath: '/organizations/abc/settings/copilot/custom_model/def/edit',
    hasAnyDeployed: false,
    indexPath: '/organizations/abc/settings/copilot/custom_models',
    isStale: false,
    organization: {
      slug: 'abc',
    },
    pipelineDetails: {
      id: 'def',
      cancelPath: '/organizations/abc/settings/copilot/custom_model/def/cancel',
      createdAt: null,
      destroyPath: '/organizations/abc/settings/copilot/custom_model/def',
      editPath: 'edit/path',
      isDeployed: false,
      languages: [],
      repoSearchPath: '/organizations/abc/settings/copilot/custom_model/repositories/xyz',
      repositoryCount: 3,
      showPath: '/organizations/abc/settings/copilot/custom_model/def',
      stages: [],
      status: 'PIPELINE_STATUS_UNSPECIFIED',
      wasPrivateTelemetryCollected: false,
    },

    updatePath: '/organizations/abc/settings/copilot/custom_model/def',
    withinRateLimit: true,
  }
}

export function getIndexRoutePayload(): IndexRoutePayload {
  return {
    adminEmail: 'a@a.co',
    hasAnyDeployed: false,
    newPath: '/organizations/abc/settings/copilot/custom_model/new',
    organization: 'abc',
    pipelines: [],
    withinRateLimit: true,
  }
}

export function getPipelineItem(): PipelineItem {
  return {
    id: 'def',
    cancelPath: '/organizations/abc/settings/copilot/custom_model/def/cancel',
    createdAt: null,
    destroyPath: '/organizations/abc/settings/copilot/custom_model/def',
    editPath: 'edit/path',
    isDeployed: false,
    repositoryCount: 0,
    showPath: '/organizations/abc/settings/copilot/custom_model/def',
    status: 'PIPELINE_STATUS_UNSPECIFIED',
  }
}

export function getEditRoutePayload(): EditRoutePayload {
  return {
    availableLanguages: [],
    canCollectPrivateTelemetry: true,
    createPath: '/create/path',
    languages: [],
    organization: 'abc',
    pipelineId: 'def',
    repoCount: 1,
    repoListPath: '/repo/list/path',
    showPath: '/show/path',
    wasPrivateTelemetryCollected: true,
  }
}
