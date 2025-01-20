import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box, Spinner} from '@primer/react'

type CommentDividerProps = {
  isLoading?: boolean
  isHovered?: boolean
  large?: boolean
}

export const CommentDivider = ({large, isLoading, isHovered}: CommentDividerProps) => (
  <Box sx={{pl: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
    <Box
      sx={{
        pb: large ? 4 : 3,
        ml: 1,
        width: '2px',
        backgroundColor: 'border.default',
      }}
    />
    {isLoading && <Spinner size={'small'} />}
    {isHovered && !isLoading && <LoadingSkeleton height={'12px'} width={'100%'} sx={{ml: 2, mr: 2}} />}
    <Box
      sx={{
        pb: large ? 4 : 3,
        mr: 1,
        width: '2px',
      }}
    />
  </Box>
)
