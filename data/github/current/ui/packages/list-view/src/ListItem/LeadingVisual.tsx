import {testIdProps} from '@github-ui/test-id-props'
import {Octicon, type OcticonProps} from '@primer/react'
import {clsx} from 'clsx'
import {type PropsWithChildren, type ReactNode, useEffect} from 'react'

import {useListViewVariant} from '../ListView/VariantContext'
import styles from './LeadingVisual.module.css'
import {useListItemNewActivity} from './NewActivityContext'
import {useListItemStatus} from './StatusContext'
import {ListItemUnreadIndicator} from './UnreadIndicator'

export type ListItemLeadingVisualProps = {
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
}

export function ListItemLeadingVisual({
  icon,
  color,
  description,
  newActivity = false,
  children,
  ...props
}: ListItemLeadingVisualProps & PropsWithChildren) {
  const {variant} = useListViewVariant()
  const {setStatus} = useListItemStatus()
  const {setHasNewActivity} = useListItemNewActivity()
  const trimmedDescription = description?.trim()

  useEffect(() => {
    setHasNewActivity(newActivity)
  }, [newActivity, setHasNewActivity])

  useEffect(() => {
    if (trimmedDescription) setStatus(trimmedDescription)
  }, [setStatus, trimmedDescription])

  return (
    <div
      className={clsx(
        styles.outer,
        variant === 'default' && styles.defaultVariant,
        newActivity && styles.hasNewActivity,
      )}
      {...props}
    >
      <div>
        <div {...testIdProps('list-view-leading-visual')} className={styles.inner}>
          {icon && <Octicon aria-label="" icon={icon} color={color} />}
          {children}
          {trimmedDescription && (
            <span className="sr-only" {...testIdProps('leading-visual-text-description')}>
              {trimmedDescription}
            </span>
          )}
        </div>
      </div>
      {newActivity && <ListItemUnreadIndicator />}
    </div>
  )
}
