import {screen, fireEvent, act} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {FeatureRequest} from '../FeatureRequest'
import {mockFetch} from '@github-ui/mock-fetch'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'

test('Does not render the FeatureRequest when showFeatureRequest is false', () => {
  const featureRequestInfo = {
    showFeatureRequest: false,
    alreadyRequested: false,
    dismissed: false,
    featureName: 'test',
    requestPath: 'path',
  }
  render(<FeatureRequest featureRequestInfo={featureRequestInfo} />)

  expect(screen.queryByTestId('feature-request-request-button')).toBeNull()
})

test('Renders the FeatureRequest with requestCTA', () => {
  const featureRequestInfo = {
    isEnterpriseRequest: false,
    showFeatureRequest: true,
    alreadyRequested: false,
    dismissed: false,
    featureName: 'test',
    requestPath: 'path',
  }
  render(<FeatureRequest featureRequestInfo={featureRequestInfo} />)
  expect(screen.getByTestId('feature-request-request-button')).toBeInTheDocument()
})

test('Renders the FeatureRequest with removeRequestCTA', () => {
  const featureRequestInfo = {
    isEnterpriseRequest: false,
    showFeatureRequest: true,
    alreadyRequested: true,
    dismissed: false,
    featureName: 'test',
    requestPath: 'path',
  }
  render(<FeatureRequest featureRequestInfo={featureRequestInfo} />)
  expect(screen.getByTestId('feature-request-cancel-link')).toBeInTheDocument()
})

test('Renders the FeatureRequest with requestMessage', () => {
  const featureRequestInfo = {
    isEnterpriseRequest: false,
    showFeatureRequest: true,
    alreadyRequested: false,
    dismissed: false,
    featureName: 'test',
    requestPath: 'path',
  }
  const requestMessage = 'request message test'
  render(<FeatureRequest featureRequestInfo={featureRequestInfo} requestMessage={requestMessage} />)
  expect(screen.getByText('request message test')).toBeInTheDocument()
})

test('Renders the FeatureRequest with requestedMessage', () => {
  const featureRequestInfo = {
    isEnterpriseRequest: false,
    showFeatureRequest: true,
    alreadyRequested: true,
    dismissed: false,
    featureName: 'test',
    requestPath: 'path',
  }
  const requestedMessage = 'requested message test'
  render(<FeatureRequest featureRequestInfo={featureRequestInfo} requestedMessage={requestedMessage} />)
  expect(screen.getByText(requestedMessage)).toBeInTheDocument()
})

test('Renders the FeatureRequest with learnMorePath', () => {
  const featureRequestInfo = {
    isEnterpriseRequest: false,
    showFeatureRequest: true,
    alreadyRequested: false,
    dismissed: false,
    featureName: 'test',
    requestPath: 'path',
  }
  render(<FeatureRequest featureRequestInfo={featureRequestInfo} learnMorePath="path" />)
  expect(screen.getByTestId('feature-request-learn-more-link')).toBeInTheDocument()
})

test('Renders cancelRequestCTA when request is successful', async () => {
  const featureRequestInfo = {
    isEnterpriseRequest: false,
    showFeatureRequest: true,
    alreadyRequested: false,
    dismissed: false,
    featureName: 'test',
    requestPath: '/orgs/test-org/member_feature_request',
  }
  render(<FeatureRequest featureRequestInfo={featureRequestInfo} />)

  const askAdminButton = screen.getByTestId('feature-request-request-button')
  expect(askAdminButton).toBeEnabled()
  fireEvent.click(askAdminButton)
  await act(() => {
    mockFetch.resolvePendingRequest(
      '/orgs/test-org/member_feature_request',
      {feature: 'protected_branches'},
      {ok: true},
    )
  })
  expect(screen.getByTestId('feature-request-cancel-link')).toBeInTheDocument()
  expectAnalyticsEvents({
    type: 'analytics.click',
    data: {
      category: 'member_feature_request',
      action: `action.${featureRequestInfo.featureName}`,
      label: `ref_cta:ask_admin_for_access;ref_loc:${featureRequestInfo.featureName};`,
    },
  })
})

test('Renders ask admin for access when request is not successful', async () => {
  const featureRequestInfo = {
    isEnterpriseRequest: false,
    showFeatureRequest: true,
    alreadyRequested: false,
    dismissed: false,
    featureName: 'test',
    requestPath: '/orgs/test-org/member_feature_request',
  }
  render(<FeatureRequest featureRequestInfo={featureRequestInfo} />)

  const askAdminButton = screen.getByTestId('feature-request-request-button')
  expect(askAdminButton).toBeEnabled()
  fireEvent.click(askAdminButton)
  await act(() => {
    mockFetch.resolvePendingRequest(
      '/orgs/test-org/member_feature_request',
      {feature: 'protected_branches'},
      {ok: false},
    )
  })
  expect(screen.getByText('Ask admin for access')).toBeInTheDocument()
  expectAnalyticsEvents({
    type: 'analytics.click',
    data: {
      category: 'member_feature_request',
      action: `action.${featureRequestInfo.featureName}`,
      label: `ref_cta:ask_admin_for_access;ref_loc:${featureRequestInfo.featureName};`,
    },
  })
})

