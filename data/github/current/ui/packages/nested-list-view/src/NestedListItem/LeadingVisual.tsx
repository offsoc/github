import {testIdProps} from '@github-ui/test-id-props'
import {Octicon, type OcticonProps} from '@primer/react'
import {clsx} from 'clsx'
import {type PropsWithChildren, type ReactNode, useEffect} from 'react'

import {useNestedListItemNewActivity} from './context/NewActivityContext'
import {useNestedListItemStatus} from './context/StatusContext'
import styles from './LeadingVisual.module.css'
import {NestedListItemUnreadIndicator} from './UnreadIndicator'

export type NestedListItemLeadingVisualProps = {
  /**
   * The Octicon component representing the desired icon
   */
  icon?: OcticonProps['icon']
  /**
   * Render any child content as the leading visual
   * NOTE: if both icon and children are passed, the icon will be rendered first, with the children appended after
   */
  children?: ReactNode
  /**
   * The name of the Primer variable that will be used for the icon's fill
   * eg.: done.fg
   */
  color?: string
  /**
   * A text description of the item
   * Used for visually hidden text to describe the item on focus for the screen readers
   */
  description?: string
  /**
   * Indicates whether the rendered item has new content since lastViewed
   */
  newActivity?: boolean
  className?: string
}

export function NestedListItemLeadingVisual({
  icon,
  color,
  description,
  newActivity = false,
  children,
  className,
  ...props
}: NestedListItemLeadingVisualProps & PropsWithChildren) {
  const {setStatus} = useNestedListItemStatus()
  const {setHasNewActivity} = useNestedListItemNewActivity()
  const trimmedDescription = description?.trim()

  useEffect(() => {
    setHasNewActivity(newActivity)
  }, [newActivity, setHasNewActivity])

  useEffect(() => {
    if (trimmedDescription) setStatus(trimmedDescription)
  }, [setStatus, trimmedDescription])

  return (
    <div className={clsx(styles.container, newActivity && styles.hasNewActivity, className)} {...props}>
      <div className={styles.visualContainer} {...testIdProps('nested-list-view-leading-visual')}>
        {icon && <Octicon aria-label="" icon={icon} sx={{color}} />}
        {children}
        {trimmedDescription && (
          <span className="sr-only" {...testIdProps('leading-visual-text-description')}>
            {trimmedDescription}
          </span>
        )}
      </div>
      {newActivity && <NestedListItemUnreadIndicator />}
    </div>
  )
}
