import {Box, Heading, Popover, Spinner, Text} from '@primer/react'

type Props = {
  headerText: string
}

export const PaginatedArchiveMutationInProgressDialog = ({headerText}: Props) => {
  return (
    <Popover
      open
      caret="bottom"
      sx={{
        position: 'fixed',
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        top: 0,
        left: 0,
      }}
    >
      <Popover.Content
        sx={{
          margin: 'auto',
          paddingTop: '25px',
          width: '320px',
          height: '200px',
          '&::before': {content: 'none !important'},
          '&::after': {content: 'none !important'},
        }}
      >
        <Heading as="h2" sx={{fontSize: 3, mb: 4}}>
          {headerText}
        </Heading>
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <Spinner />
          <Text sx={{color: 'fg.muted', mt: 3, px: 2}}>
            This may take some time. This dialog will close when the job is complete.
          </Text>
        </Box>
      </Popover.Content>
    </Popover>
  )
}
