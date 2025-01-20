import {XIcon, CheckIcon, ChevronDownIcon} from '@primer/octicons-react'
import {Box, Button, Grid, Heading, Stack, Text} from '@primer/react-brand'
import {allFeatures} from './PricingData'
import type {Feature, FeatureGroup} from './PricingData'
import {analyticsEvent} from '../../lib/analytics'
import {useState} from 'react'

interface PricingTableProps {
  copilotSignupPath: string
  copilotForBusinessSignupPath: string
  copilotContactSalesPath: string
}

export function PricingTable({
  copilotSignupPath,
  copilotForBusinessSignupPath,
  copilotContactSalesPath,
}: PricingTableProps) {
  const copilotEnterpriseContactSalesPath = `${copilotContactSalesPath}&utm_content=CopilotEnterprise`
  const [expandedStates, setExpandedStates] = useState<{[key: string]: boolean}>({})

  const isDetailsExpanded = (id: string) => {
    return expandedStates[id]
  }

  const toggleDetailsExpanded = (e: React.MouseEvent<HTMLElement>) => {
    const id = (e.target as HTMLElement).getAttribute('data-target-id')
    if (!id) return
    setExpandedStates(prev => ({...prev, [id]: !prev[id]}))
  }

  return (
    <div>
      <Grid className="lp-Section-container--centerUntilMedium lp-Grid--noRowGap js-toggler-container">
        <Grid.Column span={12}>
          <div className="">
            <Stack
              direction="horizontal"
              gap={32}
              padding="none"
              className="border-bottom pb-4 mb-4 mb-md-0 lp-Pricing-table-header z-3 top-0"
            >
              <Box className="flex-1 col-12 col-md-3">
                <Text size="500">Compare features</Text>
              </Box>
              <Stack direction="horizontal" gap={32} padding="none" className="col-1 col-md-7">
                {/* Copilot Individual */}
                <Stack padding="none" gap={12} className="col-4 text-center px-4 px-md-0 d-none d-md-flex">
                  <Box>
                    <Heading as="h3" size="6">
                      Individual
                    </Heading>
                  </Box>

                  <Stack
                    direction="horizontal"
                    gap={8}
                    padding="none"
                    className="lp-Pricing-price flex-justify-center flex-items-center mt-n2"
                  >
                    <Text size="100" weight="normal" style={{lineHeight: 1.4}} className="is-sansSerifAlt">
                      $
                    </Text>
                    <Text size="500" weight="normal" className="is-sansSerifAlt">
                      10
                    </Text>
                    <Stack direction="vertical" gap="none" className="text-left" padding="none">
                      <Text weight="normal" variant="muted" className="f6-mktg">
                        per user
                      </Text>
                      <Text weight="normal" variant="muted" className="f6-mktg mt-n1">
                        per month
                      </Text>
                    </Stack>
                  </Stack>
                </Stack>

                {/* Copilot Business */}
                <Stack padding="none" gap={12} className="col-4 text-center px-4 px-md-0 d-none d-md-flex">
                  <Box>
                    <Heading as="h3" size="6">
                      Business
                    </Heading>
                  </Box>

                  <Stack
                    direction="horizontal"
                    gap={8}
                    padding="none"
                    className="lp-Pricing-price flex-justify-center flex-items-center mt-n2"
                  >
                    <Text size="100" weight="normal" style={{lineHeight: 1.4}} className="is-sansSerifAlt">
                      $
                    </Text>
                    <Text size="500" weight="normal" className="is-sansSerifAlt">
                      19
                    </Text>
                    <Stack direction="vertical" gap="none" className="text-left" padding="none">
                      <Text weight="normal" variant="muted" className="f6-mktg">
                        per user
                      </Text>
                      <Text weight="normal" variant="muted" className="f6-mktg mt-n1">
                        per month
                      </Text>
                    </Stack>
                  </Stack>
                </Stack>

                {/* Copilot Enterprise */}
                <Stack padding="none" gap={12} className="col-4 text-center px-4 px-md-0 d-none d-md-flex">
                  <Box>
                    <Heading as="h3" size="6">
                      Enterprise
                    </Heading>
                  </Box>

                  <Stack
                    direction="horizontal"
                    gap={8}
                    padding="none"
                    className="lp-Pricing-price flex-justify-center flex-items-center mt-n2"
                  >
                    <Text size="100" weight="normal" style={{lineHeight: 1.4}} className="is-sansSerifAlt">
                      $
                    </Text>
                    <Text size="500" weight="normal" className="is-sansSerifAlt">
                      39
                    </Text>
                    <Stack direction="vertical" gap="none" className="text-left" padding="none">
                      <Text weight="normal" variant="muted" className="f6-mktg">
                        per user
                      </Text>
                      <Text weight="normal" variant="muted" className="f6-mktg mt-n1">
                        per month
                      </Text>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>

            <Stack direction="vertical" gap={32} padding="none">
              {allFeatures.map((group: FeatureGroup, i) => (
                <Stack direction="vertical" gap="none" padding="none" key={i}>
                  <div className="text-semibold border-bottom mt-0 mt-md-5 pb-4 pb-md-3 d-none d-md-block">
                    <Text size="300" weight="normal">
                      {group.title}
                      <div className="lp-Pricing-features-icon position-absolute top-0 right-0 d-md-none">
                        <ChevronDownIcon />
                      </div>
                    </Text>
                  </div>
                  <button
                    type="button"
                    aria-expanded={isDetailsExpanded(group.title.replace(/\s+/g, '-').toLowerCase())}
                    data-target-id={group.title.replace(/\s+/g, '-').toLowerCase()}
                    className="position-relative text-semibold lp-Pricing-features-toggle-btn border-bottom mt-0 mt-md-5 pb-4 pb-md-3 d-md-none"
                    onClick={toggleDetailsExpanded}
                    {...analyticsEvent({
                      action: `expand_${group.title.replace(/\s+/g, '_').toLowerCase()}`,
                      tag: 'icon',
                      location: 'compare_features',
                      context: 'mobile',
                    })}
                  >
                    <Text size="300" weight="normal">
                      {group.title}
                      <div className="lp-Pricing-features-icon position-absolute top-0 right-0 d-md-none">
                        <ChevronDownIcon />
                      </div>
                    </Text>
                  </button>

                  <div className="lp-Pricing-features-box">
                    {group.features.map((feature: Feature, j) => (
                      <Stack
                        key={j}
                        direction={{narrow: 'vertical', regular: 'horizontal'}}
                        gap={{narrow: 16, regular: 32}}
                        padding="none"
                        className="border-bottom py-4 py-md-3"
                      >
                        <Box className="flex-1 col-12 col-md-3">
                          <Text size="200" weight="normal" className="color-fg-muted">
                            {feature.title}
                          </Text>
                        </Box>
                        <Stack
                          direction="horizontal"
                          gap={{narrow: 16, regular: 32}}
                          padding="none"
                          className="col-12 col-md-7"
                        >
                          <Box
                            className={`col-4 text-center rounded-2 p-3 pt-4 p-md-0 pt-md-0 lp-pricing-table-icon-box ${
                              feature['individual'] ? 'lp-Pricing-table-check' : 'lp-Pricing-table-x'
                            }`}
                          >
                            {feature['individual'] ? <CheckIcon /> : <XIcon />}
                            <Text size="100" className="pt-3 d-block d-md-none">
                              Individual
                            </Text>
                          </Box>
                          <Box
                            className={`col-4 text-center rounded-2 p-3 pt-4 p-md-0 pt-md-0 lp-pricing-table-icon-box ${
                              feature['business'] ? 'lp-Pricing-table-check' : 'lp-Pricing-table-x'
                            }`}
                          >
                            {feature['business'] ? <CheckIcon /> : <XIcon />}
                            <Text size="100" className="pt-3 d-block d-md-none">
                              Business
                            </Text>
                          </Box>
                          <Box
                            key={j}
                            className={`col-4 text-center rounded-2 p-3 pt-4 p-md-0 pt-md-0 lp-pricing-table-icon-box ${
                              feature['enterprise'] ? 'lp-Pricing-table-check' : 'lp-Pricing-table-x'
                            }`}
                          >
                            {feature['enterprise'] ? <CheckIcon /> : <XIcon />}
                            <Text size="100" className="pt-3 d-block d-md-none">
                              Enterprise
                            </Text>
                          </Box>
                        </Stack>
                      </Stack>
                    ))}
                  </div>
                </Stack>
              ))}
            </Stack>
          </div>

          <Stack direction="vertical" gap={32} padding="none">
            <Stack direction="horizontal" gap={32} padding="none" className="d-none d-lg-flex pt-4">
              <Box className="flex-1 col-3" />
              <Stack direction="horizontal" gap={32} padding="none" className="col-12 col-md-7">
                {/* Copilot Individual */}
                <Stack padding="none" gap={12} className="col-4 text-center px-4 px-md-0">
                  <Stack direction={{narrow: 'vertical', wide: 'vertical'}} gap={12} padding="none">
                    <Button
                      size="small"
                      className="lp-small-button"
                      as="a"
                      href={copilotSignupPath}
                      block
                      variant="primary"
                      {...analyticsEvent({
                        action: 'start_trial',
                        tag: 'button',
                        context: 'individual_plan',
                        location: 'features_table',
                      })}
                    >
                      Start a free trial
                    </Button>
                  </Stack>
                </Stack>

                {/* Copilot Business */}
                <Stack padding="none" gap={12} className="col-4 text-center pb-1 pb-md-9 px-4 px-md-0">
                  <Stack direction={{narrow: 'vertical', wide: 'vertical'}} gap={12} padding="none">
                    <Button
                      size="small"
                      className="lp-small-button"
                      as="a"
                      href={copilotForBusinessSignupPath}
                      block
                      variant="primary"
                      {...analyticsEvent({
                        action: 'buy_now',
                        tag: 'button',
                        context: 'business_plan',
                        location: 'features_table',
                      })}
                    >
                      Buy now
                    </Button>
                  </Stack>
                </Stack>

                {/* Copilot Enterprise */}
                <Stack padding="none" gap={12} className="col-4 text-center pb-6 pb-md-9 px-4 px-md-0">
                  <Stack direction={{narrow: 'vertical', wide: 'vertical'}} gap={12} padding="none">
                    <Button
                      size="small"
                      className="lp-small-button"
                      as="a"
                      href={copilotEnterpriseContactSalesPath}
                      variant="primary"
                      {...analyticsEvent({
                        action: 'contact_sales',
                        tag: 'button',
                        context: 'enterprise_plan',
                        location: 'features_table',
                      })}
                    >
                      Contact sales
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </Stack>

          <div className="position-relative">
            <img
              className="width-full position-absolute events-none lp-help-glow"
              src="/images/modules/site/copilot/glow-help.webp"
              loading="lazy"
              alt=""
            />

            <Stack
              direction="vertical"
              className="lp-Pricing-item has-BlurredBg has-GradientBorder text-center mt-8 mb-12"
            >
              <Text size="500">Need human help?</Text>
              <Text size="300" weight="normal" variant="muted">
                Let’s define how to propel your team into a new era.
              </Text>
              <Box marginBlockStart={16}>
                <Button
                  as="a"
                  href={copilotContactSalesPath}
                  variant="secondary"
                  {...analyticsEvent({
                    action: 'contact_sales',
                    tag: 'button',
                    context: 'need_help',
                    location: 'features_table',
                  })}
                >
                  Contact sales
                </Button>
              </Box>
            </Stack>
          </div>
        </Grid.Column>
      </Grid>
    </div>
  )
}
