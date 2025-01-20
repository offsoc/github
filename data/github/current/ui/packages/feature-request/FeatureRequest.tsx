import {Link, Button, Octicon} from '@primer/react'
import {CheckIcon} from '@primer/octicons-react'
import {testIdProps} from '@github-ui/test-id-props'
import {useClickAnalytics} from '@github-ui/use-analytics'

import type {FeatureRequestInfo} from './types'
import {useFeatureRequest} from './hooks/use-feature-request'

export {useFeatureRequest} from './hooks/use-feature-request'

interface FeatureRequestOptionalProps {
  learnMorePath?: string
  requestMessage?: string
  requestedMessage?: string
}

export interface FeatureRequestProps extends FeatureRequestOptionalProps {
  featureRequestInfo: FeatureRequestInfo
}

export function FeatureRequest({
  featureRequestInfo,
  learnMorePath,
  requestMessage,
  requestedMessage,
}: FeatureRequestProps) {
  const {inProgress, requested, toggleFeatureRequest} = useFeatureRequest(featureRequestInfo)

  if (!featureRequestInfo.showFeatureRequest) {
    return null
  }

  return requested ? (
    <CancelFeatureRequest
      inProgress={inProgress}
      toggleFeatureRequest={toggleFeatureRequest}
      requestedMessage={requestedMessage}
    />
  ) : (
    <RequestFeature
      inProgress={inProgress}
      toggleFeatureRequest={toggleFeatureRequest}
      isEnterpriseRequest={featureRequestInfo.isEnterpriseRequest}
      featureName={featureRequestInfo.featureName}
      billingEntityId={featureRequestInfo.billingEntityId}
      learnMorePath={learnMorePath}
      requestMessage={requestMessage}
    />
  )
}

interface RequestCTAProps extends FeatureRequestOptionalProps {
  inProgress: boolean
  toggleFeatureRequest: () => void
  isEnterpriseRequest?: boolean
  billingEntityId?: string
  featureName?: string
}

export const RequestFeature = ({
  inProgress,
  toggleFeatureRequest: submit,
  billingEntityId = '',
  isEnterpriseRequest = false,
  featureName,
  learnMorePath,
  requestMessage,
}: RequestCTAProps) => {
  const {sendClickAnalyticsEvent} = useClickAnalytics()

  const submitAndSendAnalytics = () => {
    submit()

    const cta_analytics_label =
      isEnterpriseRequest && billingEntityId
        ? `ref_cta:ask_enterprise_owners_for_access;ref_loc:${featureName};enterprise_id:${billingEntityId};`
        : `ref_cta:ask_admin_for_access;ref_loc:${featureName};`

    sendClickAnalyticsEvent({
      category: 'member_feature_request',
      action: `action.${featureName}`,
      label: cta_analytics_label,
    })
  }

  const learnMoreAndSendAnalytics = () => {
    sendClickAnalyticsEvent({
      category: 'suggestion',
      action: `click_to_read_docs`,
      label: `ref_cta:learn_more;ref_loc:${featureName};`,
    })
  }

  return (
    <>
      <RequestCTA onClick={submitAndSendAnalytics} inProgress={inProgress} isEnterpriseRequest={isEnterpriseRequest} />
      {requestMessage && <RequestMessage message={requestMessage} />}
      {learnMorePath && <LearnMore onClick={learnMoreAndSendAnalytics} path={learnMorePath} />}
    </>
  )
}

export const CancelFeatureRequest = ({inProgress, toggleFeatureRequest: cancel, requestedMessage}: RequestCTAProps) => {
  return (
    <>
      {requestedMessage && <RequestedMessage message={requestedMessage} />}
      <RemoveRequestCTA onClick={cancel} inProgress={inProgress} />
    </>
  )
}

const RequestCTA = ({
  onClick,
  inProgress,
  isEnterpriseRequest,
}: {
  onClick: () => void
  inProgress: boolean
  isEnterpriseRequest: boolean
}) => {
  const buttonText = isEnterpriseRequest ? 'Ask enterprise owners for access' : 'Ask admin for access'

  return (
    <Button
      onClick={onClick}
      variant="primary"
      disabled={inProgress}
      {...testIdProps('feature-request-request-button')}
    >
      {inProgress ? 'Requesting...' : buttonText}
    </Button>
  )
}

const LearnMore = ({onClick, path}: {onClick: () => void; path: string}) => {
  return (
    <Link href={path} onClick={onClick} {...testIdProps('feature-request-learn-more-link')}>
      Learn more
    </Link>
  )
}

const RequestMessage = ({message}: {message: string}) => <span>{message}</span>

const RequestedMessage = ({message}: {message: string}) => {
  return (
    <span className="d-inline-block color-fg-subtle mr-1">
      <Octicon icon={CheckIcon} />
      {message}
    </span>
  )
}

const RemoveRequestCTA = ({onClick, inProgress}: {onClick: () => void; inProgress: boolean}) => {
  return (
    <Link
      className="color-fg-danger text-semibold"
      as="button"
      onClick={onClick}
      disabled={inProgress}
      {...testIdProps('feature-request-cancel-link')}
    >
      {inProgress ? 'Cancelling...' : 'Remove request'}
    </Link>
  )
}
