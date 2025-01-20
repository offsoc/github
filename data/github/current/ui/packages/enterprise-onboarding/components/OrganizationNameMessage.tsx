import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {testIdProps} from '@github-ui/test-id-props'
import type {OrgNameStatus} from '../types'

type OrganizationNameMessageProps = OrgNameStatus | Record<string, never>

export function OrganizationNameMessage(props: OrganizationNameMessageProps) {
  const {
    exists = false,
    is_name_modified = false,
    name = '',
    not_alphanumeric = false,
    over_max_length = false,
    unavailable = false,
  } = props || {}
  if (unavailable) {
    return <UnavailableNameMessage name={name} />
  } else if (exists) {
    return <ExistsNameMessage name={name} />
  } else if (not_alphanumeric) {
    return <NotAlphanumericNameMessage name={name} />
  } else if (over_max_length) {
    return <OverMaxLengthNameMessage />
  }

  return (
    <span {...testIdProps('org-name-message')}>
      <span className="d-block">This will be the name of your organization on GitHub.</span>
      <span>
        Your URL will be: {ssrSafeLocation.origin}/<strong>{name}</strong>
        {is_name_modified && ', which has been adjusted to comply with our naming rules'}
        {name && '.'}
      </span>
    </span>
  )
}

function UnavailableNameMessage({name}: {name: string}) {
  return (
    <span {...testIdProps('org-name-message-unavailable')}>Organization name &lsquo;{name}&rsquo; is unavailable.</span>
  )
}

function ExistsNameMessage({name}: {name: string}) {
  return <span {...testIdProps('org-name-message-exists')}>The name &lsquo;{name}&rsquo; is already taken.</span>
}

function NotAlphanumericNameMessage({name}: {name: string}) {
  const loginValidationMessage =
    'may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen'
  return (
    <span {...testIdProps('org-name-message-non-alphanumeric')}>
      The name {name.length > 0 && '&lsquo;{name}&rsquo;'} {loginValidationMessage}.
    </span>
  )
}

function OverMaxLengthNameMessage() {
  const loginMaxLength = 39
  return (
    <span {...testIdProps('org-name-message-over-max')}>
      Username is too long (maximum is {loginMaxLength} characters).
    </span>
  )
}
