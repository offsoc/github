import {BLOCKS, type Document} from '@contentful/rich-text-types'
import {Box, Button, Heading, Text, type HeadingProps} from '@primer/react-brand'
import {documentToReactComponents, type Options} from '@contentful/rich-text-react-renderer'
import {getAnalyticsEvent} from '@github-ui/swp-core/lib/utils/analytics'

import type {ArticlePage} from '../../lib/types/contentful'

import styles from './FeaturedContent.module.css'

type FeaturedContentProps = {
  cta: ArticlePage['fields']['featuredCallToAction']
}

const AsideHeading = ({as = 'h2', ...props}: HeadingProps) => (
  <Heading as={as} size="subhead-medium" font="monospace" className={styles.asideHeading} weight="medium" {...props} />
)

const renderFeaturedDescription = (document: Document) => {
  const options: Options = {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (_, children) => {
        return (
          <Text as="p" size="100" variant="muted">
            {children}
          </Text>
        )
      },
    },
  }

  return documentToReactComponents(document, options)
}

export const FeaturedContent = ({cta}: FeaturedContentProps) => {
  if (!cta) {
    return null
  }

  return (
    <>
      <AsideHeading as="h3">Featured</AsideHeading>
      <Box marginBlockStart={24}>
        <Box marginBlockEnd={4}>
          <Heading as="h4" size="subhead-medium">
            {cta.fields.heading}
          </Heading>
        </Box>
        {renderFeaturedDescription(cta.fields.description)}
      </Box>
      <Box marginBlockStart={16}>
        <Button
          {...getAnalyticsEvent(
            {
              action: cta.fields.callToActionPrimary.fields.text,
              tag: 'button',
              context: 'featured_CTA',
              location: 'table_of_contents',
            },
            {context: false},
          )}
          data-ref={`featured-content-cta-${cta.sys.id}`}
          as="a"
          href={cta.fields.callToActionPrimary.fields.href}
          size="small"
          variant="primary"
        >
          {cta.fields.callToActionPrimary.fields.text}
        </Button>
      </Box>
    </>
  )
}
