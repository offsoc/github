import {SafeHTMLBox} from '@github-ui/safe-html'
import {testIdProps} from '@github-ui/test-id-props'
import {AlertIcon} from '@primer/octicons-react'
import {Box, Flash, Octicon} from '@primer/react'

import {Strings} from './constants/strings'

interface ValidationMessageProps {
  id: string
  messages?: string[]
}

export const ValidationMessage = ({id, messages}: ValidationMessageProps) => {
  if (!messages || messages.length < 1) return null

  return (
    <Flash
      id={id}
      variant="warning"
      sx={{
        py: 2,
        pl: '12px',
        pr: 3,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
      }}
    >
      <Octicon icon={AlertIcon} sx={{mt: '2px'}} />
      <Box sx={{display: 'flex', flexDirection: 'column'}}>
        <Box sx={{fontWeight: 500}} {...testIdProps('validation-error-count')}>
          {Strings.filterInvalid(messages.length)}
        </Box>
        <Box as="ul" sx={{ml: 3}} {...testIdProps('validation-error-list')}>
          {/* We are setting the HTML dangerously below in order to have <pre> tags show up as HTML properly */}
          {messages.map(message => (
            <SafeHTMLBox
              as="li"
              key={message.replaceAll(' ', '-')}
              unverifiedHTML={message}
              unverifiedHTMLConfig={{ALLOWED_TAGS: ['pre']}}
              sx={{
                pre: {
                  display: 'inline',
                  color: 'attention.fg',
                  p: '2px',
                  fontWeight: 500,
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Flash>
  )
}
