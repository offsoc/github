import resolveResponse from 'contentful-resolve-response'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {toPayload} from '../../lib/types/payload'
import {toCategoryPage, toEntryCollection} from '../../lib/types/contentful'
import {AnimationProvider, Box, Grid, Heading, Link, ThemeProvider} from '@primer/react-brand'
import {ContentfulHero} from '@github-ui/swp-core/components/contentful/ContentfulHero'
import styles from './Category.module.css'
import {ContentfulStatistic} from '@github-ui/swp-core/components/contentful/ContentfulStatistic'
import {ContentfulCtaBanner} from '@github-ui/swp-core/components/contentful/ContentfulCtaBanner'
import {ContentfulCards} from '@github-ui/swp-core/components/contentful/ContentfulCards'
import {BreadcrumbSeoSchema} from '@github-ui/swp-core/components/structuredData/BreadcrumbSeoSchema'
import {SolutionsBreadcrumb} from '../../lib/types/breadcrumbs'
import {ssrSafeLocation} from '@github-ui/ssr-utils'

export function Category() {
  const payload = toPayload(useRoutePayload<unknown>())
  const page = toCategoryPage(toEntryCollection(resolveResponse(payload.contentfulRawJsonResponse)).at(0))
  const {template, settings} = page.fields

  const hasBorder = settings?.fields.colorMode === 'dark'

  const queryParams = new URLSearchParams(ssrSafeLocation.search)
  const featureFlags = queryParams.get('_features') || ''
  const solutionsPath = `${SolutionsBreadcrumb.url}${featureFlags ? `?_features=${featureFlags}` : ''}`

  const breadcrumbs = [{name: SolutionsBreadcrumb.label, url: solutionsPath}]

  return (
    <ThemeProvider
      colorMode={settings?.fields.colorMode ?? 'light'}
      style={{backgroundColor: 'var(--brand-color-canvas-default)'}}
    >
      <AnimationProvider runOnce visibilityOptions={0.2}>
        <Box className={styles.hideHorizontalOverflow}>
          <Box marginBlockStart={20}>
            <Grid>
              <Grid.Column>
                <Link href={solutionsPath} arrowDirection="start">
                  {SolutionsBreadcrumb.label}
                </Link>
              </Grid.Column>
            </Grid>
          </Box>
          <Box className={styles.customHero}>
            <Grid className={styles.relative}>
              <Grid.Column>
                <ContentfulHero component={template.fields.hero} />
              </Grid.Column>
            </Grid>
          </Box>
          <Box
            marginBlockEnd={{
              narrow: 16,
              regular: 16,
              wide: 48,
            }}
          >
            <ContentfulCards
              component={template.fields.solutionPageCards}
              className={styles.subtleCards}
              hasBorder={hasBorder}
              spanOpts={{medium: 12, large: 4}}
              fullWidth
              animate="fade-in"
            />
          </Box>
          {template.fields.relatedSolutionCards ? (
            <section>
              <Grid className={styles.subtleCards}>
                <Grid.Column>
                  <Box paddingBlockStart={128} paddingBlockEnd={40}>
                    <Heading as="h2" size="4">
                      Related solutions
                    </Heading>
                  </Box>
                </Grid.Column>
                <Grid.Column>
                  <ContentfulCards
                    component={template.fields.relatedSolutionCards}
                    hasBorder={hasBorder}
                    spanOpts={{medium: 12, large: 4}}
                    fullWidth
                    animate="fade-in"
                  />
                </Grid.Column>
              </Grid>
            </section>
          ) : null}
          {template.fields.featuredStatistics ? (
            <Box marginBlockStart={{narrow: 64, regular: 128}} marginBlockEnd={{narrow: 64, regular: 80}}>
              <Grid>
                {template.fields.featuredStatistics.map(stat => (
                  <Grid.Column span={{medium: 6, large: 3}} key={stat.sys.id}>
                    <Box paddingBlockEnd={{narrow: 24, regular: 'none'}}>
                      <ContentfulStatistic component={stat} animate="fade-in" />
                    </Box>
                  </Grid.Column>
                ))}
              </Grid>
            </Box>
          ) : null}
        </Box>
      </AnimationProvider>
      <Box backgroundColor="default" paddingBlockEnd={112} borderRadius="xlarge">
        <Grid>
          <Grid.Column>
            <Box className={styles.ctaBannerBackground}>
              <ContentfulCtaBanner component={template.fields.ctaBanner} />
            </Box>
          </Grid.Column>
        </Grid>
      </Box>
      <BreadcrumbSeoSchema items={breadcrumbs} />
    </ThemeProvider>
  )
}
