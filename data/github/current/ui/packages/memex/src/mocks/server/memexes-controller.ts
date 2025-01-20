import type {SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import {
  type Collaborator,
  type CollaboratorRole,
  collaboratorRolesMap,
  rolesMap,
} from '../../client/api/common-contracts'
import type {
  ApplyTemplateRequest,
  ApplyTemplateResponse,
  DeleteMemexResponse,
  FilterSuggestionsRequest,
  FilterSuggestionsResponse,
  GetAllMemexDataRequest,
  GetAllMemexDataResponse,
  GetCollaboratorsResponse,
  GetCustomTemplatesResponse,
  GetOrganizationAccessResponse,
  GetSuggestedCollaboratorsResponse,
  IGetSuggestedCollaboratorsRequest,
  IRemoveCollaboratorsRequest,
  IToggleMemexCloseRequest,
  IUpdateCollaboratorsRequest,
  IUpdateMemexRequest,
  Memex,
  RemoveCollaboratorsResponse,
  UpdateCollaboratorsResponse,
  UpdateMemexResponse,
} from '../../client/api/memex/contracts'
import {not_typesafe_nonNullAssertion} from '../../client/helpers/non-null-assertion'
import {createColumnModel} from '../../client/models/column-model'
import {createMemexItemModel} from '../../client/models/memex-item-model'
import {MemexRefreshEvents} from '../data/memex-refresh-events'
import {defaultTeamMemberCount, mockTeams} from '../data/teams'
import {mockUsers} from '../data/users'
import {DefaultWorkflowConfigurations} from '../data/workflows'
import {createRequestHandlerWithError} from '../msw-responders'
import {
  delete_destroyMemex,
  delete_removeMemexCollaborators,
  get_customTemplates,
  get_getFilterSuggestions,
  get_getMemexCollaborators,
  get_getOrganizationAccess,
  get_getSuggestedMemexCollaborators,
  get_refreshMemex,
  post_applyTemplate,
  post_updateMemexCollaborators,
  put_updateMemex,
  put_updateOrganizationAccess,
} from '../msw-responders/memexes'
import {BaseController} from './base-controller'
import {stringToSyntheticId} from './mock-server-parsing'
import {getUniqueFieldValues} from './unique-field-values'

function isMemexCloseRequest(request: IUpdateMemexRequest): request is IToggleMemexCloseRequest {
  return (request as IToggleMemexCloseRequest).closed !== undefined
}

export class MemexesController extends BaseController {
  public get(): Memex {
    return this.db.memexes.get()
  }

  public async getAllMemexData(request: GetAllMemexDataRequest): Promise<GetAllMemexDataResponse> {
    const views = this.db.views.all()

    const memexProject = this.db.memexes.get()
    this.log(`Getting memex with title: "${memexProject.title}"`)
    return {
      memexProject,
      memexProjectItems: this.server.memexItems.get({
        visibleFields: request.visibleFields,
      }),
      memexProjectAllColumns: this.server.columns.get(),
      memexViews: views,
      memexWorkflows: this.server.workflows.get(),
      memexWorkflowConfigurations: DefaultWorkflowConfigurations,
      memexCharts: this.server.charts.get(),
    }
  }

  public update(request: IUpdateMemexRequest): UpdateMemexResponse {
    const memex = this.db.memexes.get()
    if (isMemexCloseRequest(request)) {
      this.db.memexes.set({...memex, closedAt: request.closed ? new Date().toISOString() : null})
      this.log(`{request.closed ? "Closing" : "Reopening" } memex ${memex.title}`)
    } else {
      this.db.memexes.set({...memex, ...request})

      if (request.title) {
        this.log(`Updating title of memex to ${request.title}`)
      }

      if (request.description) {
        this.log(`Updating description of memex to ${request.description}`)
      }

      if (request.shortDescription) {
        this.log(`Updating shortDescription of memex to ${request.shortDescription}`)
      }
    }

    this.server.liveUpdate.queueSocketMessage({
      type: MemexRefreshEvents.MemexProjectEvent,
    })

    return {memexProject: this.db.memexes.get()}
  }

  public delete(): DeleteMemexResponse {
    this.log('Deleting Memex')
    return {redirectUrl: '/'}
  }

  public async getSuggestedCollaborators({
    query,
  }: IGetSuggestedCollaboratorsRequest): Promise<GetSuggestedCollaboratorsResponse> {
    this.log(`Getting suggested collaborators`)
    await this.server.sleep()

    const userSuggestions = this.db.assignees
      .all()
      .filter(assignee => assignee?.login.toLowerCase().includes(query.toLowerCase()))

    const teamSuggestions = mockTeams.filter(team => team.slug.toLowerCase().includes(query.toLowerCase()))

    const allSuggestions = []
    for (const suggestions of userSuggestions) {
      allSuggestions.push({
        user: suggestions,
        isCollaborator: this.db.collaborators.has(suggestions, 'user'),
      })
    }
    for (const suggestions of teamSuggestions) {
      allSuggestions.push({
        team: suggestions,
        isCollaborator: this.db.collaborators.has(suggestions, 'team'),
      })
    }

    return {
      suggestions: allSuggestions,
    }
  }

  public async updateCollaboratorsFailed({
    collaborators,
  }: IUpdateCollaboratorsRequest): Promise<UpdateCollaboratorsResponse> {
    return {failed: collaborators, collaborators: []}
  }

  public async updateCollaborators({
    role,
    collaborators,
  }: IUpdateCollaboratorsRequest): Promise<UpdateCollaboratorsResponse> {
    this.log(`Update collaborators ${collaborators} with role ${role}`)
    await this.server.sleep()
    const success = new Array<Collaborator>()
    const failed = new Array<string>()

    for (const collaborator of collaborators) {
      const id = parseInt(collaborator.substring(collaborator.lastIndexOf('/') + 1), 10) // The string is like this 'user/123' or 'team/123'
      const isUser = collaborator.startsWith('user/')
      const isTeam = collaborator.startsWith('team/')

      if (isUser) {
        const user = mockUsers.find(u => u?.id === id)
        if (user) {
          this.db.collaborators.addUser(user, role)
          success.push({...user, actor_type: 'user', role: not_typesafe_nonNullAssertion(rolesMap.get(role))})
          continue
        }
      }

      if (isTeam) {
        const team = mockTeams.find(t => t?.id === id)
        if (team) {
          this.db.collaborators.addTeam(team, role, defaultTeamMemberCount)
          success.push({
            ...team,
            actor_type: 'team',
            role: not_typesafe_nonNullAssertion(rolesMap.get(role)),
            membersCount: defaultTeamMemberCount,
          })
          continue
        }
      }

      failed.push(collaborator)
    }

    return {failed, collaborators: success}
  }

  public async removeCollaborators({collaborators}: IRemoveCollaboratorsRequest): Promise<RemoveCollaboratorsResponse> {
    this.log(`Removing collaborators ${collaborators}`)
    await this.server.sleep()
    const failed = new Array<string>()

    for (const collaborator of collaborators) {
      const id = parseInt(collaborator.substring(collaborator.lastIndexOf('/') + 1), 10) // The string is like this 'user/123' or 'team/123'
      const isUser = collaborator.startsWith('user/')
      const isTeam = collaborator.startsWith('team/')

      if (isUser) {
        const user = this.db.assignees.all().find(assignee => assignee?.id === id)
        if (user) {
          this.db.collaborators.remove(user, 'user')
          continue
        }
      }

      if (isTeam) {
        const team = mockTeams.find(t => t?.id === id)
        if (team) {
          this.db.collaborators.remove(team, 'team')
          continue
        }
      }

      failed.push(collaborator)
    }

    return {failed}
  }

  public async removeCollaboratorsFailed({
    collaborators,
  }: IRemoveCollaboratorsRequest): Promise<RemoveCollaboratorsResponse> {
    return {failed: collaborators}
  }

  public async getCollaborators(): Promise<GetCollaboratorsResponse> {
    this.log(`Getting list of collaborators`)
    await this.server.sleep()

    const collaboratorsMap = this.db.collaborators.all()

    return {collaborators: [...collaboratorsMap.values()]}
  }

  public async getOrganizationAccess(): Promise<GetOrganizationAccessResponse> {
    this.log(`Getting organization access`)
    await this.server.sleep()
    return {role: this.db.organizationAccess.get()}
  }

  public async updateOrganizationAccess({role}: {role: CollaboratorRole}): Promise<void> {
    this.log(`Updating organization access`)
    await this.server.sleep()
    this.server.db.organizationAccess.update(role)
  }

  public async applyTemplate({template}: ApplyTemplateRequest): Promise<ApplyTemplateResponse> {
    this.log(`Applying ${template} template`)
    await this.server.sleep()

    // Templates are not implemented in mock server.
    // This is the ID for "Template with faked async drafts"
    // used for integration tests
    const isFakeAsyncDraftCopy = template === '10'
    console.warn('template', template)

    // TODO: Re-add template application logic here for org templates?

    return {success: true, copyingDraftsAsync: isFakeAsyncDraftCopy}
  }

  public async getCustomTemplates(): Promise<GetCustomTemplatesResponse> {
    this.log(`Getting list of custom templates`)
    await this.server.sleep()

    return {templates: this.db.templates.all()}
  }

  public async getFilterSuggestions({fieldId}: FilterSuggestionsRequest): Promise<FilterSuggestionsResponse> {
    const column = this.server.db.columns.byId(fieldId)
    const columnModel = createColumnModel(column)
    const itemModels = this.server.db.memexItems.getActive().map(item => createMemexItemModel(item))
    return getUniqueFieldValues(itemModels, columnModel, this.server.db)
  }

  public override handlers = [
    get_refreshMemex(async (_body, req) => {
      const params = new URL(req.url).searchParams
      const visibleFields = JSON.parse(not_typesafe_nonNullAssertion(params.get('visibleFields'))) as Array<
        SystemColumnId | number
      >
      return this.getAllMemexData({visibleFields})
    }),
    put_updateMemex(async body => {
      return this.update(body)
    }),
    delete_destroyMemex(async () => {
      this.delete()
      return {redirectUrl: ''}
    }),
    get_getSuggestedMemexCollaborators(async (_body, req) => {
      const params = new URL(req.url).searchParams
      const query = not_typesafe_nonNullAssertion(params.get('q'))
      return this.getSuggestedCollaborators({query})
    }),
    get_getMemexCollaborators(async () => {
      return this.getCollaborators()
    }),
    post_updateMemexCollaborators(async body => {
      return this.updateCollaborators({
        role: not_typesafe_nonNullAssertion(collaboratorRolesMap.get(body.permission)),
        collaborators: body.collaborators,
      })
    }),
    delete_removeMemexCollaborators(async body => {
      return this.removeCollaborators({collaborators: body.collaborators})
    }),
    get_getOrganizationAccess(async () => {
      return this.server.memexes.getOrganizationAccess()
    }),
    put_updateOrganizationAccess(async body => {
      return this.server.memexes.updateOrganizationAccess({role: body.permission})
    }),
    post_applyTemplate(async body => {
      return this.server.memexes.applyTemplate(body)
    }),
    get_customTemplates(async () => {
      return this.getCustomTemplates()
    }),
    get_getFilterSuggestions(async (_body, req) => {
      const params = new URL(req.url).searchParams
      const fieldIdAsString = not_typesafe_nonNullAssertion(params.get('fieldId'))
      const fieldId = stringToSyntheticId(fieldIdAsString)
      return this.getFilterSuggestions({fieldId})
    }),
  ]

  public override errorHandlers = [
    createRequestHandlerWithError('get', 'memex-collaborators-api-data', 'Failed to get collaborators'),
    createRequestHandlerWithError('get', 'memex-get-organization-access-api-data', 'Failed to get organization access'),
    createRequestHandlerWithError(
      'put',
      'memex-update-organization-access-api-data',
      'Failed to update organization access',
    ),
    createRequestHandlerWithError('post', 'memex-template-api-data', 'Failed to apply template'),

    post_updateMemexCollaborators(async (_body, req) => {
      const params = new URL(req.url).searchParams
      const role = not_typesafe_nonNullAssertion(params.get('role')) as CollaboratorRole
      const collaborators = JSON.parse(not_typesafe_nonNullAssertion(params.get('collaborators'))) as Array<string>
      return this.updateCollaboratorsFailed({
        role: not_typesafe_nonNullAssertion(collaboratorRolesMap.get(role)),
        collaborators,
      })
    }),

    delete_removeMemexCollaborators(async (_body, req) => {
      const collaborators = JSON.parse(
        not_typesafe_nonNullAssertion(new URL(req.url).searchParams.get('collaborators')),
      ) as Array<string>
      return this.removeCollaboratorsFailed({
        collaborators,
      })
    }),
  ]
}
