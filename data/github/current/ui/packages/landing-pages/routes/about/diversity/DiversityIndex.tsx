import {AnimationProvider, Button, CTABanner, Grid, Heading, Image, Link, River, Stack, Text} from '@primer/react-brand'
import resolveResponse from 'contentful-resolve-response'
import type {ReactNode} from 'react'

import {useRoutePayload} from '@github-ui/react-core/use-route-payload'

import {toContainerPage, toEntryCollection} from '../../../lib/types/contentful'
import {toPayload} from '../../../lib/types/payload'
import {renderPillarDescription, renderRiverText, renderSectionIntroHeading} from './utils/richText'
import {toDiversityTemplate} from './utils/template'

function FeatureItems(items: Array<{title: string; content: ReactNode}>) {
  return (
    <div className="list-box my-md-8">
      <AnimationProvider>
        <Stack
          padding={{
            narrow: 'condensed',
            regular: 'spacious',
            wide: 'spacious',
          }}
        >
          <Grid>
            {items.map(({title, content}, index) => (
              <Grid.Column key={index} span={{large: 6}}>
                <Stack key={index} animate="scale-in-up">
                  <Heading as="h3" size="6" weight="semibold">
                    {title}
                  </Heading>

                  {content}
                </Stack>
              </Grid.Column>
            ))}
          </Grid>
        </Stack>
      </AnimationProvider>
    </div>
  )
}

