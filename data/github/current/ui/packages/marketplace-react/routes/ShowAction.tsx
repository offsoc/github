import {useRoutePayload} from '@github-ui/react-core/use-route-payload'

import styles from '../marketplace.module.css'

import {Breadcrumbs, PageLayout} from '@primer/react'
import type {ShowActionPayload} from '../types'

export function ShowAction() {
  const payload = useRoutePayload<ShowActionPayload>()

  return (
    <>
      <PageLayout>
        <PageLayout.Header>
          <Breadcrumbs>
            <Breadcrumbs.Item href="/marketplace">Marketplace</Breadcrumbs.Item>
            <Breadcrumbs.Item href="#" selected>
              {payload.action.name}
            </Breadcrumbs.Item>
          </Breadcrumbs>
        </PageLayout.Header>
        <PageLayout.Pane position="start">
          <div
            className={`rounded-3 bgColor-accent-emphasis ${styles['marketplace-logo']} ${styles['marketplace-logo--large']}`}
          >
            <img src="" alt="" className={styles['marketplace-logo-img']} />
          </div>
        </PageLayout.Pane>

        <PageLayout.Content as="div" width="medium">
          <div className="d-flex flex-items-center gap-2">
            <span className="fgColor-muted">Copilot plugin</span>
          </div>
          <h1>{payload.action.name}</h1>
        </PageLayout.Content>
      </PageLayout>
    </>
  )
}
