import {Box, Heading, Stack, Text} from '@primer/react-brand'
import styles from './CategoryPage.module.css'
import type {PropsWithChildren} from 'react'
import {Topics} from '../../lib/types/utils/topics'
import {appendFeatureFlagsToUrl} from '../../lib/utils'
import {getAnalyticsEvent} from '@github-ui/swp-core/lib/utils/analytics'

const NavListItem = ({
  children,
  selected,
  href,
  ...rest
}: PropsWithChildren<{
  selected?: boolean
  href: string
}>) => (
  <a
    className={`${styles.navListItem} ${selected ? styles.navListItemSelected : ''}`}
    href={href}
    aria-current={selected ? 'page' : undefined}
    {...rest}
  >
    <Text size="200">{children}</Text>
  </a>
)

export function CategoryNav({activeCategory, featureFlags}: {activeCategory: string; featureFlags?: string}) {
  return (
    <Stack direction="vertical" padding="none" gap={24}>
      <Box borderBlockStartWidth="thin" borderStyle="solid" borderColor="subtle" paddingBlockStart={12}>
        <Heading
          as="h2"
          size="subhead-medium"
          font="monospace"
          className={styles.navListHeading}
          weight="medium"
          stretch="expanded"
          id="topics-heading"
        >
          Topics
        </Heading>
      </Box>
      <Box marginBlockEnd={24}>
        <nav aria-labelledby="topics-heading">
          <ul className={styles.navList}>
            {Object.entries(Topics).map(([key, value]) => (
              <li key={key}>
                <NavListItem
                  {...getAnalyticsEvent({
                    action: value,
                    tag: 'link',
                    context: 'topics_nav',
                    location: 'resources_sidebar',
                  })}
                  data-ref={`topics-nav-${key}`}
                  href={appendFeatureFlagsToUrl(
                    `/resources/articles${key === 'all-topics' ? '' : `/${key}`}`,
                    featureFlags,
                  )}
                  selected={activeCategory === value}
                >
                  {value}
                </NavListItem>
              </li>
            ))}
          </ul>
        </nav>
      </Box>
    </Stack>
  )
}