export function DiversityIndex() {
  const {contentfulRawJsonResponse} = toPayload(useRoutePayload<unknown>())

  const {fields} = toContainerPage(toEntryCollection(resolveResponse(contentfulRawJsonResponse)).at(0))

  const template = toDiversityTemplate(fields.template)

  const heroSection = template.fields.sections[0]
  const platformSection = template.fields.sections[1]
  const peopleSection = template.fields.sections[2]
  const philanthropySection = template.fields.sections[3]
  const policySection = template.fields.sections[4]
  const ctaSection = template.fields.sections[5]

  return (
    <div>
      <div className="color-bg-subtle py-6 py-lg-12" data-hpc>
        <Grid>
          <Grid.Column span={{large: 9}}>
            <Stack padding="none" className="py-6">
              <Heading as="h1" weight="extrabold">
                {heroSection.fields.components[0].fields.heading}
              </Heading>

              <Text variant="muted" size="400" weight="light">
                {heroSection.fields.components[0].fields.description}
              </Text>
            </Stack>
          </Grid.Column>
          <Grid.Column span={{large: 3}} className="hero-decoration-column">
            <div className="hero-decoration">
              {[
                {backgroundColor: 'var(--base-color-scale-purple-5)', top: 0, left: 0},
                {backgroundColor: 'var(--base-color-scale-yellow-1)', top: '50%', left: '20%'},
                {backgroundColor: 'var(--base-color-scale-gray-2)', bottom: 0, left: '50%'},
                {backgroundColor: 'var(--base-color-scale-pink-3)', top: '10%', left: '75%'},
                {backgroundColor: 'var(--base-color-scale-orange-2)', top: '75%', right: 0},
              ].map((style, index) => (
                <div key={index} className="color-shadow-medium" style={style} />
              ))}
            </div>
          </Grid.Column>
        </Grid>
      </div>

      <Grid>
        <Grid.Column>
          <Stack gap="spacious" padding="none">
            <AnimationProvider>
              <River imageTextRatio="60:40">
                <River.Visual>
                  <Image
                    src={platformSection.fields.components[0].fields.image?.fields.file.url ?? ''}
                    alt={
                      platformSection.fields.components[0].fields.imageAlt ??
                      platformSection.fields.components[0].fields.image?.fields.file.url ??
                      ''
                    }
                  />
                </River.Visual>
                <River.Content animate="slide-in-left">
                  <Heading as="h2" size="3" weight="extrabold">
                    {platformSection.fields.components[0].fields.heading}
                  </Heading>

                  {renderRiverText(platformSection.fields.components[0].fields.text)}
                </River.Content>
              </River>
            </AnimationProvider>

            <AnimationProvider>
              <Grid>
                <Grid.Column span={{medium: 9, large: 8, xlarge: 7}}>
                  {renderSectionIntroHeading(platformSection.fields.components[1].fields.heading, {
                    textGradient: 'text-gradient-light-purple-red',
                  })}
                </Grid.Column>
              </Grid>
            </AnimationProvider>

            {FeatureItems(
              platformSection.fields.components[2].fields.pillars.map(pillar => {
                return {
                  title: pillar.fields.heading,

                  content: renderPillarDescription(pillar.fields.description),
                }
              }),
            )}
          </Stack>

          <div className="py-md-5">
            <AnimationProvider>
              <River imageTextRatio="60:40" align="end">
                <River.Visual>
                  <Image
                    src={peopleSection.fields.components[0].fields.image?.fields.file.url ?? ''}
                    alt={
                      peopleSection.fields.components[0].fields.imageAlt ??
                      peopleSection.fields.components[0].fields.image?.fields.file.url ??
                      ''
                    }
                  />
                </River.Visual>
                <River.Content animate="slide-in-right">
                  <Heading as="h2" size="3" weight="extrabold">
                    {peopleSection.fields.components[0].fields.heading}
                  </Heading>

                  {renderRiverText(peopleSection.fields.components[0].fields.text)}

                  <Link
                    href={peopleSection.fields.components[0].fields.callToAction?.fields.href}
                    className="no-underline"
                  >
                    {peopleSection.fields.components[0].fields.callToAction?.fields.text}
                  </Link>
                </River.Content>
              </River>
            </AnimationProvider>

            <div className="py-6">
              <AnimationProvider>
                <Grid>
                  <Grid.Column span={{medium: 9, large: 8, xlarge: 7}}>
                    {renderSectionIntroHeading(peopleSection.fields.components[1].fields.heading, {
                      textGradient: 'text-gradient-light-pink-blue',
                    })}
                  </Grid.Column>
                </Grid>
              </AnimationProvider>
            </div>

            {FeatureItems(
              peopleSection.fields.components[2].fields.pillars.map(pillar => {
                return {
                  title: pillar.fields.heading,

                  content: renderPillarDescription(pillar.fields.description),
                }
              }),
            )}
          </div>

          <div className="py-md-5">
            <AnimationProvider>
              <River imageTextRatio="60:40">
                <River.Visual>
                  <Image
                    src={philanthropySection.fields.components[0].fields.image?.fields.file.url ?? ''}
                    alt={
                      philanthropySection.fields.components[0].fields.imageAlt ??
                      philanthropySection.fields.components[0].fields.image?.fields.file.url ??
                      ''
                    }
                  />
                </River.Visual>
                <River.Content animate="slide-in-right">
                  <Heading as="h2" size="3" weight="extrabold">
                    {philanthropySection.fields.components[0].fields.heading}
                  </Heading>

                  {renderRiverText(philanthropySection.fields.components[0].fields.text)}

                  <Link
                    href={philanthropySection.fields.components[0].fields.callToAction?.fields.href}
                    className="no-underline"
                  >
                    {philanthropySection.fields.components[0].fields.callToAction?.fields.text}
                  </Link>
                </River.Content>
              </River>
            </AnimationProvider>

            {FeatureItems(
              philanthropySection.fields.components[1].fields.pillars.map(pillar => {
                return {
                  title: pillar.fields.heading,

                  content: renderPillarDescription(pillar.fields.description),
                }
              }),
            )}
          </div>

          <div className="py-md-5">
            <AnimationProvider>
              <River imageTextRatio="60:40" align="end">
                <River.Visual>
                  <Image
                    src={policySection.fields.components[0].fields.image?.fields.file.url ?? ''}
                    alt={
                      policySection.fields.components[0].fields.imageAlt ??
                      policySection.fields.components[0].fields.image?.fields.file.url ??
                      ''
                    }
                  />
                </River.Visual>
                <River.Content animate="slide-in-left">
                  <Heading as="h2" size="3" weight="extrabold">
                    {policySection.fields.components[0].fields.heading}
                  </Heading>

                  {renderRiverText(policySection.fields.components[0].fields.text)}

                  <Link
                    href={policySection.fields.components[0].fields.callToAction?.fields.href}
                    className="no-underline"
                  >
                    {policySection.fields.components[0].fields.callToAction?.fields.text}
                  </Link>
                </River.Content>
              </River>
            </AnimationProvider>

            {FeatureItems(
              policySection.fields.components[1].fields.pillars.map(pillar => {
                return {
                  title: pillar.fields.heading,

                  content: renderPillarDescription(pillar.fields.description),
                }
              }),
            )}
          </div>

          <div className="my-10">
            <Stack padding="none" gap="spacious">
              <CTABanner align="center" className="width-full">
                <CTABanner.Heading size="3" weight="extrabold">
                  {ctaSection.fields.components[0].fields.heading}
                </CTABanner.Heading>

                <CTABanner.ButtonGroup>
                  <Button
                    as="a"
                    href={ctaSection.fields.components[0].fields.callToActionPrimary.fields.href}
                    className="no-underline"
                    size="large"
                    {...{
                      'data-analytics-event': JSON.stringify({
                        category: 'Get Copilot for Business',
                        action: 'click to Get Copilot for Business',
                        label: 'ref_cta:Get Copilot for Business;',
                      }),
                    }}
                  >
                    {ctaSection.fields.components[0].fields.callToActionPrimary.fields.text}
                  </Button>
                </CTABanner.ButtonGroup>
              </CTABanner>
            </Stack>
          </div>
        </Grid.Column>
      </Grid>
    </div>
  )
}
