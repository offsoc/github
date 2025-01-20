import {Box, Text, Heading, Label, UnderlineNav, Octicon} from '@primer/react'
import {VerifiedIcon, DownloadIcon} from '@primer/octicons-react'

const CARDS = [
  {
    image: 'https://github.com/primer/design/assets/980622/146608e9-e72a-49bb-ba0e-150d67318c05',
    name: 'ZenHub',
    description: 'Project management tool that integrates natively within GitHub.',
    label: 'Apps',
    verified: false,
    downloads: 125,
  },
  {
    image: 'https://github.com/primer/design/assets/980622/95842309-b689-45c7-977a-9128e3c91904',
    name: 'Deploy to Vercel',
    description: 'Deploy your project to Vercel using GitHub Actions. Supports PR.',
    label: 'Actions',
    verified: false,
    downloads: 9245,
  },
  {
    image: 'https://github.com/primer/design/assets/980622/b8adf31b-9080-4576-a2ed-7978019ed40b',
    name: 'Pulumi',
    description: 'Gain better scale, more productivity, and faster time to market.',
    label: 'Copilot',
    verified: true,
    downloads: 2414,
  },
  {
    image: 'https://github.com/primer/design/assets/980622/8d5ba3d0-f963-4255-bd82-8beee388f2dc',
    name: 'Azure Pipelines',
    description: 'Continuously build, test, and deploy to any platform and cloud.',
    label: 'Actions',
    verified: true,
    downloads: 4350,
  },
  {
    image: 'https://github.com/primer/design/assets/980622/1c4cd32a-79eb-49eb-b4ef-53f0cfb9664c',
    name: 'Setup Go environment',
    description: 'Configure a Go environment and add it to the PATH.',
    label: 'Actions',
    verified: false,
    downloads: 524,
  },
  {
    image: 'https://github.com/primer/design/assets/980622/0f1e0852-9663-48cd-af65-d54cc339b2f9',
    name: 'Super-Linter',
    description: 'Ready-to-run collection of linters and code analyzers, to help…',
    label: 'Apps',
    verified: true,
    downloads: 202,
  },
]

const NAV_ITEMS = ['Trending this week', 'Recently added']

export default function Featured() {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <UnderlineNav aria-label="Repositories">
        {NAV_ITEMS.map((child, index) => (
          <UnderlineNav.Item key={index} href="#" aria-current={index === 0 ? 'page' : undefined}>
            {child}
          </UnderlineNav.Item>
        ))}
      </UnderlineNav>
      <Box
        sx={{
          display: 'grid',
          width: '100%',
          gap: 4,
          gridTemplateColumns: ['1fr', '1fr', '1fr', '1fr 1fr'],
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
                gap: [2, 2, 3],
                bg: 'canvas.default',
                display: 'flex',
                borderStyle: 'solid',
                flexDirection: ['column', 'column', 'row'],
                boxShadow: 'shadow.small',
                ':hover': {
                  bg: 'canvas.subtle',
                },
              }}
            >
              <Box
                as="img"
                alt={card.name}
                src={card.image}
                sx={{
                  overflow: 'hidden',
                  borderRadius: 12,
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
                  gap: [1, 1, 0],
                  flex: 1,
                }}
              >
                <Heading
                  as="h3"
                  sx={{
                    fontSize: 2,
                    fontWeight: 'bold',
                    wordWrap: 'break-word',
                  }}
                >
                  {card.name} {card.verified && <Octicon icon={VerifiedIcon} sx={{color: 'done.fg', ml: 1}} />}
                </Heading>
                <Text
                  sx={{
                    fontSize: 0,
                    color: 'fg.muted',
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
                    display: ['flex', 'flex', 'none'],
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
