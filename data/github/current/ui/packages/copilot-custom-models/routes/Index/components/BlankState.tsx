import {Box, Text} from '@primer/react'
import {BookIcon} from '@primer/octicons-react'
import {Blankslate} from '@primer/react/drafts'

interface Props {
  newPath: string
}

export function BlankState({newPath}: Props) {
  return (
    <Blankslate border>
      <Blankslate.Visual>
        {' '}
        <Box sx={{color: 'var(--fgColor-muted, var(--color-muted-fg))', mb: '16px', mx: '4px'}}>
          <BookIcon size={24} />
        </Box>
      </Blankslate.Visual>

      <Blankslate.Heading>Create your custom model</Blankslate.Heading>
      <Blankslate.Description>
        <Text sx={{display: 'inline-block', textAlign: 'center', width: '100%'}}>
          Custom models are LLM&apos;s fine-tuned with your organization&apos;s unique code and usage patterns. They
          make Copilot familiar with your codebase, including modules, functions and internal libraries.
        </Text>
      </Blankslate.Description>

      <Blankslate.PrimaryAction href={newPath}>Train a new custom model</Blankslate.PrimaryAction>
    </Blankslate>
  )
}
