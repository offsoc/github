import {Bento, Link, Pillar, Stack, Timeline} from '@primer/react-brand'

export function CustomerStoryBento() {
  return (
    <>
      <Bento.Item
        columnSpan={12}
        rowSpan={{
          xsmall: 12,
          small: 12,
          medium: 6,
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
            data-analytics-visible='{"category":"enterprise customer story","label":"ref_cta:enterprise_customer_story;ref_loc:body"}'
          >
            Mercado Libre frees developers&apos; minds to focus on their mission with GitHub.
          </Bento.Heading>
          <Link
            href="/customer-stories/mercado-libre"
            variant="accent"
            size="large"
            className="mb-10 mt-3"
            data-analytics-event='{"category":"enterprise customer story","action":"click on enterprise customer story","label":"ref_cta:enterprise_customer_story;ref_loc:body"}'
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
              <Pillar.Heading size="4">~50%</Pillar.Heading>
              <Pillar.Description className="max-height-inherit">
                reduced time by writing code with GitHub Copilot
              </Pillar.Description>
            </Pillar>
            <Pillar className="flex-1 customer-story-pillar">
              <Pillar.Heading size="4">100,000</Pillar.Heading>
              <Pillar.Description>pull requests merged per day</Pillar.Description>
            </Pillar>
          </Stack>
        </Bento.Visual>
        <Bento.Visual padding={{xsmall: 'normal', medium: 'spacious'}} className="customer-story-bento-padding">
          <Timeline>
            <Timeline.Item>
              <Pillar>
                <Pillar.Heading>Problem</Pillar.Heading>
                <Pillar.Description className="enterprise-lp">
                  Mercado Libre developer platform team needed secure DevOps tooling that would allow its developers to
                  be more efficient and allow them to focus more on providing value to users.
                </Pillar.Description>
              </Pillar>
            </Timeline.Item>
            <Timeline.Item>
              <Pillar>
                <Pillar.Heading>Solution</Pillar.Heading>
                <Pillar.Description className="enterprise-lp">
                  Mercado Libre uses GitHub to automate deployment, security tests, and repetitive tasks to free
                  developers to spend more time on high-value, rewarding work.
                </Pillar.Description>
              </Pillar>
            </Timeline.Item>
            <Timeline.Item>
              <Pillar>
                <Pillar.Heading>Products</Pillar.Heading>
                <Pillar.Description className="enterprise-lp">
                  <Pillar.Link href="/enterprise">GitHub Enterprise</Pillar.Link>
                  <br />
                  <Pillar.Link href="/features/copilot">GitHub Copilot</Pillar.Link>
                  <br />
                  <Pillar.Link href="/features/security">GitHub Advanced Security</Pillar.Link>
                </Pillar.Description>
              </Pillar>
            </Timeline.Item>
          </Timeline>
        </Bento.Visual>
      </Bento.Item>
    </>
  )
}
