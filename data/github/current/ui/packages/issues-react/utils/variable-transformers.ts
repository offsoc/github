import {findSortReactionInQuery, getQuery, replaceDateTokens} from '@github-ui/list-view-items-issues-prs/Query'
import type {VariableTransformer} from '@github-ui/relay-route/types'

import {REPOSITORY_VIEW, CUSTOM_VIEW} from '../constants/view-constants'
import {addPagingParams, parseValidProjectNumbersFromUrlParameter} from './urls'
import {QUERIES} from '@github-ui/query-builder/constants/queries'

export const variablesIndex: VariableTransformer<string> = (variables, routeParams) => {
  const newVariables = variables
  if (Object.keys(routeParams.pathParams).length > 0) {
    const urlQuery = routeParams.searchParams.get('q')

    const defaultQuery = `${urlQuery || REPOSITORY_VIEW.query}`
    const customQuery = CUSTOM_VIEW.query({
      author: routeParams.pathParams['author'],
      assignee: routeParams.pathParams['assignee'],
      mentioned: routeParams.pathParams['mentioned'],
    })

    newVariables['query'] = getQuery(customQuery ? `${defaultQuery} ${customQuery}` : defaultQuery, {
      owner: routeParams.pathParams['owner']!,
      name: routeParams.pathParams['repo']!,
    })

    addPagingParams(routeParams.searchParams, newVariables)

    newVariables['owner'] = routeParams.pathParams['owner']!
    newVariables['name'] = routeParams.pathParams['repo']!
    newVariables['includeReactions'] = urlQuery ? findSortReactionInQuery(urlQuery) : false
  }
  return newVariables
}

function createVariableTransformers<const T extends Record<string, VariableTransformer<string>>>(transformers: T) {
  return transformers
}
export const VARIABLE_TRANSFORMERS = createVariableTransformers({
  '/issues/new': (variables, routeParams) => {
    const newVariables = variables

    const owner = routeParams.searchParams.get('org')
    const name = routeParams.searchParams.get('repo')

    if (owner && name) {
      newVariables['owner'] = owner
      newVariables['name'] = name
    }

    newVariables['query'] = 'state:open archived:false assignee:@me sort:updated-desc'
    newVariables['includeTemplates'] = true
    newVariables['hasIssuesEnabled'] = true

    return newVariables
  },
  '/:owner/:name/issues/new': (variables, routeParams) => {
    const newVariables = variables

    const assignees = routeParams.searchParams.get('assignees')
    if (assignees) {
      newVariables['assigneeLogins'] = assignees
      newVariables['withAssignees'] = true
    }

    const labels = routeParams.searchParams.get('labels')
    if (labels) {
      newVariables['labelNames'] = labels
      newVariables['withLabels'] = true
    }

    const milestone = routeParams.searchParams.get('milestone')
    if (milestone) {
      newVariables['milestoneTitle'] = milestone
      newVariables['withMilestone'] = true
    }

    const projects = routeParams.searchParams.get('projects')
    if (routeParams && projects) {
      const projectNumbers = parseValidProjectNumbersFromUrlParameter(projects, routeParams.pathParams['owner'])

      if (projectNumbers.length > 0) {
        newVariables['projectNumbers'] = projectNumbers
        newVariables['withProjects'] = true
      }
    }

    const type = routeParams.searchParams.get('type')
    if (type) {
      newVariables['type'] = type
      newVariables['withType'] = true
    }

    newVariables['includeTemplates'] = true
    newVariables['withAnyMetadata'] =
      newVariables['withAssignees'] ||
      newVariables['withLabels'] ||
      newVariables['withMilestone'] ||
      newVariables['withProjects'] ||
      newVariables['withType'] ||
      false
    newVariables['withTriagePermission'] = newVariables['withType'] || newVariables['withProjects'] || false

    return newVariables
  },
  '/:owner/:name/issues/new/choose': (variables, routeParams) => {
    const newVariables = variables
    newVariables['includeTemplates'] = true

    const milestone = routeParams.searchParams.get('milestone')
    if (milestone) {
      newVariables['milestoneTitle'] = milestone
      newVariables['withMilestone'] = true
    }

    newVariables['withAnyMetadata'] = newVariables['withMilestone'] || false

    return newVariables
  },
  '/:owner/:repo/issues': variablesIndex,
  '/:owner/:repo/issues/created_by/:author': variablesIndex,
  '/:owner/:repo/issues/assigned/:assignee': variablesIndex,
  '/:owner/:repo/issues/mentioned/:mentioned': variablesIndex,
  '/issues/:id': (variables, routeParams, environment) => {
    const newVariables = variables
    let viewId
    if (routeParams) {
      viewId = routeParams.pathParams['id']
    }
    if (viewId && environment) {
      const viewNode = environment.getStore().getSource().get(viewId)
      if (viewNode && viewNode.query) {
        newVariables['query'] = replaceDateTokens(`${viewNode.query}`)
        newVariables['includeReactions'] = findSortReactionInQuery(`${viewNode.query}`)
      }
    }
    return newVariables
  },
  '/:owner/:repo/issues/:number': variables => {
    const newVariables = variables

    newVariables['id'] = REPOSITORY_VIEW.id

    return newVariables
  },
  '/issues': (variables, routeParams) => {
    const newVariables = variables
    const urlQuery = routeParams.searchParams.get('q')
    if (urlQuery) {
      newVariables['query'] = replaceDateTokens(urlQuery)
      newVariables['includeReactions'] = findSortReactionInQuery(urlQuery)
    }
    addPagingParams(routeParams.searchParams, newVariables)

    return newVariables
  },
  '/issues/assigned': (variables, routeParams) => {
    const newVariables = variables
    newVariables['query'] = QUERIES.assignedToMe
    addPagingParams(routeParams.searchParams, newVariables)

    return newVariables
  },
  '/issues/mentioned': (variables, routeParams) => {
    const newVariables = variables
    newVariables['query'] = QUERIES.mentioned
    addPagingParams(routeParams.searchParams, newVariables)

    return newVariables
  },
  '/issues/recentActivity': (variables, routeParams) => {
    const newVariables = variables
    newVariables['query'] = replaceDateTokens(QUERIES.recentActivity)
    addPagingParams(routeParams.searchParams, newVariables)

    return newVariables
  },
  '/issues/createdByMe': (variables, routeParams) => {
    const newVariables = variables
    newVariables['query'] = QUERIES.createdByMe
    addPagingParams(routeParams.searchParams, newVariables)

    return newVariables
  },
})
