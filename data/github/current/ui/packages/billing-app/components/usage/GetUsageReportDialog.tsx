import type React from 'react'
import {useState, useRef, Fragment} from 'react'

import type {PropsWithChildren} from 'react'
import {Text, Box, Button, RadioGroup, Radio, FormControl, Flash} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'

import {USAGE_REPORT_HOURLY_PERIOD, USAGE_REPORT_LEGACY_REPORT} from '../../constants'
import useRoute from '../../hooks/use-route'
import {doRequest, HTTPMethod} from '../../hooks/use-request'
import {USAGE_REPORT_ROUTE} from '../../routes'

import type {UsageReportSelection, UsageReportRequest} from '../../types/usage'

interface Props {
  usageReportSelections: UsageReportSelection[]
  currentUserEmail: string
  billingPlatformEnabledProducts: string[]
  disableUsageReports?: boolean
  vnextMigrationDate?: string
}

export default function GetUsageReportDialog({
  usageReportSelections,
  currentUserEmail,
  billingPlatformEnabledProducts,
  disableUsageReports = false,
  vnextMigrationDate,
}: Props) {
  const {path: requestUsageReportRoute} = useRoute(USAGE_REPORT_ROUTE)
  const [usageReportPeriod, setUsageReportPeriod] = useState<number>(USAGE_REPORT_HOURLY_PERIOD)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const returnFocusRef = useRef(null)
  const {addToast} = useToastContext()

  const handleSubmit = async (e: React.FormEvent<EventTarget>) => {
    e.preventDefault()

    try {
      const {ok, data} = await doRequest<UsageReportRequest>(HTTPMethod.POST, requestUsageReportRoute, {
        period: usageReportPeriod,
      })

      if (!ok) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: data.error ?? 'There was an issue sending your usage report request',
          role: 'alert',
        })
      } else {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'success',
          message: `We're preparing your usage report. We'll send an email to ${currentUserEmail} when it's ready.`,
          role: 'status',
        })
      }
    } catch (error) {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: 'There was an issue sending your usage report request',
        role: 'alert',
      })
    } finally {
      setIsDialogOpen(false)
    }
  }

  const handleRadioGroupChange = (
    selectedValue: string | null,
    _e?: React.ChangeEvent<HTMLInputElement> | undefined,
  ) => {
    setUsageReportPeriod(Number(selectedValue))
  }

  /* Builds the text to list the products that the usage report will contain */
  const enabledProductListText = (): string => {
    if (billingPlatformEnabledProducts.length <= 1) return billingPlatformEnabledProducts[0] ?? ''

    const lastTwoProducts = billingPlatformEnabledProducts.slice(-2)
    const remainingProducts = billingPlatformEnabledProducts.slice(0, -2)
    const lastTwoText = `${lastTwoProducts[0]} and ${lastTwoProducts[1]}`

    if (billingPlatformEnabledProducts.length > 2) {
      return `${remainingProducts.join(', ')}, ${lastTwoText}`
    } else {
      return lastTwoText
    }
  }

  return (
    <Box onSubmit={handleSubmit} sx={{pt: [2, 0]}} data-testid="usage-report-dialog-container">
      <Button onClick={() => setIsDialogOpen(true)} sx={{width: ['100%', 'auto']}}>
        Get usage report
      </Button>
      {isDialogOpen && (
        <Dialog
          onClose={() => setIsDialogOpen(false)}
          title="Get usage report"
          returnFocusRef={returnFocusRef}
          aria-labelledby="header"
          sx={{overflowY: 'auto'}}
        >
          {disableUsageReports && (
            <Flash
              data-testid="disable-usage-report-banner"
              variant="warning"
              sx={{display: 'flex', alignItems: 'center'}}
            >
              <span>
                Usage reports are temporarily disabled due to planned maintenance. Please try again later or reach out
                to support for assistance.
              </span>
            </Flash>
          )}

          <form>
            <Box sx={{px: 3, pt: 3}}>
              <span id="radio-header">Select time period:</span>

              <Box sx={{gap: 3, display: 'flex', flexDirection: 'column', pt: 3}}>
                <RadioGroup name="reportChoiceGroup" onChange={handleRadioGroupChange} aria-labelledby="radio-header">
                  {usageReportSelections.map(selection => {
                    const sharedProps = {
                      value: `${selection.type}`,
                      defaultChecked: selection.type === usageReportPeriod,
                      displayText: selection.displayText,
                    }
                    return selection.type !== USAGE_REPORT_LEGACY_REPORT ? (
                      <ReportControl
                        {...sharedProps}
                        dateText={selection.dateText}
                        key={selection.type}
                        legacySelection={false}
                      />
                    ) : (
                      <Fragment key={selection.type}>
                        <Box as="hr" sx={{margin: 0}} />
                        <LegacyReportControl
                          {...sharedProps}
                          vnextMigrationDate={vnextMigrationDate}
                          legacySelection={true}
                        />
                      </Fragment>
                    )
                  })}
                </RadioGroup>
              </Box>
              <hr />

              {usageReportPeriod !== USAGE_REPORT_LEGACY_REPORT && (
                <span>
                  A detailed report will be generated including usage for{' '}
                  <Text sx={{fontWeight: 'bold'}} data-testid="usage-report-enabled-products-text">
                    {enabledProductListText()}
                  </Text>
                  .
                </span>
              )}

              <Box sx={{pt: 2}}>
                <span>
                  We will email you at <Text sx={{fontWeight: 'bold'}}>{currentUserEmail}</Text> once the report is
                  ready for download.
                </span>
              </Box>
              {usageReportPeriod !== USAGE_REPORT_LEGACY_REPORT && (
                <Box sx={{pt: 2}}>
                  <span>
                    Please note that updates to organization name, repository name, and username fields may take up to
                    24 hours. For the most current report, request your usage report again after this period.
                  </span>
                </Box>
              )}

              <Box sx={{py: 3}}>
                <Button
                  type="submit"
                  variant="primary"
                  sx={{width: '100%'}}
                  onClick={handleSubmit}
                  disabled={disableUsageReports}
                >
                  Email usage report
                </Button>
              </Box>
            </Box>
          </form>
        </Dialog>
      )}
    </Box>
  )
}

type SharedProps = {value: string; defaultChecked?: boolean; displayText: string; legacySelection: boolean}

function MyControl({
  children,
  value,
  defaultChecked,
  displayText,
  legacySelection = false,
}: PropsWithChildren<SharedProps>) {
  return (
    <FormControl>
      <Radio
        value={value}
        defaultChecked={defaultChecked}
        data-testid={`report-control-id-${legacySelection ? 'legacy' : 'non-legacy'}`}
      />
      <FormControl.Label sx={{fontWeight: 'normal'}}>
        {displayText} <Text sx={{color: 'fg.muted', fontSize: 'small'}}>{children}</Text>
      </FormControl.Label>
    </FormControl>
  )
}

function ReportControl({dateText, ...rest}: SharedProps & {dateText: string}) {
  return <MyControl {...rest}>({dateText})</MyControl>
}

function LegacyReportControl({vnextMigrationDate, ...rest}: SharedProps & {vnextMigrationDate?: string}) {
  return (
    <MyControl {...rest}>
      <br /> Your enterprise account has transitioned to the enhanced billing platform on {vnextMigrationDate}.
      Selecting this option will generate a usage report for all available days prior to {vnextMigrationDate}.
    </MyControl>
  )
}
