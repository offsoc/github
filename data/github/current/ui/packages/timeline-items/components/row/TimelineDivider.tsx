import {Box, Spinner} from '@primer/react'
import {TEST_IDS} from '../../constants/test-ids'

type TimelineDividerProps = {
  isLoading?: boolean
  isHovered?: boolean
  large?: boolean
  id?: string
}

export const TimelineDivider = ({isLoading, isHovered, large, id}: TimelineDividerProps) => (
  <Box
    sx={{
      px: 4,
      height: large ? '16px' : '12px',
      display: 'flex',
      justifyContent: isLoading ? 'center' : 'space-between',
      alignItems: 'center',
      flexGrow: 1,
    }}
    data-testid={id ? TEST_IDS.timelineDivider(id) : undefined}
  >
    {isLoading ? (
      <Spinner size={'small'} />
    ) : (
      <>
        <Box
          sx={{
            height: '100%',
            ml: 1,
            width: '2px',
            backgroundColor: 'border.muted',
          }}
        />
        <Box
          sx={{
            backgroundColor: 'canvas.subtle',
            transition: '.1s',
            ml: 2,
            borderRadius: 3,
            height: '8px',
            width: '98%',
            opacity: isHovered ? 1 : 0,
          }}
        />
      </>
    )}
  </Box>
)
