import {StateLabel} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import type {HeaderState$key} from './__generated__/HeaderState.graphql'
import {TEST_IDS} from '../../constants/test-ids'

type HeaderStateProps = {
  stateData: HeaderState$key
}

export function HeaderState({stateData}: HeaderStateProps) {
  const {state, stateReason} = useFragment(
    graphql`
      fragment HeaderState on Issue {
        state
        stateReason
      }
    `,
    stateData,
  )
  return (
    <div>
      <StateLabel data-testid={TEST_IDS.headerState} status={issueStateStatus(state, stateReason ?? '')}>
        {issueStateString(state)}
      </StateLabel>
    </div>
  )
}

const issueStateStatus = (
  state: string,
  stateReason: string,
): 'issueOpened' | 'issueClosed' | 'issueClosedNotPlanned' => {
  switch (state) {
    case 'OPEN':
      return 'issueOpened'
    case 'CLOSED':
      return stateReason === 'NOT_PLANNED' ? 'issueClosedNotPlanned' : 'issueClosed'
    default:
      return 'issueClosed'
  }
}

const issueStateString = (state: string): string => {
  switch (state) {
    case 'OPEN':
      return 'Open'
    case 'CLOSED':
      return 'Closed'
    default:
      return ''
  }
}
