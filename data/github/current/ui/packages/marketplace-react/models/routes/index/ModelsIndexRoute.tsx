import styles from '../../../marketplace.module.css'

import {useRoutePayload} from '@github-ui/react-core/use-route-payload'

import type {IndexModelsPayload} from '../../../types'

import {Label, Link, PageLayout} from '@primer/react'
import MarketplaceHeader from '../../../components/MarketplaceHeader'
import MarketplaceNavigation from '../../../components/MarketplaceNavigation'
import ModelItem from './components/ModelItem'
import {CallToActionItem} from '../../../components/CallToActionItem'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import ModelsIndexFilters from '../../../components/models/ModelsIndexFilters'

export function ModelsIndexRoute() {
  const payload = useRoutePayload<IndexModelsPayload>()
  const projectNeutronPlaygroundEnabled = useFeatureFlag('project_neutron_playground')
  const searchFiltersFeatureFlag = useFeatureFlag('project_neutron_filtering')

  return (
    <>
      <MarketplaceHeader />
      <PageLayout>
        <PageLayout.Pane position="start">
          <MarketplaceNavigation categories={payload.categories} />
        </PageLayout.Pane>
        <PageLayout.Content as="div">
          <div className="d-flex flex-column flex-sm-row flex-justify-between flex-wrap gap-2 mb-4">
            <div>
              <h2 className="f2 lh-condensed">Models</h2>
              <p className="fgColor-muted mb-0">
                Try, test, and deploy from a wide range of model types, sizes, and specializations.{' '}
                <Link inline href="https://docs.github.com/github-models/prototyping-with-ai-models">
                  Learn more
                </Link>
                .
              </p>
            </div>
            <div className="d-flex flex-items-center gap-2">
              <Label variant="success">Beta</Label>
              <Link href="https://gh.io/models-feedback">Give feedback</Link>
            </div>
          </div>

          {searchFiltersFeatureFlag && <ModelsIndexFilters />}

          <div className={`mt-4 ${styles['marketplace-list-grid']}`}>
            {/* We should only render the CTA when someone is NOT on the waitlist AND they do NOT have access to the playground */}
            {!payload.on_waitlist && !projectNeutronPlaygroundEnabled && <CallToActionItem />}
            {payload.models?.map(model => <ModelItem key={model.name} model={model} />)}
          </div>
        </PageLayout.Content>
      </PageLayout>
    </>
  )
}
