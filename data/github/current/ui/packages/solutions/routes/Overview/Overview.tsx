import resolveResponse from 'contentful-resolve-response'
import {AnimationProvider, Box, Grid, Heading, Stack, ThemeProvider} from '@primer/react-brand'

import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {ContentfulHero} from '@github-ui/swp-core/components/contentful/ContentfulHero'
import {ContentfulSectionIntro} from '@github-ui/swp-core/components/contentful/ContentfulSectionIntro'
import {ContentfulCards} from '@github-ui/swp-core/components/contentful/ContentfulCards'
import {ContentfulCtaBanner} from '@github-ui/swp-core/components/contentful/ContentfulCtaBanner'
import {ContentfulBackgroundImage} from '@github-ui/swp-core/components/contentful/ContentfulBackgroundImage'
import {ContentfulFeaturedBento} from '@github-ui/swp-core/components/contentful/ContentfulFeaturedBento'

import {toPayload} from '../../lib/types/payload'
import {toOverviewPage, toEntryCollection} from '../../lib/types/contentful'
import styles from './Overview.module.css'

export function Overview() {
  const payload = toPayload(useRoutePayload<unknown>())
  const page = toOverviewPage(toEntryCollection(resolveResponse(payload.contentfulRawJsonResponse)).at(0))
  const template = page.fields.template
  const pageColorMode = page.fields.settings?.fields.colorMode ?? 'light'

  return (
    <ThemeProvider
      colorMode={pageColorMode}
      style={{
        backgroundColor: 'var(--brand-color-canvas-default)',
      }}
    >
      <AnimationProvider runOnce visibilityOptions={0.2}>
        <ThemeProvider colorMode="dark">
          <section>
            <ContentfulBackgroundImage component={template.fields.heroBackgroundImage}>
              <Box>
                <ContentfulHero data-hpc component={template.fields.hero} />
              </Box>
            </ContentfulBackgroundImage>
          </section>
        </ThemeProvider>
        <div className={styles.articleContents}>
          <section className={styles.verticalOffset}>
            <Box
              paddingBlockStart={{narrow: 64, regular: 96}}
              paddingBlockEnd={64}
              className={styles.noBottomRadius}
              backgroundColor="default"
              borderRadius="xlarge"
            >
              <Grid>
                <Grid.Column>
                  <Box marginBlockEnd={40}>
                    <ContentfulSectionIntro headingSize="3" component={template.fields.companySizeSectionIntro} />
                  </Box>

                  <Box
                    marginBlockEnd={{
                      narrow: 32,
                      regular: 32,
                      wide: 48,
                    }}
                  >
                    <ContentfulCards
                      hasBorder
                      fullWidth
                      animate="fade-in"
                      component={template.fields.companySizeSectionSolutions}
                    />
                  </Box>
                  <ThemeProvider colorMode="dark" style={{backgroundColor: 'transparent'}}>
                    <ContentfulFeaturedBento
                      itemFlow={{
                        xsmall: 'row',
                        small: 'column',
                        medium: 'column',
                        large: 'column',
                        xlarge: 'column',
                        xxlarge: 'column',
                      }}
                      itemRowSpan={4}
                      headingSize="4"
                      boxPaddingBlockEnd={128}
                      boxPaddingBlockStart={'none'}
                      linkSize="large"
                      component={template.fields.companySizeSectionFeaturedSolution}
                    />
                  </ThemeProvider>
                </Grid.Column>
              </Grid>
            </Box>
          </section>
          <section className={styles.verticalOffset}>
            <Box
              backgroundColor="subtle"
              paddingBlockStart={{narrow: 64, regular: 96}}
              paddingBlockEnd={64}
              borderRadius="xlarge"
              className={styles.noBottomRadius}
            >
              <Grid>
                <Grid.Column>
                  <Box marginBlockEnd={40}>
                    <ContentfulSectionIntro headingSize="3" component={template.fields.industrySectionIntro} />
                  </Box>
                  <Box
                    marginBlockEnd={{
                      narrow: 64,
                      regular: 64,
                      wide: 112,
                    }}
                  >
                    <ContentfulCards
                      spanOpts={{medium: 4}}
                      hasBorder
                      fullWidth
                      animate="fade-in"
                      component={template.fields.industrySectionSolutions}
                    />
                  </Box>
                </Grid.Column>
              </Grid>
            </Box>
          </section>
          <section className={styles.verticalOffset}>
            <Box
              backgroundColor="default"
              paddingBlockStart={{narrow: 64, regular: 96}}
              paddingBlockEnd={64}
              borderRadius="xlarge"
              className={styles.noBottomRadius}
            >
              <Grid>
                <Grid.Column>
                  <Box marginBlockEnd={40}>
                    <ContentfulSectionIntro headingSize="3" component={template.fields.useCaseSectionIntro} />
                  </Box>
                  <Box
                    marginBlockEnd={{
                      narrow: 64,
                      regular: 64,
                      wide: 112,
                    }}
                  >
                    <ContentfulCards
                      spanOpts={{medium: 4}}
                      hasBorder
                      fullWidth
                      animate="fade-in"
                      component={template.fields.useCaseSectionSolutions}
                    />
                  </Box>
                  {template.fields.featuredCustomerStories && template.fields.featuredCustomerStoriesHeadline ? (
                    <Stack direction="vertical" padding="none" alignItems="center" gap={64}>
                      <Heading as="h2" size="4">
                        {template.fields.featuredCustomerStoriesHeadline}
                      </Heading>
                      <Box
                        className={styles.portalCustomerCards}
                        marginBlockEnd={{
                          narrow: 64,
                          regular: 64,
                          wide: 128,
                        }}
                      >
                        <ContentfulCards
                          spanOpts={{medium: 4}}
                          component={template.fields.featuredCustomerStories}
                          className={styles.customerCards}
                          imageAspectRatio="16:9"
                          fullWidth
                        />
                      </Box>
                    </Stack>
                  ) : null}
                </Grid.Column>
              </Grid>
            </Box>
          </section>
          <section className={styles.verticalOffset}>
            <ThemeProvider colorMode="dark" style={{backgroundColor: 'transparent'}}>
              <Box
                backgroundColor="default"
                borderRadius="xlarge"
                className={styles.noBottomRadius}
                paddingBlockStart={{narrow: 64, regular: 96}}
                paddingBlockEnd={{narrow: 64, regular: 112}}
              >
                <Grid>
                  <Grid.Column>
                    <ContentfulCtaBanner component={template.fields.ctaBanner} className={styles.ctaBanner} />
                  </Grid.Column>
                </Grid>
              </Box>
            </ThemeProvider>
          </section>
        </div>
      </AnimationProvider>
    </ThemeProvider>
  )
}
