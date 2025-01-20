import {Box, Heading, Octicon, Label, Link, IconButton, Tooltip} from '@primer/react'
import {StarIcon, RepoForkedIcon, RepoIcon, PencilIcon} from '@primer/octicons-react'

function PinnedRepositories() {
  const REPOSITORIES = [
    {
      id: 1,
      name: 'Playground',
      description: 'The quickest way to start playing around with Primer React.',
      language: 'JavaScript',
      languageColor: 'attention.fg',
      stars: 98,
      forks: 20,
      href: 'https://github.com/primer/react-template',
    },
    {
      id: 2,
      name: 'Notes',
      description: 'Tips and tricks to make your coding journey smoother and more fun!',
      language: 'TypeScript',
      languageColor: 'done.fg',
      stars: 12,
      forks: 5,
      href: 'https://github.com/primer/react-template',
    },
    {
      id: 3,
      name: 'Recipes',
      description: `The most delicious coding snacks, perfect for any developer's kitchen!`,
      language: 'Markdown',
      languageColor: 'success.fg',
      stars: 52,
      forks: 1,
      href: 'https://github.com/primer/react-template',
    },
    {
      id: 4,
      name: 'VSCode',
      description: 'The coolest extensions, themes, and shortcuts to supercharge your coding experience in VSCode!',
      language: 'C++',
      languageColor: 'sponsors.fg',
      stars: 52,
      forks: 8,
      href: 'https://github.com/primer/react-template',
    },
  ]
  return (
    <Box
      sx={{
        borderTopWidth: [1, 1, 0],
        borderTopStyle: 'solid',
        borderTopColor: 'border.default',
        mt: 3,
        py: 3,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Heading
          as="h2"
          sx={{
            flex: 1,
            fontWeight: 'bold',
            fontSize: 2,
          }}
        >
          Pinned
        </Heading>
        <Tooltip aria-label="Edit pinned repositories">
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            unsafeDisableTooltip={true}
            icon={PencilIcon}
            variant="invisible"
            aria-label="Edit pinned repositories"
          />
        </Tooltip>
      </Box>

      <Box
        sx={{
          display: 'grid',
          pt: 3,
          gridTemplateColumns: ['1fr', '1fr', 'repeat(2, 1fr)'],
          gap: 3,
        }}
      >
        {REPOSITORIES.map(a => {
          return (
            <Box
              key={a.id}
              sx={{
                p: 3,
                borderStyle: 'solid',
                borderWidth: 1,
                fontSize: 1,
                borderColor: 'border.default',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'shadow.small',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Octicon icon={RepoIcon} size={16} sx={{mr: 2, color: 'fg.muted'}} />
                <Link href={a.href} sx={{fontWeight: 'bold'}}>
                  {a.name}
                </Link>
                <Label variant="secondary" sx={{ml: 2}}>
                  Public
                </Label>
              </Box>
              <Box sx={{fontSize: 0, color: 'fg.muted'}}>{a.description}</Box>
              <Box
                sx={{
                  display: 'flex',
                  gap: 4,
                  flex: 1,
                  alignItems: 'flex-end',
                  fontSize: 0,
                  color: 'fg.muted',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bg: a.languageColor,
                      borderRadius: 6,
                      mr: 1,
                    }}
                  />
                  {a.language}
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Octicon icon={StarIcon} size={16} sx={{mr: 1, color: 'fg.muted'}} />
                  {a.stars}
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Octicon icon={RepoForkedIcon} size={16} sx={{mr: 1, color: 'fg.muted'}} />
                  {a.forks}
                </Box>
              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default PinnedRepositories
