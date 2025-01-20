import type React from 'react'
import type {InsightsSidenavProps} from '@github-ui/insights-sidenav'
import {InsightsSidenavPanel} from '@github-ui/insights-sidenav'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useDefaultParams} from './hooks/UseDefaultParams'
import {useEffect} from 'react'

import styles from './App.module.css'
import {clsx} from 'clsx'

export interface SidenavAppPayload {
  sidenav: InsightsSidenavProps
}

/**
 * The App component is used to render content which should be present on _all_ routes within this app
 */
export function App(props: {children?: React.ReactNode}) {
  const {sidenav} = useRoutePayload<SidenavAppPayload>()
  const {setDefaultParams} = useDefaultParams()

  useEffect(() => {
    setDefaultParams()
  }, [setDefaultParams])

  return (
    <div className="d-flex flex-column flex-lg-row flex-content-stretch">
      <InsightsSidenavPanel {...sidenav} />
      <div className={clsx(styles.App, 'flex-1 mx-lg-auto p-4')}>{props.children}</div>
    </div>
  )
}
