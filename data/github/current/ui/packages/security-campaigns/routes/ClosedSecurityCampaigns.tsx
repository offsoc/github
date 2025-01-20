import {ListView} from '@github-ui/list-view'
import {ListViewMetadata} from '@github-ui/list-view/ListViewMetadata'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Box, Heading, Text} from '@primer/react'
import pluralize from 'pluralize'
import {RowsLoading} from '../components/RowsLoading'
import {PrevNextPagination} from '../components/PrevNextPagination'

export interface ClosedSecurityCampaignsPayload {
  // The total number of closed campaigns in this org
  closedCampaignsCounts: number
}

export const ClosedSecurityCampaigns = () => {
  const payload = useRoutePayload<ClosedSecurityCampaignsPayload>()

  return (
    <>
      <Heading data-hpc as="h2">
        Closed campaigns
      </Heading>
      <Text as="p" sx={{color: 'fg.muted'}}>
        Campaigns that have been closed and paused, but they can still be re-opened.
      </Text>

      <hr />

      <Box sx={{borderWidth: 1, borderStyle: 'solid', borderRadius: 2, borderColor: 'border.default', mb: 3}}>
        <ListView
          metadata={
            <ListViewMetadata
              className="rounded-top-2"
              title={
                <Text sx={{fontWeight: 'bold'}}>{pluralize('campaign', payload.closedCampaignsCounts, true)}</Text>
              }
            />
          }
          title="Closed campaigns"
          titleHeaderTag="h3"
          totalCount={payload.closedCampaignsCounts}
        >
          <RowsLoading rowCount={5} />
        </ListView>
      </Box>

      <PrevNextPagination onCursorChange={() => undefined} prevCursor={undefined} nextCursor={undefined} />
    </>
  )
}
