import {ProgressCircle} from '@github-ui/progress-circle'
import {testIdProps} from '@github-ui/test-id-props'
import {TriangleRightIcon} from '@primer/octicons-react'
import {Octicon, Token, type TokenProps} from '@primer/react'
import {clsx} from 'clsx'
import {useEffect} from 'react'

import styles from './CompletionPill.module.css'
import {useNestedListViewSelection} from './context/SelectionContext'
import {useNestedListItemCompletion} from './NestedListItem/context/CompletionContext'

interface Progress {
  total: number
  completed: number
  percentCompleted: number
}

export interface NestedListViewCompletionPillProps extends Omit<TokenProps, 'leadingVisual' | 'text' | 'ref'> {
  progress: Progress
}

export function NestedListViewCompletionPill({
  progress: {total, completed, percentCompleted},
  ...tokenProps
}: NestedListViewCompletionPillProps) {
  const {pluralUnits} = useNestedListViewSelection()
  const completionContext = useNestedListItemCompletion()
  const expandOnHover = tokenProps.href
  const label = `${completed} of ${total} ${pluralUnits} completed`

  useEffect(() => {
    if (completionContext) completionContext.setCompletion(label)
  }, [completionContext, label])

  return (
    <Token
      leadingVisual={() => (
        <ProgressCircle percentCompleted={percentCompleted} size={14} svgClassName={styles.progressIcon} />
      )}
      {...testIdProps('nested-list-view-completion-pill')}
      text={
        <>
          <span
            {...testIdProps('nested-list-view-completion-text')}
            aria-hidden="true"
          >{`${completed} of ${total}`}</span>

          <span {...testIdProps('nested-list-view-completion-text-sr')} className="sr-only">
            {label}
          </span>
          {expandOnHover && (
            <Octicon
              icon={TriangleRightIcon}
              className={styles.hoverExpandIcon}
              aria-hidden="true"
              {...testIdProps('nested-list-view-clickable-svg')}
            />
          )}
        </>
      }
      {...tokenProps}
      as={tokenProps.href ? 'a' : 'span'}
      className={clsx(styles.completionPill, expandOnHover && styles.expandOnHover, tokenProps.className)}
    />
  )
}
