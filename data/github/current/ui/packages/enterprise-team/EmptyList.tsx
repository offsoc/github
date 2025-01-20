import {Box, Octicon} from '@primer/react'
import {PersonIcon} from '@primer/octicons-react'

const EmptyList = () => (
  <Box
    sx={{
      borderBottomColor: 'border.default',
      borderBottomStyle: 'solid',
      borderBottomWidth: 1,
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '40px',
    }}
  >
    <div>
      <Octicon icon={PersonIcon} size={24} />
    </div>
    <h2>This team does not have any members.</h2>
  </Box>
)

export default EmptyList
