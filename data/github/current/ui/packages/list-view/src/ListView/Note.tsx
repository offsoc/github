import {testIdProps} from '@github-ui/test-id-props'
import type {IconProps} from '@primer/octicons-react'
import {Box} from '@primer/react'
import {clsx} from 'clsx'
import {type FunctionComponent, type PropsWithChildren, useId} from 'react'

import leadingContentStyles from '../ListItem/LeadingContent.module.css'
import type {StylableProps} from '../types'
import {useListViewId} from './IdContext'
import styles from './Note.module.css'
import {useListViewVariant} from './VariantContext'

export type Style = Pick<
  React.CSSProperties,
  | 'borderTop'
  | 'borderBottom'
  | 'borderTopLeftRadius'
  | 'borderTopRightRadius'
  | 'borderBottomLeftRadius'
  | 'borderBottomRightRadius'
>

export interface ListViewNoteProps extends StylableProps {
  /**
   * The text content of the note
   */
  title: string
  /**
   * The icon to render within the item but before its title
   */
  leadingIcon?: FunctionComponent<PropsWithChildren<IconProps>>
}

export const ListViewNote = ({
  title,
  style,
  sx,
  className,
  leadingIcon: LeadingIcon,
  children,
}: PropsWithChildren<ListViewNoteProps>) => {
  const {idPrefix} = useListViewId()
  const {variant} = useListViewVariant()
  const uniqueIdSuffix = useId()
  const titleId = `${idPrefix}-list-view-note-${uniqueIdSuffix}`

  return (
    <Box
      as="li"
      style={style}
      sx={sx}
      role="listitem"
      className={clsx(
        // CSS Modules class names
        styles.container,
        variant === 'compact' && styles.compact,
        className,
      )}
      aria-labelledby={titleId}
      tabIndex={-1} // Handled by useFocusZone with roving tabIndex
      {...testIdProps('list-view-note')}
    >
      <div className={clsx(styles.leadingIconContainer, leadingContentStyles.container)}>
        {LeadingIcon && <LeadingIcon />}
      </div>
      <span id={titleId} className={styles.title} {...testIdProps('list-view-note-title')}>
        {title}
      </span>
      <div className={styles.childrenContainer}>{children}</div>
    </Box>
  )
}
