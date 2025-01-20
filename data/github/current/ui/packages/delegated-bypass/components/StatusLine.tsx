import {lazy, type ReactNode, Suspense, useState, useEffect} from 'react'
import {Box, Button, RelativeTime, Octicon, Link} from '@primer/react'
import {useSearchParams} from '@github-ui/use-navigate'
import type {RequestStatus, ExemptionResponse, Ruleset} from '../delegated-bypass-types'
import {User} from './User'
import {updateExemptionRequest} from '../services/api'
import {
  CheckIcon,
  CheckCircleFillIcon,
  CircleSlashIcon,
  DotFillIcon,
  CommentIcon,
  XIcon,
  XCircleFillIcon,
  type Icon,
} from '@primer/octicons-react'
import {useRelativeNavigation} from '../hooks/use-relative-navigation'
import {useDelegatedBypassSetBanner} from '../contexts/DelegatedBypassBannerContext'
import {UpdateState} from '../helpers/constants'
import {updateBanner} from '../helpers/banner'

const ApproversListDialog = lazy(() => import('./ApproversListDialog'))

type StatusLineProps = {
  iconInfo: {
    icon: Icon
    color: string
  }
  action?: {
    onClick: () => unknown
    text: string
    disabled?: boolean
  }
  children: ReactNode
}

function StatusLine({iconInfo: {icon, color}, action, children}: StatusLineProps) {
  return (
    <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
      <Box sx={{display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, py: 1, color: 'fg.muted'}}>
        <Octicon icon={icon} sx={{color, mr: 1}} />
        {children}
      </Box>
      {action ? (
        <Button
          sx={{alignItems: 'end'}}
          size="small"
          variant="invisible"
          onClick={() => action.onClick()}
          disabled={action.disabled || false}
        >
          {action.text}
        </Button>
      ) : null}
    </Box>
  )
}

const RESPONSE_STATUS_MAP = {
  approved: {
    message: 'Approved',
    icon: CheckIcon,
    color: 'success.fg',
  },
  pending: {
    message: 'Approval required',
    icon: DotFillIcon,
    color: 'fg.subtle',
  },
  rejected: {
    message: 'Denied',
    icon: XIcon,
    color: 'danger.fg',
  },
  dismissed: {
    message: 'Dismissed',
    icon: DotFillIcon,
    color: 'fg.subtle',
  },
}

type RulesetResponseMessageProps = {
  response: ExemptionResponse
  rulesets: Ruleset[]
  reviewerLogin?: string
  requestStatus: RequestStatus
}

export function requestNotAtTerminalStatus(requestStatus: RequestStatus) {
  return requestStatus === 'pending' || requestStatus === 'approved' || requestStatus === 'rejected'
}

function RulesetLink({ruleset, addComma = false}: {ruleset: Ruleset; addComma?: boolean}) {
  const {resolvePath} = useRelativeNavigation()

  return (
    <Link sx={{color: 'fg.default'}} href={resolvePath(`../../rules/${ruleset.id}`)} inline={true}>
      {ruleset.name}
      {addComma && ','}
    </Link>
  )
}

export function RulesetResponseStatusLine({
  response,
  rulesets,
  reviewerLogin,
  requestStatus,
}: RulesetResponseMessageProps) {
  const [, setSearchParams] = useSearchParams()
  const setBanner = useDelegatedBypassSetBanner()
  const [updateState, setUpdateState] = useState<UpdateState>(UpdateState.Initial)
  const {message, icon, color} = RESPONSE_STATUS_MAP[response?.status || 'pending']

  useEffect(() => {
    updateBanner(updateState, setBanner, setSearchParams, 'dismissed', 'dismissing')
  }, [updateState, setBanner, setSearchParams])

  async function dismiss() {
    if (response) {
      setUpdateState(UpdateState.Submitting)
      const dismissalResponse = await updateExemptionRequest('', {status: 'dismiss', responseId: response.id})
      if (dismissalResponse.statusCode === 201) {
        setUpdateState(UpdateState.Success)
      } else {
        setUpdateState(UpdateState.Error)
      }
    } else {
      setUpdateState(UpdateState.Error)
    }
  }

  let action
  if (response?.reviewer.login === reviewerLogin && requestNotAtTerminalStatus(requestStatus)) {
    if (response?.status === 'approved') {
      action = {
        onClick: dismiss,
        text: 'Dismiss approval',
        disabled: updateState === UpdateState.Submitting,
      }
    } else if (response?.status === 'rejected') {
      action = {
        onClick: dismiss,
        text: 'Dismiss denial',
        disabled: updateState === UpdateState.Submitting,
      }
    }
  }

  return (
    <>
      <StatusLine iconInfo={{icon, color}} action={action}>
        <span>{message}</span>
        {response?.reviewer ? (
          <>
            by <User user={response.reviewer} />
          </>
        ) : null}
        {rulesets.length > 0 ? (
          <>
            for{' '}
            {rulesets.map((ruleset, index) => (
              <RulesetLink key={ruleset.id} ruleset={ruleset} addComma={index < rulesets.length - 1} />
            ))}
          </>
        ) : null}
        <RelativeTime datetime={response.updatedAt} />
      </StatusLine>
    </>
  )
}

