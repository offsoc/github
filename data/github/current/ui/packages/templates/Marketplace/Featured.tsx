import {Box, Text, Heading, Label, Octicon} from '@primer/react'
import {VerifiedIcon, DownloadIcon} from '@primer/octicons-react'

const CARDS = [
  {
    image: 'https://github.com/primer/design/assets/980622/532571f5-cd42-4027-8793-98392cfc991d',
    name: 'Postman APIs',
    description: 'Build for developers who want to trigger an action in Postman from GitHub.',
    label: 'Copilot',
    downloads: 24200,
    verified: true,
  },
  {
    image: 'https://github.com/primer/design/assets/980622/7b5c1ed6-f3d3-4415-980b-761c166df2e1',
    name: 'Datadog monitoring',
    description: 'Modern monitoring & security. Review any stack, any app, at any scale.',
    label: 'Copilot',
    downloads: 16458,
    verified: false,
  },
  {
    image: 'https://github.com/primer/design/assets/980622/6dc2688f-6a82-4244-a772-3caa204c4f8f',
    name: 'Launch Darkly feature flags',
    description: 'Maximize the value of software feature via automation & feature management.',
    label: 'Copilot',
    downloads: 9725,
    verified: true,
  },
  {
    image: 'https://github.com/primer/design/assets/980622/17050734-0f6f-43c9-b285-c0c87148d982',
    name: 'Stripe',
    description: 'Financial infrastructure for the internet and modern companies.',
    label: 'Copilot',
    downloads: 22561,
    verified: true,
  },
  {
    image: 'https://github.com/primer/design/assets/980622/0b421923-ba03-4e8b-8562-83b54736a4bc',
    name: 'Sentry.io',
    description: 'Make sense of your unresolved issues happening within this files of your codebase.',
    label: 'Copilot',
    downloads: 48769,
    verified: true,
  },
  {
    image: 'https://github.com/primer/design/assets/980622/2a01f738-5928-43d1-84c2-d2336da10197',
    name: 'Docker',
    description: 'Accelerate how your company builds, shares, and runs applications in the cloud.',
    label: 'Copilot',
    downloads: 24992,
    verified: true,
  },
]

export default function Featured() {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
        <Heading
          as="h2"
          sx={{
            fontSize: 3,
            fontWeight: 'bold',
          }}
        >
          Top starter Copilot plugins for your daily tasks
        </Heading>
        <Text
          sx={{
            fontSize: 1,
            fontWeight: 'normal',
            color: 'fg.muted',
          }}
        >
          Enhance and personalize Copilot based on your needs via third-party plugins
        </Text>
      </Box>
      <Box
        sx={{
          display: 'grid',
          width: '100%',
          gap: 4,
          gridTemplateColumns: ['1fr', '1fr 1fr', '1fr 1fr', '1fr 1fr 1fr'],
        }}
      >
        {CARDS.map(card => {
          return (
            <Box
              key={card.name}
              sx={{
                borderColor: 'border.default',
                borderWidth: 1,
                borderRadius: 2,
                p: 4,
                gap: 2,
                bg: 'canvas.default',
                display: 'flex',
                flexDirection: 'column',
                borderStyle: 'solid',
                boxShadow: 'shadow.small',
                ':hover': {
                  bg: 'canvas.subtle',
                },
              }}
            >
              <Box
                as="img"
                src={card.image}
                alt={card.name}
                sx={{
                  overflow: 'hidden',
                  borderRadius: '12px',
                  width: 40,
                  height: 40,
                  outline: '1px solid rgba(0, 0, 0, 0.1)',
                  outlineOffset: '-1px',
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  flex: 1,
                }}
              >
                <Heading as="h3" sx={{fontSize: 2, fontWeight: 'bold', wordWrap: 'break-word'}}>
                  {card.name} {card.verified && <Octicon icon={VerifiedIcon} sx={{color: 'done.fg', ml: 1}} />}
                </Heading>
                <Text
                  sx={{
                    fontSize: 0,
                    color: 'fg.muted',
                    display: 'block',
                    wordWrap: 'break-word',
                  }}
                >
                  {card.description}
                </Text>
              </Box>
              <Box sx={{display: 'flex', gap: 2}}>
                <Label>{card.label}</Label>
                <Box
                  sx={{
                    fontSize: 0,
                    color: 'fg.muted',
                    display: 'flex',
                    gap: 1,
                  }}
                >
                  <Octicon icon={DownloadIcon} />
                  {card.downloads.toLocaleString()}
                </Box>
              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
