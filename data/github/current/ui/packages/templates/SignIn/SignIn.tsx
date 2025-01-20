import {Box, TextInput, FormControl, Text, Button, Octicon, Link} from '@primer/react'
import {MarkGithubIcon} from '@primer/octicons-react'

import Footer from './Footer'

export function SignIn() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
      }}
    >
      <Box
        as="main"
        sx={{
          bg: 'canvas.default',
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          flexDirection: 'column',
          pt: [4, 4, 5],
        }}
      >
        <Box sx={{maxWidth: 300, width: '100%', display: 'flex', flexDirection: 'column', gap: 3}}>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center'}}>
            <Octicon icon={MarkGithubIcon} size={48} />
            <Text as="h1" sx={{fontSize: 4, fontWeight: 300, textAlign: 'center'}}>
              Sign in to GitHub
            </Text>
          </Box>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
            <Box
              as="form"
              sx={{
                bg: 'canvas.subtle',
                pl: 3,
                pr: 3,
                pt: 3,
                pb: 4,
                display: 'flex',
                gap: 3,
                flexDirection: 'column',
                justifyContent: 'stretch',
                borderRadius: 2,
                borderStyle: 'solid',
                borderColor: 'border.default',
                borderWidth: 1,
                boxShadow: 'shadow.small',
              }}
            >
              <FormControl>
                <FormControl.Label>Username or email address</FormControl.Label>
                <TextInput type="text" block autoFocus />
              </FormControl>
              <FormControl id="password">
                <Box sx={{display: 'flex', width: '100%', alignItems: 'center'}}>
                  <Text as="label" htmlFor="password" sx={{flex: 1}}>
                    Password
                  </Text>
                  <Link sx={{fontSize: 0}} href="https://github.com/password_reset">
                    Forgot password?
                  </Link>
                </Box>
                <Box sx={{width: '100%'}}>
                  <TextInput type="password" id="password" block />
                </Box>
              </FormControl>
              <Button variant="primary">Sign in</Button>
            </Box>
            <Box
              sx={{
                bg: 'canvas.default',
                p: 3,
                borderRadius: 2,
                borderStyle: 'solid',
                borderColor: 'border.default',
                textAlign: 'center',
                borderWidth: 1,
                boxShadow: 'shadow.small',
              }}
            >
              New to GitHub?{' '}
              <Link inline href="https://github.com/signup">
                Create an account
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
      <Footer />
    </Box>
  )
}