test('Renders ask admin for access when cancel request is successful', async () => {
  const featureRequestInfo = {
    isEnterpriseRequest: false,
    showFeatureRequest: true,
    alreadyRequested: true,
    dismissed: false,
    featureName: 'test',
    requestPath: '/orgs/test-org/member_feature_request',
  }
  render(<FeatureRequest featureRequestInfo={featureRequestInfo} />)

  const removeRequestLink = screen.getByTestId('feature-request-cancel-link')
  expect(removeRequestLink).toBeEnabled()
  fireEvent.click(removeRequestLink)
  await act(() => {
    mockFetch.resolvePendingRequest(
      '/orgs/test-org/member_feature_request',
      {feature: 'protected_branches'},
      {ok: true},
    )
  })
  expect(screen.getByTestId('feature-request-request-button')).toBeInTheDocument()
})

test('Renders Remove request when cancel request is not successful', async () => {
  const featureRequestInfo = {
    isEnterpriseRequest: false,
    showFeatureRequest: true,
    alreadyRequested: true,
    dismissed: false,
    featureName: 'test',
    requestPath: '/orgs/test-org/member_feature_request',
  }
  render(<FeatureRequest featureRequestInfo={featureRequestInfo} />)

  const removeRequestLink = screen.getByTestId('feature-request-cancel-link')
  expect(removeRequestLink).toBeEnabled()
  fireEvent.click(removeRequestLink)
  await act(() => {
    mockFetch.resolvePendingRequest(
      '/orgs/test-org/member_feature_request',
      {feature: 'protected_branches'},
      {ok: false},
    )
  })
  expect(screen.getByText('Remove request')).toBeInTheDocument()
})

test('Analytics event fires when Learn more link is clicked', () => {
  const featureRequestInfo = {
    isEnterpriseRequest: false,
    showFeatureRequest: true,
    alreadyRequested: false,
    dismissed: false,
    featureName: 'test',
    requestPath: '/orgs/test-org/member_feature_request',
  }
  render(<FeatureRequest featureRequestInfo={featureRequestInfo} learnMorePath="path" />)

  const learnMoreLink = screen.getByRole('link', {name: 'Learn more'})
  fireEvent.click(learnMoreLink)
  expectAnalyticsEvents({
    type: 'analytics.click',
    data: {
      category: 'suggestion',
      action: `click_to_read_docs`,
      label: `ref_cta:learn_more;ref_loc:${featureRequestInfo.featureName};`,
    },
  })
})

test('Renders FeatureRequest with proper CTA and click analytics for the enterprise', () => {
  const featureRequestInfo = {
    isEnterpriseRequest: true,
    showFeatureRequest: true,
    alreadyRequested: false,
    dismissed: false,
    featureName: 'testFeature',
    requestPath: '/orgs/enterprise-org/member_feature_request',
    billingEntityId: '1234',
  }
  render(<FeatureRequest featureRequestInfo={featureRequestInfo} learnMorePath="path" />)

  const ctaLink = screen.getByTestId('feature-request-request-button')
  expect(ctaLink.textContent).toBe('Ask enterprise owners for access')

  fireEvent.click(ctaLink)

  expectAnalyticsEvents({
    type: 'analytics.click',
    data: {
      category: 'member_feature_request',
      action: `action.testFeature`,
      label: `ref_cta:ask_enterprise_owners_for_access;ref_loc:${featureRequestInfo.featureName};enterprise_id:1234;`,
    },
  })
})

test('Renders FeatureRequest with proper CTA and analytics for the organization', () => {
  const featureRequestInfo = {
    isEnterpriseRequest: false,
    showFeatureRequest: true,
    alreadyRequested: false,
    dismissed: false,
    featureName: 'testFeature',
    requestPath: '/orgs/test-org/member_feature_request',
    billingEntityId: '1234',
  }
  render(<FeatureRequest featureRequestInfo={featureRequestInfo} learnMorePath="path" />)

  const ctaLink = screen.getByTestId('feature-request-request-button')
  expect(ctaLink.textContent).toBe('Ask admin for access')

  fireEvent.click(ctaLink)

  expectAnalyticsEvents({
    type: 'analytics.click',
    data: {
      category: 'member_feature_request',
      action: `action.testFeature`,
      label: `ref_cta:ask_admin_for_access;ref_loc:${featureRequestInfo.featureName};`,
    },
  })
})
