import type {OrgEditPermissions} from '@github-ui/custom-properties-types'
import {human} from '@github-ui/formatters'
import {Link} from '@github-ui/react-core/link'
import {Box, CounterLabel, TabNav} from '@primer/react'
import type {ComponentProps} from 'react'

import {useActiveTab} from '../hooks/use-active-tab'

interface Props {
  definitionsCount: number
  permissions: OrgEditPermissions
}

// Workaround the bug with invalid `activeClassName` prop.
const WrappedLink = ({activeClassName, ...props}: ComponentProps<typeof Link> & {activeClassName?: string}) => (
  <Link {...props} />
)
export function PropertiesPageTabs({definitionsCount, permissions}: Props) {
  const [activeTab, hrefBuilder] = useActiveTab(permissions)
  return (
    <TabNav aria-label="Page selector" sx={{mb: 3, svg: {color: 'fg.muted'}}}>
      <TabNav.Link as={WrappedLink} to={hrefBuilder('properties')} selected={activeTab === 'properties'}>
        <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
          <span>Properties</span>
          <CounterLabel>{human(definitionsCount)}</CounterLabel>
        </Box>
      </TabNav.Link>
      <TabNav.Link as={WrappedLink} to={hrefBuilder('set-values')} selected={activeTab === 'set-values'}>
        <span>Set values</span>
      </TabNav.Link>
    </TabNav>
  )
}
