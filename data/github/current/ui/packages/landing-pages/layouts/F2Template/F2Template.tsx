import {ContentfulBackgroundImage} from '@github-ui/swp-core/components/contentful/ContentfulBackgroundImage'
import {ContentfulCards} from '@github-ui/swp-core/components/contentful/ContentfulCards'
import {ContentfulCtaBanner} from '@github-ui/swp-core/components/contentful/ContentfulCtaBanner'
import {ContentfulFaqGroup} from '@github-ui/swp-core/components/contentful/ContentfulFaqGroup'
import {ContentfulHero} from '@github-ui/swp-core/components/contentful/ContentfulHero'
import {ContentfulPillars} from '@github-ui/swp-core/components/contentful/ContentfulPillars'
import {ContentfulRiver} from '@github-ui/swp-core/components/contentful/ContentfulRiver'
import {ContentfulRiverBreakout} from '@github-ui/swp-core/components/contentful/ContentfulRiverBreakout'
import {ContentfulSectionIntro} from '@github-ui/swp-core/components/contentful/ContentfulSectionIntro'
import {ContentfulSubnav} from '@github-ui/swp-core/components/contentful/ContentfulSubnav'
import {ContentfulTestimonials} from '@github-ui/swp-core/components/contentful/ContentfulTestimonials'
import {isRiverBreakout} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentRiverBreakout'
import {Box, Grid, Heading, Stack, ThemeProvider} from '@primer/react-brand'

import type {F2Page} from '../../lib/types/contentful'

export type F2TemplateProps = {
  page: F2Page
}

export function F2Template({page}: F2TemplateProps) {
  const {template} = page.fields

  const shouldTrailingSectionHaveFade =
    (template.fields.testimonials === undefined || template.fields.testimonials?.length === 0) &&
    template.fields.ctaBanner.fields.hasShadow

  const subNavColorMode =
    template.fields.heroBackgroundImage?.fields.colorMode || page.fields.settings?.fields.colorMode

  const hasBackgroundImage = !!template.fields.heroBackgroundImage

  return (
    <ThemeProvider
      colorMode={page.fields.settings?.fields.colorMode ?? 'light'}
      style={{backgroundColor: 'var(--brand-color-canvas-default)'}}
    >
      {template.fields.subnav && (
        <ContentfulSubnav
          className="F2Template__SubNav"
          component={template.fields.subnav}
          data-color-mode={subNavColorMode}
          hasShadow
        />
      )}
      <Grid>
        <Grid.Column>
          <ContentfulBackgroundImage component={template.fields.heroBackgroundImage}>
            <Box
              paddingBlockStart={hasBackgroundImage ? 64 : undefined}
              paddingBlockEnd={hasBackgroundImage ? 64 : undefined}
            >
              <ContentfulHero data-hpc component={template.fields.hero} />
            </Box>
          </ContentfulBackgroundImage>
        </Grid.Column>

        {(template.fields.sectionIntro || template.fields.pillars) && (
          <Grid.Column>
            <Grid className="F2Template__IntroduceSection">
              {template.fields.sectionIntro && (
                <Grid.Column
                  span={{medium: template.fields.sectionIntro.fields.align === 'center' ? 8 : 9}}
                  start={{medium: template.fields.sectionIntro.fields.align === 'center' ? 3 : 1}}
                >
                  <Box paddingBlockStart={hasBackgroundImage ? 64 : undefined}>
                    <ContentfulSectionIntro component={template.fields.sectionIntro} fullWidth />
                  </Box>
                </Grid.Column>
              )}

              {template.fields.pillars && template.fields.pillars.length > 0 && (
                <Grid.Column>
                  <ContentfulPillars pillars={template.fields.pillars} asCards />
                </Grid.Column>
              )}
            </Grid>
          </Grid.Column>
        )}

        {template.fields.rivers.length > 0 && (
          <Grid.Column>
            <Box paddingBlockStart={48} paddingBlockEnd={80}>
              {template.fields.rivers.map(river =>
                isRiverBreakout(river) ? (
                  <ContentfulRiverBreakout component={river} key={river.sys.id} />
                ) : (
                  <ContentfulRiver component={river} key={river.sys.id} />
                ),
              )}
            </Box>
          </Grid.Column>
        )}
      </Grid>

      <Box
        backgroundColor="subtle"
        paddingBlockStart={128}
        paddingBlockEnd={128}
        style={{
          background: shouldTrailingSectionHaveFade
            ? 'linear-gradient(transparent, var(--brand-color-canvas-subtle) 20%)'
            : undefined,
        }}
      >
        <Grid className="F2Template__TrailingSection">
          {template.fields.testimonials && template.fields.testimonials.length > 0 && (
            <Grid.Column>
              <ContentfulTestimonials testimonials={template.fields.testimonials} />
            </Grid.Column>
          )}

          <Grid.Column>
            <ContentfulCtaBanner component={template.fields.ctaBanner} />
          </Grid.Column>

          {template.fields.cardsHeading && template.fields.cards && (
            <Grid.Column>
              <Stack direction="vertical" padding="none" gap={64} alignItems="center">
                <Heading as="h3" size="3">
                  {template.fields.cardsHeading}
                </Heading>

                <ContentfulCards cards={template.fields.cards} />
              </Stack>
            </Grid.Column>
          )}

          {template.fields.faq && (
            <Grid.Column>
              <ContentfulFaqGroup component={template.fields.faq} />
            </Grid.Column>
          )}
        </Grid>
      </Box>
    </ThemeProvider>
  )
}
