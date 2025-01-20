import {Bento, Link, Pillar, Stack, Timeline} from '@primer/react-brand'
import {analyticsEvent} from '../../lib/analytics'

export function CustomerStoryBento() {
  return (
    <>
      <Bento.Item
        columnSpan={12}
        rowSpan={{
          xsmall: 12,
          small: 12,
          medium: 7,
        }}
        flow={{
          xsmall: 'row',
          small: 'row',
          medium: 'column',
        }}
        style={{background: 'var(--base-color-scale-black-0)', gridGap: 0}}
      >
        <Bento.Visual padding={{xsmall: 'normal', medium: 'spacious'}} className="d-block customer-story-bento-padding">
          <Bento.Heading
            as="h3"
            size="4"
            weight="semibold"
            data-analytics-visible='{"category":"copilot customer story","label":"ref_cta:copilot_customer_story;ref_loc:body"}'
          >
            Duolingo empowers its engineers to be force multipliers for expertise with GitHub Copilot, Codespaces.
          </Bento.Heading>
          <Link
            href="https://github.com/customer-stories/duolingo"
            variant="accent"
            size="large"
            className="mb-10 mt-3"
            {...analyticsEvent({action: 'story', tag: 'link', context: 'duolingo_bento', location: 'enterprise_ready'})}
          >
            Read customer story
          </Link>
          <Stack
            direction="horizontal"
            alignItems="flex-start"
            justifyContent="flex-start"
            gap="normal"
            style={{minHeight: '10em', maxHeight: '12.5em', paddingLeft: '0', paddingRight: '0'}}
          >
            <Pillar className="flex-1 customer-story-pillar">
              <Pillar.Heading size="4">~25%</Pillar.Heading>
              <Pillar.Description className="max-height-inherit">
                increase in developer speed with GitHub Copilot
              </Pillar.Description>
            </Pillar>
            <Pillar className="flex-1 customer-story-pillar">
              <Pillar.Heading size="4">1m</Pillar.Heading>
              <Pillar.Description>set-up time for largest repo with Codespaces</Pillar.Description>
            </Pillar>
          </Stack>
        </Bento.Visual>
        <Bento.Visual padding={{xsmall: 'normal', medium: 'spacious'}} className="customer-story-bento-padding">
          <Timeline>
            <Timeline.Item>
              <Pillar>
                <Pillar.Heading>Problem</Pillar.Heading>
                <Pillar.Description className="enterprise-lp">
                  Inconsistent standards and workflows limited developer mobility and efficiency, limiting Duolingo’s
                  ability to expand its content and deliver on its core mission.
                </Pillar.Description>
              </Pillar>
            </Timeline.Item>
            <Timeline.Item>
              <Pillar>
                <Pillar.Heading>Solution</Pillar.Heading>
                <Pillar.Description className="enterprise-lp">
                  GitHub Copilot, Codespaces, and custom API integrations enforce code consistency, accelerate developer
                  speed, and remove the barriers to using engineering as a force multiplier for expertise.
                </Pillar.Description>
              </Pillar>
            </Timeline.Item>
            <Timeline.Item>
              <Pillar>
                <Pillar.Heading>Products</Pillar.Heading>
                <Pillar.Description className="enterprise-lp">
                  <Pillar.Link
                    href="/enterprise"
                    {...analyticsEvent({
                      action: 'enterprise',
                      tag: 'link',
                      context: 'duolingo_bento',
                      location: 'enterprise_ready',
                    })}
                  >
                    GitHub Enterprise
                  </Pillar.Link>
                  <br />
                  <Pillar.Link
                    href="/features/codespaces"
                    {...analyticsEvent({
                      action: 'codespaces',
                      tag: 'link',
                      context: 'duolingo_bento',
                      location: 'enterprise_ready',
                    })}
                  >
                    GitHub Codespaces
                  </Pillar.Link>
                  <br />
                  <Pillar.Description>GitHub Copilot</Pillar.Description>
                </Pillar.Description>
              </Pillar>
            </Timeline.Item>
          </Timeline>
        </Bento.Visual>
      </Bento.Item>
    </>
  )
}
