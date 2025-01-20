import resolveResponse from 'contentful-resolve-response'
import {AnimationProvider, Box, Grid, Heading, Pagination, Stack, ThemeProvider} from '@primer/react-brand'

import styles from './CategoryPage.module.css'
import {toCategoryPayload} from '../../lib/types/payload'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {toCategoryPage, toEntryCollection} from '../../lib/types/contentful'
import {CategoryNav} from './CategoryNav'
import {CategoryArticleCard} from './CategoryArticleCard'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {replacePageNumberInUrl, appendFeatureFlagsToUrl} from '../../lib/utils'
import {getAnalyticsEvent} from '@github-ui/swp-core/lib/utils/analytics'

export function Category() {
  const payload = toCategoryPayload(useRoutePayload<unknown>())
  const articles = toCategoryPage(toEntryCollection(resolveResponse(payload.contentfulRawJsonResponse)))

  const queryParams = new URLSearchParams(ssrSafeLocation.search)
  const featureFlags = queryParams.get('_features') || ''

  const {pageHeading, page, totalPages} = payload.additionalProps

  return (
    <ThemeProvider
      dir="ltr"
      style={{
        backgroundColor: 'var(--brand-color-canvas-default)',
      }}
    >
      <AnimationProvider runOnce visibilityOptions={0.2}>
        <Grid>
          <Grid.Column>
            <Box marginBlockStart={{narrow: 64, wide: 112}} marginBlockEnd={{narrow: 32, wide: 64}}>
              <Heading as="h1" size="1" stretch="condensed" weight="semibold" font="hubot-sans">
                {pageHeading}
              </Heading>
            </Box>
          </Grid.Column>
          <Grid.Column span={{xsmall: 12, large: 3}}>
            <Stack direction="vertical" padding="none" gap={24}>
              <CategoryNav activeCategory={pageHeading} featureFlags={featureFlags} />
            </Stack>
          </Grid.Column>

          <Grid.Column span={{xsmall: 12, large: 9}}>
            <Box
              marginBlockEnd={{narrow: 48}}
              paddingBlockEnd={{narrow: 48}}
              borderBlockEndWidth="thin"
              borderColor="default"
              borderStyle="solid"
            >
              <Grid className={styles.cardGrid}>
                {articles.map(article => {
                  const {
                    fields: {
                      template: {fields},
                    },
                  } = article
                  return (
                    <Grid.Column span={{xsmall: 12, medium: 6}} key={article.sys.id}>
                      <CategoryArticleCard
                        path={appendFeatureFlagsToUrl(article.fields.path, featureFlags)}
                        imageUrl={fields.heroBackgroundImage?.fields.image.fields.file.url}
                        imageDescription={fields.heroBackgroundImage?.fields.image.fields.description}
                        title={fields.title}
                        excerpt={fields.excerpt}
                        analyticsId={article.sys.id}
                      />
                    </Grid.Column>
                  )
                })}
              </Grid>
            </Box>
            {totalPages > 1 ? (
              <Pagination
                pageCount={totalPages}
                currentPage={page}
                showPages={{narrow: false, regular: true, wide: true}}
                hrefBuilder={pageNumber =>
                  appendFeatureFlagsToUrl(replacePageNumberInUrl(ssrSafeLocation.pathname, pageNumber), featureFlags)
                }
                pageAttributesBuilder={pageNumber => {
                  return getAnalyticsEvent({
                    action: `page_${pageNumber}`,
                    tag: 'link',
                    context: 'pagination',
                    location: 'resource_category_cards',
                  })
                }}
              />
            ) : null}
          </Grid.Column>
          <Grid.Column />
        </Grid>
      </AnimationProvider>
    </ThemeProvider>
  )
}
