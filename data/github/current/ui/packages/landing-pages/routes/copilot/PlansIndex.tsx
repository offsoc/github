import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Grid, OrderedList, ThemeProvider} from '@primer/react-brand'

import {Image} from './../../components/Image/Image'

import {PricingTable} from './PricingTable'
import {PricingCards} from './PricingCards'
import {analyticsEvent} from '../../lib/analytics'

export function CopilotPlansIndex() {
  const {copilotSignupPath} = useRoutePayload<{copilotSignupPath: string}>()
  const {copilotForBusinessSignupPath} = useRoutePayload<{copilotForBusinessSignupPath: string}>()
  const {copilotContactSalesPath} = useRoutePayload<{copilotContactSalesPath: string}>()

  return (
    <>
      <ThemeProvider colorMode="dark" className="lp-Copilot">
        <section id="pricing" className="lp-Section lp-Section--pricing">
          <Image
            as="picture"
            src="/images/modules/site/copilot/pricing-gradient.jpg"
            className="position-absolute top-0 left-0 width-100 height-100"
            sources={[
              {
                srcset: '/images/modules/site/copilot/pricing-gradient-sm.jpg',
                media: '(max-width: 767px)',
              },
              {
                srcset: '/images/modules/site/copilot/pricing-gradient.jpg',
                media: '(min-width: 768px) and (max-width: 1279px)',
              },
              {
                srcset: '/images/modules/site/copilot/pricing-gradient-lg.jpg',
                media: '(min-width: 1280px)',
              },
            ]}
            alt=""
          />
          <PricingCards
            copilotSignupPath={copilotSignupPath}
            copilotForBusinessSignupPath={copilotForBusinessSignupPath}
            copilotContactSalesPath={copilotContactSalesPath}
          />
        </section>

        <section className="lp-Section pt-0">
          <PricingTable
            copilotSignupPath={copilotSignupPath}
            copilotForBusinessSignupPath={copilotForBusinessSignupPath}
            copilotContactSalesPath={copilotContactSalesPath}
          />
        </section>

        <section id="footnotes" className="lp-Section" style={{paddingTop: '0'}}>
          <Grid className="lp-Grid--noRowGap">
            <Grid.Column span={12}>
              <OrderedList>
                <OrderedList.Item className="lp-Footnotes-item">
                  <a
                    className="lp-Link--inline"
                    href="https://docs.github.com/en/enterprise-cloud@latest/authentication/authenticating-with-saml-single-sign-on/about-authentication-with-saml-single-sign-on"
                    {...analyticsEvent({
                      action: 'saml_sso',
                      tag: 'link',
                      context: 'footnote',
                      location: 'features_table',
                    })}
                  >
                    Authentication with SAML single sign-on (SSO)
                  </a>{' '}
                  available for organizations using GitHub Enterprise Cloud.
                </OrderedList.Item>
              </OrderedList>
            </Grid.Column>
          </Grid>
        </section>
      </ThemeProvider>
    </>
  )
}
