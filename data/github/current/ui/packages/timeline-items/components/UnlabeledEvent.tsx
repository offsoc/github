import {TagIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {UnlabeledEvent$key} from './__generated__/UnlabeledEvent.graphql'
import {Label} from './Label'
import {TimelineRow} from './row/TimelineRow'
import type {LabeledEvent$key} from './__generated__/LabeledEvent.graphql'
import {RolledupLabeledEvent} from './RolledupLabeledEvent'
import {Fragment} from 'react'
import styles from './labels.module.css'

type UnlabeledEventProps = {
  queryRef: UnlabeledEvent$key
  rollupGroup?: Record<string, Array<LabeledEvent$key | UnlabeledEvent$key>>
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  timelineEventBaseUrl: string
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

const UnlabeledEventFragment = graphql`
  fragment UnlabeledEvent on UnlabeledEvent {
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

export function UnlabeledEvent({
  queryRef,
  rollupGroup,
  issueUrl,
  onLinkClick,
  timelineEventBaseUrl,
  highlightedEventId,
  refAttribute,
}: UnlabeledEventProps): JSX.Element {
  const {actor, createdAt, databaseId} = useFragment(UnlabeledEventFragment, queryRef)
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
          <UnlabeledRendering queryRefs={[queryRef]} timelineEventBaseUrl={timelineEventBaseUrl} />
        )}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

export const UnlabeledRendering = ({
  queryRefs,
  timelineEventBaseUrl,
}: Pick<UnlabeledEventProps, 'timelineEventBaseUrl'> & {queryRefs: UnlabeledEvent$key[]}) => {
  if (queryRefs.length === 0) {
    return null
  }

  return (
    <>
      {`${LABELS.timeline.removed} `}
      {queryRefs.map((queryRef, index) => (
        <Fragment key={index}>
          <InternalAddedUnlabelRendering queryRef={queryRef} timelineEventBaseUrl={timelineEventBaseUrl} />{' '}
        </Fragment>
      ))}
    </>
  )
}

const InternalAddedUnlabelRendering = ({
  queryRef,
  timelineEventBaseUrl,
}: Pick<UnlabeledEventProps, 'queryRef' | 'timelineEventBaseUrl'>) => {
  const {label} = useFragment(UnlabeledEventFragment, queryRef)
  return (
    <div className={styles.labelContainer}>
      <Label queryRef={label} timelineEventBaseUrl={timelineEventBaseUrl} />
    </div>
  )
}
