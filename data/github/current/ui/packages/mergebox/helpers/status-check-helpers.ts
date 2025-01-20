import {
  CheckIcon,
  ClockIcon,
  DotFillIcon,
  MoonIcon,
  SkipIcon,
  SquareFillIcon,
  StopIcon,
  XCircleFillIcon,
} from '@primer/octicons-react'

import type {CheckStateRollup, StatusCheck, StatusCheckState} from '../page-data/payloads/status-checks'

/**
 * Consider this a very scrappy version of the StatusCheckConfig ruby class
 * in packages/checks/app/models/status_check_config.rb,
 * but filtered to only contain the values in https://docs.github.com/graphql/reference/enums#checkrunstate
 */
export const STATUS_CHECK_CONFIGS = {
  ACTION_REQUIRED: {
    icon: XCircleFillIcon,
    iconColor: 'var(--fgColor-danger, var(--color-danger-fg))',
    isPending: false,
    isSuccess: false,
  },
  CANCELLED: {
    icon: StopIcon,
    iconColor: 'var(--fgColor-muted, var(--color-fg-muted))',
    isPending: false,
    isSuccess: false,
  },
  COMPLETED: {
    icon: CheckIcon,
    iconColor: 'var(--fgColor-success, var(--color-success-fg))',
    isSuccess: true,
    isPending: false,
  },
  ERROR: {
    icon: XCircleFillIcon,
    iconColor: 'var(--fgColor-danger, var(--color-danger-fg))',
    isPending: false,
    isSuccess: false,
  },
  EXPECTED: {
    icon: DotFillIcon,
    iconColor: 'var(--fgColor-attention, var(--color-attention-fg))',
    isPending: true,
    isSuccess: false,
  },
  FAILURE: {
    icon: XCircleFillIcon,
    iconColor: 'var(--fgColor-danger, var(--color-danger-fg))',
    isPending: false,
    isSuccess: false,
  },
  IN_PROGRESS: {
    icon: DotFillIcon,
    iconColor: 'var(--fgColor-attention, var(--color-attention-fg))',
    isPending: true,
    isSuccess: false,
  },
  NEUTRAL: {
    icon: SquareFillIcon,
    iconColor: 'var(--fgColor-muted, var(--color-fg-muted))',
    isPending: false,
    isSuccess: false,
  },
  PENDING: {
    icon: DotFillIcon,
    iconColor: 'var(--fgColor-attention, var(--color-attention-fg))',
    isPending: true,
    isSuccess: false,
  },
  QUEUED: {
    icon: DotFillIcon,
    iconColor: 'var(--fgColor-attention, var(--color-attention-fg))',
    isPending: true,
    isSuccess: false,
  },
  REQUESTED: {
    icon: DotFillIcon,
    iconColor: 'var(--fgColor-attention, var(--color-attention-fg))',
    backgroundColor: 'none',
    isPending: false,
    isSuccess: false,
  },
  SKIPPED: {
    icon: SkipIcon,
    iconColor: 'var(--fgColor-muted, var(--color-fg-muted))',
    isPending: false,
    isSuccess: false,
  },
  STALE: {
    icon: MoonIcon,
    iconColor: 'var(--fgColor-muted, var(--color-fg-muted))',
    isPending: false,
    isSuccess: false,
  },
  STARTUP_FAILURE: {
    icon: XCircleFillIcon,
    iconColor: 'var(--fgColor-danger, var(--color-danger-fg))',
    isPending: false,
    isSuccess: false,
  },
  SUCCESS: {
    icon: CheckIcon,
    iconColor: 'var(--fgColor-success, var(--color-success-fg))',
    isSuccess: true,
    isPending: false,
  },
  TIMED_OUT: {
    icon: XCircleFillIcon,
    iconColor: 'var(--fgColor-danger, var(--color-danger-fg))',
    isPending: false,
    isSuccess: false,
  },
  WAITING: {
    icon: ClockIcon,
    iconColor: 'var(--fgColor-attention, var(--color-attention-fg))',
    isPending: true,
    isSuccess: false,
  },
  _UNKNOWN_VALUE: {
    icon: DotFillIcon,
    iconColor: 'var(--fgColor-attention, var(--color-attention-fg))',
    isPending: true,
    isSuccess: false,
  },
}

/**
 * A map of the status check states to their sort order. List ordering copied from:
 * https://github.com/github/github/blob/master/packages/checks/app/models/status_check_config.rb
 */
export const STATUS_CHECK_SORT_ORDER: {[key: string]: number} = {
  ACTION_REQUIRED: 0,
  TIMED_OUT: 1,
  FAILURE: 2,
  CANCELLED: 3,
  STALE: 4,
  EXPECTED: 5,
  REQUESTED: 6,
  QUEUED: 7,
  IN_PROGRESS: 8,
  PENDING: 9,
  WAITING: 10,
  NEUTRAL: 11,
  SKIPPED: 12,
  SUCCESS: 13,
  COMPLETED: 14,
  STARTUP_FAILURE: 15,
  _UNKNOWN_VALUE: 16,
}

/**
 * map of check statuses to their accessible text. The order matters.
 */
