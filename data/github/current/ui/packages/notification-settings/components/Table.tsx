import {Box} from '@primer/react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Table(props: any) {
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        borderColor: 'border.default',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 2,
      }}
    >
      {props.children}
    </Box>
  )
}

export default Table
