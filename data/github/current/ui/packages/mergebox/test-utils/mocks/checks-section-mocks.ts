import {StatusCheckGenerator} from '../object-generators/status-check'
import type {StatusChecksPageData} from '../../page-data/payloads/status-checks'
import {aliveChannels} from './alive-channels-mock'

/**
 * Preset states for the ChecksSection of the mergebox
 */
export const checksSectionPendingState: StatusChecksPageData = {
  aliveChannels: {commitHeadShaChannel: aliveChannels.commitHeadShaChannel},
  statusRollup: {
    summary: [{count: 1, state: 'PENDING'}],
    combinedState: 'PENDING',
  },
  statusChecks: [StatusCheckGenerator({state: 'PENDING'})],
}

export const checksSectionPendingWithFailureState: StatusChecksPageData = {
  aliveChannels: {commitHeadShaChannel: aliveChannels.commitHeadShaChannel},
  statusRollup: {
    summary: [
      {count: 1, state: 'PENDING'},
      {count: 1, state: 'FAILURE'},
      {count: 1, state: 'SUCCESS'},
    ],
    combinedState: 'PENDING_FAILED',
  },
  statusChecks: [
    StatusCheckGenerator({state: 'PENDING'}),
    StatusCheckGenerator({state: 'SUCCESS'}),
    StatusCheckGenerator({state: 'FAILURE'}),
  ],
}

export const checksSectionPendingFromQueuedState: StatusChecksPageData = {
  aliveChannels: {commitHeadShaChannel: aliveChannels.commitHeadShaChannel},
  statusRollup: {
    summary: [{count: 1, state: 'QUEUED'}],
    combinedState: 'PENDING',
  },
  statusChecks: [StatusCheckGenerator({state: 'QUEUED'})],
}

export const checksSectionPassingState: StatusChecksPageData = {
  aliveChannels: {commitHeadShaChannel: aliveChannels.commitHeadShaChannel},
  statusRollup: {
    summary: [{count: 2, state: 'SUCCESS'}],
    combinedState: 'PASSED',
  },
  statusChecks: [StatusCheckGenerator({state: 'SUCCESS'}), StatusCheckGenerator({state: 'SUCCESS'})],
}

export const checksSectionPassingWithSkippedState: StatusChecksPageData = {
  aliveChannels: {commitHeadShaChannel: aliveChannels.commitHeadShaChannel},
  statusRollup: {
    summary: [{count: 1, state: 'SKIPPED'}],
    combinedState: 'PASSED',
  },
  statusChecks: [StatusCheckGenerator({state: 'SKIPPED'})],
}

export const checksSectionFailedState: StatusChecksPageData = {
  aliveChannels: {commitHeadShaChannel: aliveChannels.commitHeadShaChannel},
  statusRollup: {
    summary: [{count: 2, state: 'FAILURE'}],
    combinedState: 'FAILED',
  },
  statusChecks: [StatusCheckGenerator({state: 'FAILURE'}), StatusCheckGenerator({state: 'FAILURE'})],
}

export const checksSectionSomeFailedState: StatusChecksPageData = {
  aliveChannels: {commitHeadShaChannel: aliveChannels.commitHeadShaChannel},
  statusRollup: {
    summary: [
      {count: 1, state: 'SUCCESS'},
      {count: 1, state: 'FAILURE'},
    ],
    combinedState: 'SOME_FAILED',
  },
  statusChecks: [StatusCheckGenerator({state: 'SUCCESS'}), StatusCheckGenerator({state: 'FAILURE'})],
}

export const checksSectionFailedTimedOutState: StatusChecksPageData = {
  aliveChannels: {commitHeadShaChannel: aliveChannels.commitHeadShaChannel},
  statusRollup: {
    summary: [{count: 1, state: 'TIMED_OUT'}],
    combinedState: 'FAILED',
  },
  statusChecks: [StatusCheckGenerator({state: 'TIMED_OUT'})],
}

export const checksSectionNoChecksState: StatusChecksPageData = {
  aliveChannels: {commitHeadShaChannel: aliveChannels.commitHeadShaChannel},
  statusRollup: {
    summary: [],
    combinedState: 'PASSED',
  },
  statusChecks: [],
}
