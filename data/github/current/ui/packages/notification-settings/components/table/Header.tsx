import {Box, Heading} from '@primer/react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Header(props: any) {
  return (
    <Box
      sx={{
        backgroundColor: 'canvas.inset',
        borderRadius: 2,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderColor: 'border.default',
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
      }}
    >
      <Heading as="h2" sx={{display: 'flex', justifyContent: 'space-between', fontSize: 1, mb: 0, pl: 3, py: 3}}>
        {props.children}
      </Heading>
    </Box>
  )
}

export default Header
