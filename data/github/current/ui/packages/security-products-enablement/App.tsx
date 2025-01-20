import type React from 'react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {AppContextValue} from './security-products-enablement-types'
import {AppContext} from './contexts/AppContext'
/**
 * The App component is used to render content which should be present on _all_ routes within this app
 */
const App: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const appContextValue = useRoutePayload<AppContextValue>()

  return (
    <>
      <AppContext.Provider value={appContextValue}>{children}</AppContext.Provider>
    </>
  )
}
export default App
