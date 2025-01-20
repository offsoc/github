import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {BriefcaseIcon} from '@primer/octicons-react'
import {Box, Heading, LinkButton, Octicon, Text, UnderlineNav} from '@primer/react'
import {useContext, useState} from 'react'

import {PageContext} from '../App'
import CostCentersTable from '../components/cost_centers/CostCentersTable'
import CostCenterBanner from '../components/cost_centers/CostCenterBanner'
import Layout from '../components/Layout'
import useRoute from '../hooks/use-route'
import {NEW_COST_CENTER_ROUTE} from '../routes'
import {Fonts, Spacing, boxStyle, pageHeadingStyle} from '../utils/style'
import type {GetAllCostCentersResponse} from '../types/cost-centers'

export enum CostCenterTabs {
  Active = 'active',
  Deleted = 'deleted',
}

export function CostCentersPage() {
  const payload = useRoutePayload<GetAllCostCentersResponse>()
  const {activeCostCenters, archivedCostCenters, hasUserScopedCostCenters} = payload
  const [selectedTab, setSeletedTab] = useState<CostCenterTabs>(CostCenterTabs.Active)
  const isStafftoolsRoute = useContext(PageContext).isStafftoolsRoute
  const {path: newCostCenterUrl} = useRoute(NEW_COST_CENTER_ROUTE)

  const anyCostCenters = activeCostCenters.length || archivedCostCenters.length

  return (
    <Layout>
      <header className="Subhead">
        <Heading as="h2" className="Subhead-heading" sx={pageHeadingStyle}>
          Cost centers
        </Heading>

        {anyCostCenters && !isStafftoolsRoute && (
          <LinkButton href={newCostCenterUrl} underline={false}>
            <Text sx={{fontWeight: 'normal'}}>New cost center</Text>
          </LinkButton>
        )}
      </header>
      <CostCenterBanner />
      {anyCostCenters || isStafftoolsRoute ? (
        <div>
          {!isStafftoolsRoute && (
            <UnderlineNav aria-label="Cost centers selector" sx={{pl: 0, mb: 3}}>
              <UnderlineNav.Item
                aria-current={selectedTab === CostCenterTabs.Active ? 'page' : undefined}
                onSelect={e => {
                  e.preventDefault()
                  setSeletedTab(CostCenterTabs.Active)
                }}
                key={'active-cost-centers-tab'}
                data-testid={'active-cost-centers-tab'}
              >
                Active
              </UnderlineNav.Item>
              <UnderlineNav.Item
                aria-current={selectedTab === CostCenterTabs.Deleted ? 'page' : undefined}
                onSelect={e => {
                  e.preventDefault()
                  setSeletedTab(CostCenterTabs.Deleted)
                }}
                key={'deleted-cost-centers-tab'}
                data-testid={'deleted-cost-centers-tab'}
              >
                Deleted
              </UnderlineNav.Item>
            </UnderlineNav>
          )}
          {selectedTab === CostCenterTabs.Active && (
            <CostCentersTable
              costCenters={activeCostCenters}
              selectedTab={selectedTab}
              hasUserScopedCostCenters={hasUserScopedCostCenters}
            />
          )}
          {selectedTab === CostCenterTabs.Deleted && (
            <CostCentersTable
              costCenters={archivedCostCenters}
              selectedTab={selectedTab}
              hasUserScopedCostCenters={hasUserScopedCostCenters}
            />
          )}
        </div>
      ) : (
        <Box
          sx={{
            ...boxStyle,
            padding: Spacing.StandardPadding * 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Box sx={{mb: Spacing.StandardPadding}}>
            <Octicon icon={BriefcaseIcon} size={24} />
          </Box>
          <Box
            sx={{width: 600, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}
          >
            <Heading as="h3" sx={{mb: 1, fontSize: Fonts.SectionHeadingFontSize}}>
              No cost centers created
            </Heading>
            <Text as="p" sx={{mb: Spacing.CardMargin, color: 'fg.muted', textAlign: 'center'}}>
              Create cost centers to track spending and bill separately for a group of organizations and repositories
              within your enterprise.
            </Text>
          </Box>
          <LinkButton href={newCostCenterUrl} variant="primary">
            New Cost Center
          </LinkButton>
        </Box>
      )}
    </Layout>
  )
}
