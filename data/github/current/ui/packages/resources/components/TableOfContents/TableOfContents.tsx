import {useCallback, useEffect, useState, useDeferredValue} from 'react'
import {Box, Heading, Stack, type HeadingProps} from '@primer/react-brand'
import {ChevronDownIcon, ChevronUpIcon} from '@primer/octicons-react'

import {getAnalyticsEvent} from '@github-ui/swp-core/lib/utils/analytics'
import type {PrimerComponentProse} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentProse'

import type {ArticlePage} from '../../lib/types/contentful'
import {TableOfContentsListItem} from './TableOfContentsListItem'

import styles from './TableofContents.module.css'
import {FeaturedContent} from '../FeaturedContent/FeaturedContent'

const AsideHeading = ({as = 'h2', ...props}: HeadingProps) => (
  <Heading as={as} size="subhead-medium" font="monospace" className={styles.asideHeading} weight="medium" {...props} />
)

type TableOfContentsProps = {
  active: string | undefined
  content: PrimerComponentProse['fields']['text']
  analyticsId: string
  featuredCta?: ArticlePage['fields']['featuredCallToAction']
}

export const TableOfContents = ({active, content, analyticsId, featuredCta}: TableOfContentsProps) => {
  const [narrowMenuOpen, setNarrowMenuOpen] = useState(false)
  const [narrowScrolledPastHeading, setNarrowScrolledPastHeading] = useState(false)

  // This is needed to appropriately fire analytics event when the table of contents menu is toggled.
  const deferredNarrowMenuOpen = useDeferredValue(narrowMenuOpen)

  useEffect(() => {
    // This allows the menu to close when the escape key is pressed for accessibility
    const handleEscape = (event: KeyboardEvent) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (event.key === 'Escape') {
        setNarrowMenuOpen(false)
      }
    }

    if (narrowMenuOpen) {
      window.addEventListener('keydown', handleEscape)
    }

    return () => window.removeEventListener('keydown', handleEscape)
  }, [narrowMenuOpen])

  useEffect(() => {
    // This adjusts the scrolling threshold to show when the table of contents is visible when scrolling
    const threshold = 0
    let lastScrollY = window.pageYOffset
    let ticking = false

    const updateScrollDir = () => {
      const scrollY = window.pageYOffset

      if (scrollY === 0) {
        setNarrowScrolledPastHeading(false)
        ticking = false
        return
      }

      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking = false
        return
      }
      setNarrowScrolledPastHeading(scrollY > lastScrollY ? false : true)
      lastScrollY = scrollY > 0 ? scrollY : 0
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir)
        ticking = true
      }
    }

    // eslint-disable-next-line github/prefer-observers
    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLinkPress = useCallback(() => {
    setNarrowMenuOpen(!narrowMenuOpen)
  }, [setNarrowMenuOpen, narrowMenuOpen])

  const handleNarrowMenu = () => {
    setNarrowMenuOpen(!narrowMenuOpen)
  }

  return (
    <aside className={`${styles.aside} ${narrowScrolledPastHeading ? styles['aside--visible'] : ''}`}>
      <nav aria-labelledby="table-of-contents-heading">
        <Stack
          direction="vertical"
          gap={64}
          padding="none"
          className={`${styles.asideContent} ${narrowMenuOpen ? styles['asideContent--open'] : ''} ${
            narrowScrolledPastHeading ? styles['asideContent--visible'] : ''
          }`}
        >
          <Stack direction="vertical" padding="none" gap={24}>
            <Stack direction="horizontal" padding="none" justifyContent="space-between" alignItems="center">
              <AsideHeading id="table-of-contents-heading">Table of contents</AsideHeading>
              <button
                {...getAnalyticsEvent({
                  action: `${deferredNarrowMenuOpen ? 'collapse' : 'expand'}_table_of_contents_menu`,
                  tag: 'icon',
                  context: 'menu_toggle',
                  location: 'table_of_contents',
                })}
                data-ref={`table-of-contents-menu-toggle-${analyticsId}`}
                className={styles.tableOfContentsMenuToggle}
                onClick={handleNarrowMenu}
              >
                <span className="sr-only">{deferredNarrowMenuOpen ? 'Close' : 'Open'} Table of contents</span>
                {deferredNarrowMenuOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
            </Stack>
            <div
              className={`${styles.tableOfContentsNav} ${narrowMenuOpen ? styles['tableOfContentsNav--visible'] : ''}`}
            >
              <ol className={styles.tableOfContentsList}>
                <TableOfContentsListItem
                  content={content}
                  active={active}
                  analyticsId={analyticsId}
                  handleOnClick={handleLinkPress}
                />
              </ol>
            </div>
          </Stack>

          {featuredCta ? (
            <Box
              paddingBlockStart={8}
              borderBlockStartWidth="thin"
              borderStyle="solid"
              borderColor="muted"
              className={`${styles.tableOfContentsFeaturesBox} ${
                // @ts-expect-error invalid style class name
                narrowMenuOpen ? styles['tableOfContentsFeaturesBox--visible'] : ''
              }`}
            >
              <FeaturedContent cta={featuredCta} />
            </Box>
          ) : null}
        </Stack>
      </nav>
    </aside>
  )
}
