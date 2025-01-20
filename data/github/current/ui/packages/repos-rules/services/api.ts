import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import type {
  DetailedValidationErrors,
  Ruleset,
  RulesetRoutePayload,
  RulesetTarget,
  SetRoutePayload,
  WorkflowRepository,
  PropertyDescriptor,
  SimpleRepository,
  SimpleOrganization,
} from '../types/rules-types'
import type {BypassActor} from '@github-ui/bypass-actors/types'

export class ValidationError extends Error {
  details: DetailedValidationErrors

  constructor(error: unknown) {
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    super(error.message)
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    if (error.detailed_errors) {
      // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
      this.details = error.detailed_errors
    }
  }
}

const request = (url: string, method: string, error = 'Unexpected error') => {
  return async (body?: object) => {
    const response = await verifiedFetchJSON(url, {
      body,
      method,
    })
    if (response.ok) {
      try {
        return await response.json()
      } catch (e) {
        throw new Error('Failed to read response')
      }
    } else if (response.status === 422) {
      throw new ValidationError(await response.json())
    } else {
      throw new Error(error)
    }
  }
}

export const setRuleset = (url: string, ruleset: Ruleset): Promise<SetRoutePayload> => {
  return request(url, 'POST', 'Failed to update')({ruleset})
}

export const getRuleset = (url: string): Promise<{payload: RulesetRoutePayload}> => request(url, 'GET')()

export const validatePattern = (url: string, pattern: string): Promise<{valid: boolean}> =>
  request(url, 'POST')({pattern})

export const getBypassSuggestions = (url: string, query: string): Promise<BypassActor[]> => {
  return request(`${url}?q=${encodeURIComponent(query)}`, 'GET')()
}

export const getRepoSuggestionsForOrg = (
  url: string,
  {query, excludePublicRepos}: {query: string; excludePublicRepos: boolean},
): Promise<SimpleRepository[]> => {
  return request(
    `${url}?q=${encodeURIComponent(query)}&excludePublicRepos=${excludePublicRepos ? 'true' : 'false'}`,
    'GET',
  )()
}

export const getOrgSuggestionsForEnterprise = (
  url: string,
  {query}: {query: string},
): Promise<SimpleOrganization[]> => {
  return request(`${url}?q=${encodeURIComponent(query)}`, 'GET')()
}

export const getAvailableProperties = (
  url: string,
  rulesetTarget: RulesetTarget,
): Promise<{properties: PropertyDescriptor[]}> => {
  return request(`${url}?ruleset_target=${rulesetTarget}`, 'GET')()
}

// === Workflows ===

export const getWorkflowSuggestions = (url: string, repoName: string): Promise<Array<{name: string; path: string}>> => {
  return request(`${url}?type=workflows&repoName=${encodeURIComponent(repoName)}`, 'GET')()
}

export const getWorkflowRepoSuggestions = (url: string, repoQuery = ''): Promise<WorkflowRepository[]> => {
  return request(`${url}?type=repos&q=${encodeURIComponent(repoQuery)}`, 'GET')()
}

export const getShaForRef = (url: string, repoName: string, ref: string): Promise<{sha: string | undefined}> => {
  return request(`${url}?type=sha&ref=${encodeURIComponent(ref)}&repoName=${encodeURIComponent(repoName)}`, 'GET')()
}

export const validateWorkflowSha = (
  url: string,
  shaAndRepo: {sha: string; repo_id: number},
): Promise<{valid: boolean}> => {
  return request(url, 'POST')(shaAndRepo)
}
