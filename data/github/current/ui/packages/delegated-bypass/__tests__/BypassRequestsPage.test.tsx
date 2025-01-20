import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {RequestTypeProvider} from '../contexts/RequestTypeContext'
import {BypassRequestsPage} from '../routes/BypassRequestsPage'
import type {BypassRequestsRoutePayload, FilterableRequestStatus} from '../delegated-bypass-types'

import {exampleRequest, approvedRequest, completedRequest, baseExemptionUrl} from './helpers'

describe('BypassRequestsPage', () => {
  it('renders the BypassRequestsPage', () => {
    const payload: BypassRequestsRoutePayload = {
      exemptionRequests: [exampleRequest],
      filter: {},
      hasMoreRequests: false,
      baseExemptionUrl,
      sourceType: 'repository',
    }

    render(
      <RequestTypeProvider requestType="push_ruleset_bypass">
        <BypassRequestsPage />
      </RequestTypeProvider>,
      {routePayload: payload},
    )
    expect(screen.getByText('Bypass Requests')).toBeInTheDocument()
    expect(screen.getByText('View all requests to bypass push rules.')).toBeInTheDocument()
  })

  it('renders the organization BypassRequestsPage with the filters', () => {
    const payload: BypassRequestsRoutePayload = {
      exemptionRequests: [exampleRequest],
      filter: {},
      hasMoreRequests: false,
      baseExemptionUrl,
      sourceType: 'organization',
    }

    render(
      <RequestTypeProvider requestType="push_ruleset_bypass">
        <BypassRequestsPage />
      </RequestTypeProvider>,
      {routePayload: payload},
    )
    expect(screen.getByText('All repositories')).toBeInTheDocument()
    expect(screen.getByText('All approvers')).toBeInTheDocument()
    expect(screen.getByText('All requesters')).toBeInTheDocument()
    expect(screen.getByText('Last 24 hours')).toBeInTheDocument()
    expect(screen.getByText('All statuses')).toBeInTheDocument()
  })

  it('renders the repository BypassRequestsPage with the filters', () => {
    const payload: BypassRequestsRoutePayload = {
      exemptionRequests: [exampleRequest],
      filter: {},
      hasMoreRequests: false,
      baseExemptionUrl,
      sourceType: 'organization',
    }

    render(
      <RequestTypeProvider requestType="push_ruleset_bypass">
        <BypassRequestsPage />
      </RequestTypeProvider>,
      {routePayload: payload},
    )
    expect(screen.getByText('All approvers')).toBeInTheDocument()
    expect(screen.getByText('All requesters')).toBeInTheDocument()
    expect(screen.getByText('Last 24 hours')).toBeInTheDocument()
    expect(screen.getByText('All statuses')).toBeInTheDocument()
  })

  it('renders the BypassRequestsPage with no requests found', () => {
    const payload: BypassRequestsRoutePayload = {
      exemptionRequests: [],
      filter: {},
      hasMoreRequests: false,
      baseExemptionUrl,
      sourceType: 'repository',
    }

    render(
      <RequestTypeProvider requestType="push_ruleset_bypass">
        <BypassRequestsPage />
      </RequestTypeProvider>,
      {routePayload: payload},
    )
    expect(screen.getByText('No bypass requests found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting the filters to refine your search.')).toBeInTheDocument()
  })

  it('filters organization request page on repositories', () => {
    const payload: BypassRequestsRoutePayload = {
      exemptionRequests: [exampleRequest],
      filter: {repository: 'repo'},
      hasMoreRequests: false,
      baseExemptionUrl,
      sourceType: 'organization',
      repositories: ['repo'],
    }

    render(
      <RequestTypeProvider requestType="push_ruleset_bypass">
        <BypassRequestsPage />
      </RequestTypeProvider>,
      {routePayload: payload},
    )
    expect(screen.getByTitle('repo')).toBeInTheDocument()
  })

  it('filters request page on approvers', () => {
    const approver = approvedRequest.exemptionResponses[0]!.reviewer
    const payload: BypassRequestsRoutePayload = {
      exemptionRequests: [approvedRequest],
      filter: {approver},
      hasMoreRequests: false,
      baseExemptionUrl,
      sourceType: 'repository',
    }

    render(
      <RequestTypeProvider requestType="push_ruleset_bypass">
        <BypassRequestsPage />
      </RequestTypeProvider>,
      {routePayload: payload},
    )
    expect(screen.getByText('collaborator')).toBeInTheDocument()
  })

  it('filters request page on requesters', () => {
    const requester = exampleRequest.requester
    const payload: BypassRequestsRoutePayload = {
      exemptionRequests: [exampleRequest],
      filter: {requester},
      hasMoreRequests: false,
      baseExemptionUrl,
      sourceType: 'repository',
    }

    render(
      <RequestTypeProvider requestType="push_ruleset_bypass">
        <BypassRequestsPage />
      </RequestTypeProvider>,
      {routePayload: payload},
    )
    expect(screen.getByText('monalisa')).toBeInTheDocument()
  })

  it('filters request page on time', () => {
    const payload: BypassRequestsRoutePayload = {
      exemptionRequests: [exampleRequest],
      filter: {timePeriod: 'week'},
      hasMoreRequests: false,
      baseExemptionUrl,
      sourceType: 'repository',
    }

    render(
      <RequestTypeProvider requestType="push_ruleset_bypass">
        <BypassRequestsPage />
      </RequestTypeProvider>,
      {routePayload: payload},
    )
    expect(screen.getByText('Last week')).toBeInTheDocument()
  })

  it('filters request page on statuses', () => {
    const requestStatus = completedRequest.status as FilterableRequestStatus
    const payload: BypassRequestsRoutePayload = {
      exemptionRequests: [completedRequest],
      filter: {requestStatus},
      hasMoreRequests: false,
      baseExemptionUrl,
      sourceType: 'repository',
    }

    render(
      <RequestTypeProvider requestType="push_ruleset_bypass">
        <BypassRequestsPage />
      </RequestTypeProvider>,
      {routePayload: payload},
    )
    expect(screen.getAllByText('Completed')[0]).toBeInTheDocument()
  })

  it('renders pagination', () => {
    const payload: BypassRequestsRoutePayload = {
      exemptionRequests: [exampleRequest],
      filter: {},
      hasMoreRequests: true,
      baseExemptionUrl,
      sourceType: 'repository',
    }

    render(
      <RequestTypeProvider requestType="push_ruleset_bypass">
        <BypassRequestsPage />
      </RequestTypeProvider>,
      {routePayload: payload},
    )
    expect(screen.getByText('Previous')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })
})
