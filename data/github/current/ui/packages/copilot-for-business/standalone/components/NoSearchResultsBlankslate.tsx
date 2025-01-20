import {PersonIcon} from '@primer/octicons-react'
import {Box, Octicon} from '@primer/react'

export function NoSearchResultsBlankslate() {
  return (
    <Box className="Box blankslate" sx={{borderTopRightRadius: 0, borderTopLeftRadius: 0}}>
      <Octicon icon={PersonIcon} size={24} sx={{color: 'fg.subtle', mb: 3}} />
      <h2 className="blankslate-heading">Nothing matched your search criteria</h2>
      <Box sx={{alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
        <p>Make sure that everything is spelt correctly or try different keywords.</p>
      </Box>
    </Box>
  )
}
