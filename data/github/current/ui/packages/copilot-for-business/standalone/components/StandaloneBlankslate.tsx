import {Box, Button, Text} from '@primer/react'
import {CopilotCard} from '../../traditional/components/Ui'

type Props = {
  onAddTeams: () => void
}

export function StandaloneBlankslate(props: Props) {
  return (
    <CopilotCard
      role="region"
      aria-label="No teams assigned"
      sx={{
        px: 4,
        py: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Text
          as="h2"
          sx={{
            fontSize: 4,
            fontWeight: 600,
          }}
        >
          No teams assigned
        </Text>
        <Text as="p" sx={{color: 'fg.default', width: '75%', mt: 1, textAlign: 'center'}}>
          No members are using Copilot Business in this enterprise. To maximize your developer velocity using AI, start
          assigning seats to teams.
        </Text>
        <Button variant="primary" sx={{mt: 3}} onClick={props.onAddTeams}>
          Start adding teams
        </Button>
      </Box>
    </CopilotCard>
  )
}
