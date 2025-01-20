import {ArrowLeftIcon} from '@primer/octicons-react'
import {Box, Heading, Octicon} from '@primer/react'

import {useViews} from '../../hooks/use-views'
import {Link} from '../../router'

export const RouteTitle = ({title}: {title: string}) => {
  const {returnToViewLinkTo} = useViews()

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', alignSelf: 'center'}}>
      <Link to={returnToViewLinkTo} aria-label="Return to project view">
        <Octicon icon={ArrowLeftIcon} sx={{color: 'fg.muted', verticalAlign: 'middle', mr: 2}} size={24} />
      </Link>
      <Heading as="h1" sx={{fontSize: 3, color: 'fg.default'}}>
        {title}
      </Heading>
    </Box>
  )
}
