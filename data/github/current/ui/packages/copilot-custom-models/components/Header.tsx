import {Heading, Box, Label, Text} from '@primer/react'
import type {ReactNode} from 'react'

interface Props {
  action?: ReactNode
  subtext?: string
  text: string
}

export function Header({action, subtext, text}: Props) {
  return (
    <div>
      <header className="Subhead" style={{marginBottom: subtext ? '8px' : 0}}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Heading as="h2" sx={{font: 'var(--text-subtitle-shorthand)'}} className="Subhead-heading">
            {text}
          </Heading>
          <Box sx={{alignItems: 'center', display: 'flex', gap: '24px'}}>
            <Label variant="success">Beta</Label>

            {action}
          </Box>
        </Box>
      </header>

      {subtext && (
        <Text as="p" sx={{color: 'var(--fgColor-muted, var(--color-muted-fg))', mb: 0}}>
          {subtext}
        </Text>
      )}
    </div>
  )
}
