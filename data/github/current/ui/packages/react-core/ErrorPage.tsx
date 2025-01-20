import {Box, Heading} from '@primer/react'
import type {PageError} from './app-routing-types'

const errorMessages: {[httpStatus: number]: string} = {
  404: 'Didn’t find anything here!',
  500: 'Looks like something went wrong!',
}

export function ErrorPage({httpStatus, type}: PageError) {
  const message = type === 'fetchError' ? 'Looks like network is down!' : errorMessages[httpStatus || 500]
  return (
    <Heading
      as="h1"
      tabIndex={-1}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: '100%',
        minHeight: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      Error
      {httpStatus ? <Box sx={{fontSize: '144px', fontWeight: 'bold', lineHeight: 1}}>{httpStatus}</Box> : null}
      <Box sx={{fontSize: 4, pt: 2}}>{message}</Box>
    </Heading>
  )
}
