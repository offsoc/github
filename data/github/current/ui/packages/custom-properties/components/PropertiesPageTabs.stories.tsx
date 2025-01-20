import {Wrapper} from '@github-ui/react-core/test-utils'
import type {Meta} from '@storybook/react'
import {Route, Routes} from 'react-router-dom'

import {definitionsRoute} from '../custom-properties'
import {PropertiesPageTabs} from './PropertiesPageTabs'

const meta = {
  title: 'Apps/Custom Properties/Components/PropertiesPageTabs',
  component: PropertiesPageTabs,
} satisfies Meta<typeof PropertiesPageTabs>

export default meta

export const Default = () => {
  return (
    <Wrapper pathname="/organizations/acme/settings/custom-properties" routes={[definitionsRoute]}>
      <Routes>
        <Route path={definitionsRoute.path} element={<PropertiesPageTabs permissions="all" definitionsCount={100} />} />
      </Routes>
    </Wrapper>
  )
}