type PendingRulesetResponseMessageProps = {
  ruleset: Ruleset
  hideAction?: boolean
}

export function PendingRulesetResponseStatusLine({ruleset, hideAction}: PendingRulesetResponseMessageProps) {
  const [isApproversListOpen, setIsApproversListOpen] = useState(false)
  const {message, icon, color} = RESPONSE_STATUS_MAP['pending']

  let action
  if (!hideAction)
    action = {
      onClick: () => setIsApproversListOpen(true),
      text: 'View approvers',
    }

  return (
    <>
      <StatusLine iconInfo={{icon, color}} action={action}>
        <span>{message}</span>
        for <RulesetLink ruleset={ruleset} />
      </StatusLine>
      {isApproversListOpen && (
        <Suspense>
          <ApproversListDialog onClose={() => setIsApproversListOpen(false)} rulesetId={ruleset.id} />
        </Suspense>
      )}
    </>
  )
}

const REQUEST_STATUS_MAP = {
  approved: {
    message: 'Bypass request approved',
    icon: CheckCircleFillIcon,
    color: 'success.fg',
  },
  rejected: {
    message: 'Bypass request denied',
    icon: XCircleFillIcon,
    color: 'danger.fg',
  },
  cancelled: {
    message: 'Bypass request cancelled',
    icon: CircleSlashIcon,
    color: 'fg.subtle',
  },
  expired: {
    message: 'Bypass request expired',
    icon: CircleSlashIcon,
    color: 'fg.subtle',
  },
  pending: {
    message: 'Bypass request submitted',
    icon: CommentIcon,
    color: 'fg.subtle',
  },
  completed: {
    message: 'Bypass request completed',
    icon: CheckCircleFillIcon,
    color: 'success.fg',
  },
  invalid: {
    message: 'Bypass request expired because',
    icon: CircleSlashIcon,
    color: 'fg.subtle',
  },
}

type RequestMessageProps = {
  requestStatus: RequestStatus
  timestamp: string
  hideAction?: boolean
  changedRulesets: Ruleset[]
}

export function RequestStatusLine({
  requestStatus,
  timestamp,
  hideAction = false,
  changedRulesets,
}: RequestMessageProps) {
  const [, setSearchParams] = useSearchParams()
  const {message, icon, color} = REQUEST_STATUS_MAP[requestStatus]
  const action =
    !hideAction && requestNotAtTerminalStatus(requestStatus)
      ? {
          onClick: async () => {
            await updateExemptionRequest('', {status: 'cancel'})
            setSearchParams(params => {
              params.set('cancel', '')
              return params
            })
          },
          text: 'Cancel request',
        }
      : undefined
  return (
    <StatusLine iconInfo={{icon, color}} action={action}>
      <span>{message}</span>
      {requestStatus === 'invalid' && changedRulesets.length > 0 ? (
        <>
          {changedRulesets.map((ruleset, index) => (
            <>
              <RulesetLink key={ruleset.id} ruleset={ruleset} addComma={index < changedRulesets.length - 1} />
            </>
          ))}
          {changedRulesets.length > 1 ? 'were modified' : 'was modified'}
        </>
      ) : (
        <RelativeTime datetime={timestamp} />
      )}
    </StatusLine>
  )
}
