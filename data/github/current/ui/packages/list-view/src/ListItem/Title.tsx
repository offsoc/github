import {testIdProps} from '@github-ui/test-id-props'
import {Box, type Text} from '@primer/react'
import {clsx} from 'clsx'
import type React from 'react'
import {type ReactElement, useEffect, useRef} from 'react'

import {useListViewVariant} from '../ListView/VariantContext'
import type {PrefixedStylableProps} from '../types'
import {ListItemSelection} from './Selection'
import styles from './Title.module.css'
import {useListItemTitle} from './TitleContext'
import {
  ListItemLinkHeader,
  type ListItemLinkHeaderProps,
  ListItemMarkdownHeader,
  type ListItemMarkdownHeaderProps,
  ListItemStaticHeader,
  type ListItemStaticHeaderProps,
} from './TitleHeader'
import type {ListItemTrailingBadge} from './TrailingBadge'

export type ListItemTitleProps = {
  /**
   * Additional elements to be rendered after the title header element and trailing badge.
   */
  children?: React.ReactNode
  /**
   * An optional element used to indicate information such as the status of the item. Appears after the title text.
   */
  trailingBadges?: Array<ReactElement<typeof ListItemTrailingBadge>>
} & Partial<ListItemMarkdownHeaderProps> &
  ListItemLinkHeaderProps &
  Omit<ListItemStaticHeaderProps, 'sanitize'> &
  PrefixedStylableProps<'container'>

export function ListItemTitle({
  value,
  anchorRef: forwardedAnchorRef,
  headingRef,
  href,
  target,
  onClick,
  onMouseEnter,
  onMouseLeave,
  children,
  markdownValue,
  containerStyle,
  containerSx,
  containerClassName,
  headingStyle,
  headingSx,
  headingClassName,
  anchorStyle,
  anchorSx,
  anchorClassName,
  linkProps = {} as React.ComponentPropsWithoutRef<typeof Text>,
  tooltip,
  leadingBadge,
  trailingBadges,
}: ListItemTitleProps) {
  const {variant} = useListViewVariant()
  const {setTitle, setTitleAction} = useListItemTitle()
  const fallbackAnchorRef = useRef<HTMLAnchorElement>(null)
  const anchorRef = forwardedAnchorRef || fallbackAnchorRef

  useEffect(() => setTitle(value), [setTitle, value])
  useEffect(() => {
    if ((href || onClick) && typeof anchorRef !== 'function' && anchorRef?.current) {
      setTitleAction(() => (e: KeyboardEvent) => {
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        if (href && (e.metaKey || e.ctrlKey)) {
          // open the link in a new tab when command or control are pressed
          window.open(href, '_blank')
        } else {
          anchorRef?.current?.click()
        }
      })
    }
  }, [anchorRef, href, onClick, setTitleAction])

  const baseHeaderProps = {
    headingStyle,
    headingSx,
    headingClassName: clsx(styles.heading, variant === 'compact' && styles.compact, headingClassName),
    leadingBadge,
    tooltip,
    headingRef,
  }

  const header = () => {
    if (markdownValue) {
      return (
        <ListItemMarkdownHeader
          markdownValue={markdownValue}
          anchorStyle={anchorStyle}
          anchorSx={anchorSx}
          anchorClassName={clsx(styles.anchor, styles.markdown, anchorClassName)}
          anchorRef={anchorRef}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          linkProps={linkProps}
          {...baseHeaderProps}
        />
      )
    }

    if (href || onClick) {
      return (
        <ListItemLinkHeader
          value={value}
          anchorStyle={anchorStyle}
          anchorSx={anchorSx}
          anchorClassName={clsx(styles.anchor, anchorClassName)}
          anchorRef={anchorRef}
          href={href}
          target={target}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          linkProps={linkProps}
          {...baseHeaderProps}
        />
      )
    }

    return <ListItemStaticHeader value={value} {...baseHeaderProps} />
  }

  return (
    <>
      <Box
        {...testIdProps('list-view-item-title-container')}
        style={containerStyle}
        sx={containerSx}
        className={clsx(styles.container, variant === 'compact' && styles.compact, containerClassName)}
      >
        {header()}
        {/* Can't use margin because the trailing badges need to wrap inline around the title
        so we add gap after text for spacing */}
        {trailingBadges && <span className={styles.trailingBadgesSpacer} />}
        <span className={styles.trailingBadgesContainer}>{trailingBadges}</span>
        {children}
      </Box>
      <ListItemSelection />
    </>
  )
}
