import {Link} from '@github-ui/react-core/link'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Box, Heading, Text, Link as PrimerLink} from '@primer/react'
import type {FC} from 'react'

import type {CustomRoutesPayload} from '../types/custom-route-types'
import CustomRouteSettings from '../components/CustomRouteSettings'

export const CustomRoutesPage: FC = () => {
  const routePayload = useRoutePayload<CustomRoutesPayload>()
  return (
    <>
      {/* Custom Route header */}
      <Box sx={{borderColor: 'border.default', borderBottomWidth: 1, borderBottomStyle: 'solid', pb: 2, mb: 3}}>
        <Heading as="h1" sx={{fontSize: 4, fontWeight: 400, display: 'flex'}} data-hpc>
          <PrimerLink as={Link} to="/settings/notifications">
            Notifications
          </PrimerLink>
          <Text as="span" sx={{ml: 2}}>
            / Custom Routing
          </Text>
        </Heading>
      </Box>

      {/* Custom Route settings table */}
      <CustomRouteSettings payload={routePayload} />
    </>
  )
}