export const STATUS_CHECK_ACCESSIBLE_NAMES = {
  FAILURE: 'failing',
  NEUTRAL: 'neutral',
  TIMED_OUT: 'timed out',
  CANCELLED: 'cancelled',
  STALE: 'stale',
  PENDING: 'pending',
  IN_PROGRESS: 'in progress',
  REQUESTED: 'requested',
  QUEUED: 'queued',
  SKIPPED: 'skipped',
  EXPECTED: 'expected',
  SUCCESS: 'successful',
}

export function getAccessibleStatusText(groupStatus: keyof typeof STATUS_CHECK_ACCESSIBLE_NAMES) {
  return STATUS_CHECK_ACCESSIBLE_NAMES[groupStatus]
}

const STATUS_CHECK_STATES = Object.keys(STATUS_CHECK_CONFIGS) as StatusCheckState[]

export function isValidStatusOrConclusion(value: string): value is StatusCheckState {
  return STATUS_CHECK_STATES.includes(value as StatusCheckState)
}

/**
 * Maps the a check's conclusion or status into a key that can be used to look up the config in STATUS_CHECK_CONFIGS
 * Returns the _UNKNOWN_VALUE config if the state is not in STATUS_KEYS
 */
export function stateConfigKey(state: string): StatusCheckState {
  // we have to check if state is in the STATUS_KEYS array at runtime
  // because it's slightly possible the GraphQL enum values won't match what we have in STATUS_CHECK_CONFIGS
  // if that happens, we'll just return the _UNKNOWN_VALUE config
  return isValidStatusOrConclusion(state) ? state : '_UNKNOWN_VALUE'
}

function stateConfig(state: StatusCheckState) {
  return STATUS_CHECK_CONFIGS[state]
}

// get the adjective by downcasing the status value, 'PENDING' becomes 'Pending', etc.
// turn underscores into spaces.
function adjectiveForState(state: StatusCheckState) {
  return state.charAt(0) + state.slice(1).toLowerCase().replace(/_/g, ' ')
}

/**
 * Takes a given state and duration in seconds and returns a string that describes the time to complete
 * ex: 'Pending after 1m', 'Success in 2m', 'Skipped'
 */
export function timeToComplete(state: StatusCheckState, durationSeconds: number) {
  // return blank for unknown values
  if (state === '_UNKNOWN_VALUE') return ''
  const adjective = adjectiveForState(state)
  const config = stateConfig(state)

  if (durationSeconds <= 0 || config.isPending) return adjective

  const preposition = config.isSuccess ? 'in' : 'after'

  return `${adjective} ${preposition} ${formatDuration(durationSeconds)}`
}

/**
 * Takes a given duration in seconds and returns a formatted string that rounds to the nearest minute,
 * or returns the number of seconds if the duration is less than one minute.
 */
export function formatDuration(duration: number) {
  if (duration < 60) {
    return `${duration}s`
  }

  return `${Math.round(duration / 60)}m`
}

// sort by displayName case insensitive
export function compareChecks(a: StatusCheck, b: StatusCheck) {
  return a.displayName.localeCompare(b.displayName)
}

/**
 * Group checks data with a provided mapping of group to states. Ordering of key-value pairs will be determined by
 * the provided state mapping.
 *
 * @param checks List of checks-like data
 * @param stateMapping Mapping with group names as keys and a list of corresponding states as values
 * @param getState Function that takes a check value and returns its current state
 *
 * @returns a mapping of the defined groupings to checks
 */
export function groupChecks<T>(
  checks: T[],
  stateMapping: Record<string, string[]>,
  getState: (check: T) => string,
): Record<string, T[]> {
  const initialValue: Record<string, T[]> = {}
  for (const key of Object.keys(stateMapping)) {
    initialValue[key] = []
  }

  return checks.reduce<Record<string, T[]>>((accumulator, currentCheck) => {
    const state = getState(currentCheck)
    const stateGrouping = Object.keys(stateMapping).find(groupName => stateMapping[groupName]!.includes(state))

    if (stateGrouping) {
      const checksForState = accumulator[stateGrouping]

      if (checksForState) {
        checksForState.push(currentCheck)
      }
    }

    return accumulator
  }, initialValue)
}

/*
 * Return aggregated counts for how many checks are failed, successful, pending, skipped, etc .
 *
 * The API returns more granular information about the check status. In order to determine
 * an overall "state" for the pull request, we want to group these granular states into
 * general "buckets".
 */
export function countChecksByGroup(
  checks: CheckStateRollup[],
  stateMapping: Record<string, string[]>,
): Record<string, number> {
  const getCheckState = (check: CheckStateRollup) => {
    return check.state
  }

  const groupedCheckCounts = groupChecks(checks, stateMapping, getCheckState)
  const countChecksForGroup = (checksToCount?: CheckStateRollup[]) =>
    checksToCount?.reduce<number>((accumulator, currentCheck) => accumulator + currentCheck.count, 0) ?? 0

  return Object.fromEntries(
    Object.keys(groupedCheckCounts).map(group => [group, countChecksForGroup(groupedCheckCounts[group])]),
  )
}

export function extractChecksAnalyticsMetadata(statusChecks: CheckStateRollup[]) {
  const statusCheckCounts: Record<string, number> = {}

  for (const obj of statusChecks) {
    statusCheckCounts[obj.state] = obj.count
  }

  return {statusCheckCounts}
}
