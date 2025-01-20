import {TagIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {LabeledEvent$key} from './__generated__/LabeledEvent.graphql'
import {Label} from './Label'
import {TimelineRow} from './row/TimelineRow'
import type {UnlabeledEvent$key} from './__generated__/UnlabeledEvent.graphql'
import {RolledupLabeledEvent} from './RolledupLabeledEvent'
import type React from 'react'
import {Fragment} from 'react'
import styles from './labels.module.css'

type LabeledEventProps = {
  queryRef: LabeledEvent$key
  rollupGroup?: Record<string, Array<LabeledEvent$key | UnlabeledEvent$key>>
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  timelineEventBaseUrl: string
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

const LabeledEventFragment = graphql`
  fragment LabeledEvent on LabeledEvent {
    databaseId
    createdAt
    actor {
      ...TimelineRowEventActor
    }
    label {
      ...LabelData
    }
  }
`

export function LabeledEvent({
  queryRef,
  rollupGroup,
  issueUrl,
  onLinkClick,
  timelineEventBaseUrl,
  highlightedEventId,
  refAttribute,
}: LabeledEventProps): JSX.Element {
  const {actor, createdAt, databaseId} = useFragment(LabeledEventFragment, queryRef)
  const highlighted = String(databaseId) === highlightedEventId

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={TagIcon}
    >
      <TimelineRow.Main>
        {rollupGroup ? (
          <RolledupLabeledEvent rollupGroup={rollupGroup} timelineEventBaseUrl={timelineEventBaseUrl} />
        ) : (
          <AddedLabelsRendering queryRefs={[queryRef]} timelineEventBaseUrl={timelineEventBaseUrl} />
        )}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

export const AddedLabelsRendering = ({
  queryRefs,
  timelineEventBaseUrl,
}: Pick<LabeledEventProps, 'timelineEventBaseUrl'> & {queryRefs: LabeledEvent$key[]}) => {
  if (queryRefs.length === 0) {
    return null
  }

  return (
    <>
      {`${LABELS.timeline.added} `}
      {queryRefs.map((queryRef, index) => (
        <Fragment key={index}>
          <InternalAddedLabelRendering queryRef={queryRef} timelineEventBaseUrl={timelineEventBaseUrl} />{' '}
        </Fragment>
      ))}
    </>
  )
}

const InternalAddedLabelRendering = ({
  queryRef,
  timelineEventBaseUrl,
}: Pick<LabeledEventProps, 'queryRef' | 'timelineEventBaseUrl'>) => {
  const {label} = useFragment(LabeledEventFragment, queryRef)
  return (
    <div className={styles.labelContainer}>
      <Label queryRef={label} timelineEventBaseUrl={timelineEventBaseUrl} />
    </div>
  )
}
