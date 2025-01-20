import {DatePicker} from '@github-ui/date-picker'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {SmileyIcon} from '@primer/octicons-react'
import {Box, Heading, Spinner} from '@primer/react'
import {Blankslate} from '@primer/react/drafts'
import {useState} from 'react'

import AzureEmissionTable from '../../components/azure_emissions/AzureEmissionTable'
import Layout from '../../components/Layout'
import {RequestState} from '../../enums'
import useAzureEmissions from '../../hooks/azure_emissions/use-azure-emissions'
import {pageHeadingStyle} from '../../utils'

import type {AzureEmission, EmissionDate} from '../../types/azure-emissions'

export interface AzureEmissionPayload {
  slug: string
  azureEmissions: AzureEmission[]
}

export function AzureEmissionPage() {
  const payload = useRoutePayload<AzureEmissionPayload>()
  const currentTime = new Date()
  const [currentDate, setCurrentDate] = useState<EmissionDate>({
    year: currentTime.getFullYear(),
    month: currentTime.getMonth() + 1,
    day: currentTime.getDay(),
  })
  const {azureEmissions, requestState} = useAzureEmissions({enterpriseSlug: payload.slug, emissionDate: currentDate})

  return (
    <Layout>
      <header className="Subhead">
        <Heading as="h2" className="Subhead-heading" sx={pageHeadingStyle}>
          Azure Emissions
        </Heading>
      </header>
      <div>
        Choose a usage date to see the emissions for that date. This tool captures the emission record in
        billing-platform and the record in Azure Storage Table.
      </div>
      <Box sx={{mt: 4, mb: 4}}>
        <DatePicker
          variant="single"
          onChange={selection => {
            if (selection) {
              selection = new Date(selection)
              const emissionDate: EmissionDate = {
                year: selection.getFullYear(),
                month: selection.getMonth() + 1,
                day: selection.getDate(),
              }
              setCurrentDate(emissionDate)
            }
          }}
          value={null}
          placeholder="Choose a Usage Date"
        />
      </Box>
      {azureEmissions.length > 0 && <AzureEmissionTable azureEmissions={azureEmissions} />}
      {requestState === RequestState.LOADING && <Spinner />}
      {azureEmissions.length === 0 && requestState === RequestState.IDLE && (
        <div data-testid={'blankslate-container'}>
          <Blankslate>
            <Blankslate.Visual>
              <SmileyIcon size={36} />
            </Blankslate.Visual>
            <Blankslate.Heading>Customer has no Azure Emissions for this date.</Blankslate.Heading>
            <Blankslate.Description>Please try selecting another date to find emissions</Blankslate.Description>
          </Blankslate>
        </div>
      )}
    </Layout>
  )
}
