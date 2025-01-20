import type {RouteRegistration} from '@github-ui/react-core/app-routing-types'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {Route, Routes} from 'react-router-dom'

export function getRouteWrapper(pathname: string, testRoute: RouteRegistration) {
  // eslint-disable-next-line react/display-name
  return ({children}: {children: React.ReactNode}) => (
    <Wrapper pathname={pathname} routes={[testRoute]}>
      <Routes>
        <Route path={testRoute.path} element={children} />
      </Routes>
    </Wrapper>
  )
}
