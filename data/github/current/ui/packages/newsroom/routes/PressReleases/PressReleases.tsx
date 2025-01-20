import {
  AnimationProvider,
  Box,
  Grid,
  Heading,
  Image,
  Link,
  SectionIntro,
  Stack,
  ThemeProvider,
} from '@primer/react-brand'
import resolveResponse from 'contentful-resolve-response'
import {useRef} from 'react'

import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {ContentfulCards} from '@github-ui/swp-core/components/contentful/ContentfulCards'
import {ContentfulCtaBanner} from '@github-ui/swp-core/components/contentful/ContentfulCtaBanner'
import {ContentfulFaqGroup} from '@github-ui/swp-core/components/contentful/ContentfulFaqGroup'
import {ContentfulProse} from '@github-ui/swp-core/components/contentful/ContentfulProse'
import {getImageSources} from '@github-ui/swp-core/lib/utils/images'
import {ArticleSeoSchema} from '@github-ui/swp-core/components/structuredData/ArticleSeoSchema'
import {BreadcrumbSeoSchema} from '@github-ui/swp-core/components/structuredData/BreadcrumbSeoSchema'
import {toArticlePage} from '@github-ui/resources/types'
import {useCurrentVisibleHeading} from '@github-ui/resources/hooks'
import {ssrSafeLocation} from '@github-ui/ssr-utils'

import {Lede} from '../../components/Lede/Lede'
import {TableOfContents} from '../../components/TableOfContents/TableOfContents'
import {toEntryCollection} from '../../lib/types/contentful'
import {toPayload} from '../../lib/types/payload'

import styles from './PressReleases.module.css'

export function PressReleases() {
  const contentRef = useRef<HTMLDivElement | null>(null)

  const {contentfulRawJsonResponse} = toPayload(useRoutePayload<unknown>())
  const page = toArticlePage(toEntryCollection(resolveResponse(contentfulRawJsonResponse)).at(0))

  const url = new URL(page.fields.path, ssrSafeLocation.origin)
  const urlParts = url.pathname.split('/')

  const currentVisibleHeading = useCurrentVisibleHeading({ref: contentRef})

  const {cards, content, ctaBanner, faq, featuredCallToAction, heroBackgroundImage, lede, title} =
    page.fields.template.fields
  const backgroundImageUrl = heroBackgroundImage?.fields.image.fields.file.url
  const breadcrumbListItems = [
    {
      name: 'Newsroom',
      url: `${url.origin}/${urlParts[1]}`,
    },
  ]

  return (
    <ThemeProvider
      dir="ltr"
      className={styles.articlePageBody}
      style={{backgroundColor: 'var(--brand-color-canvas-default)'}}
    >
      <Grid>
        <Grid.Column span={12}>
          <section>
            <AnimationProvider runOnce visibilityOptions={0.3}>
              <header>
                <Box marginBlockStart={20}>
                  <Link href={`${url.origin}/${urlParts[1]}`} arrowDirection="start">
                    Newsroom
                  </Link>
                </Box>
                <Box marginBlockStart={64} marginBlockEnd={32}>
                  <Heading as="h1" size="1" stretch="condensed" weight="semibold" font="hubot-sans">
                    {title}
                  </Heading>
                </Box>
              </header>

              <article>
                <Box marginBlockEnd={{narrow: 48}} paddingBlockEnd={{narrow: 48}}>
                  <Box borderRadius="large" className={styles.heroImageArea} marginBlockEnd={{narrow: 64, wide: 80}}>
                    {backgroundImageUrl ? (
                      <Image
                        borderRadius="xlarge"
                        alt=""
                        as="picture"
                        src={backgroundImageUrl}
                        className={styles.heroImage}
                        sources={getImageSources(backgroundImageUrl)}
                      />
                    ) : null}
                  </Box>

                  <Grid>
                    <Grid.Column
                      span={{xsmall: 12, large: 4}}
                      start={{xsmall: 1, large: 10}}
                      className={styles.asideCol}
                    >
                      <TableOfContents
                        analyticsId={page.sys.id}
                        content={content.fields.text}
                        active={currentVisibleHeading}
                        featuredCta={featuredCallToAction}
                      />
                    </Grid.Column>

                    <Grid.Column span={{xsmall: 12, large: 9}} className={styles.articleCol}>
                      <Grid>
                        <Grid.Column span={{xsmall: 12, large: 11}}>
                          <Box marginBlockEnd={{narrow: 24, wide: 48}}>
                            <header>
                              <Lede content={lede} />
                            </header>
                          </Box>
                        </Grid.Column>
                      </Grid>
                      <div ref={contentRef}>
                        <ContentfulProse variant="editorial" component={content} />
                      </div>
                    </Grid.Column>
                  </Grid>
                  <Grid>
                    <Grid.Column span={12}>
                      {ctaBanner || cards || faq ? (
                        <Box marginBlockStart={{narrow: 64, wide: 112}}>
                          <Stack direction="vertical" gap={128} padding="none">
                            {ctaBanner ? (
                              <Box animate="scale-in-up">
                                <ContentfulCtaBanner component={ctaBanner} />
                              </Box>
                            ) : null}

                            {cards ? (
                              <section>
                                <Stack direction="vertical" gap={64} padding="none">
                                  <SectionIntro align="center">
                                    <SectionIntro.Heading as="h2">{`More GitHub resources`}</SectionIntro.Heading>
                                  </SectionIntro>
                                  <Box animate="scale-in-up">
                                    <ContentfulCards cards={cards.fields.cards} hasBorder />
                                  </Box>
                                </Stack>
                              </section>
                            ) : null}

                            {faq ? (
                              <section>
                                <Box animate="scale-in-up">
                                  <ContentfulFaqGroup component={faq} />
                                </Box>
                              </section>
                            ) : null}
                          </Stack>
                        </Box>
                      ) : null}
                    </Grid.Column>
                  </Grid>
                </Box>
              </article>
            </AnimationProvider>
          </section>
        </Grid.Column>
      </Grid>
      <ArticleSeoSchema title={title} imageUrl={backgroundImageUrl} />
      <BreadcrumbSeoSchema items={breadcrumbListItems} />
    </ThemeProvider>
  )
}
