import type {SafeHTMLString} from '@github-ui/safe-html'
import {SafeHTMLText} from '@github-ui/safe-html'
import {useMemo} from 'react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {VALUES} from '../constants/values'
import type {LabelData$key} from './__generated__/LabelData.graphql'
import {LabelToken} from '@github-ui/label-token'
import {Tooltip} from '@primer/react/next'
import styles from './labels.module.css'
import {Link} from '@primer/react'

type LabelProps = {
  queryRef: LabelData$key
  timelineEventBaseUrl: string
}

export function Label({queryRef, timelineEventBaseUrl}: LabelProps): JSX.Element {
  const {
    nameHTML,
    name,
    color,
    id,
    description,
    repository: {
      name: repoName,
      owner: {login: ownerLogin},
    },
  } = useFragment(
    graphql`
      fragment LabelData on Label {
        nameHTML
        name
        color
        id
        description
        repository {
          name
          owner {
            login
          }
        }
      }
    `,
    queryRef,
  )

  const url = useMemo(() => {
    return `${timelineEventBaseUrl}?q=${encodeURIComponent(VALUES.labelQuery(ownerLogin, repoName, name))}`
  }, [timelineEventBaseUrl, ownerLogin, repoName, name])

  return (
    <Tooltip text={description ?? ''} sx={{position: 'absolute', visibility: description ? 'visible' : 'hidden'}}>
      <Link href={url} className={styles.labelLink} aria-describedby={`${id}-tooltip`} muted>
        <LabelToken
          text={<SafeHTMLText html={nameHTML as SafeHTMLString} />}
          fillColor={`#${color}`}
          key={id}
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '20ch',
            cursor: 'pointer',
          }}
        />
        <span className="sr-only" id={`${id}-tooltip`}>
          {description ?? ''}
        </span>
      </Link>
    </Tooltip>
  )
}
