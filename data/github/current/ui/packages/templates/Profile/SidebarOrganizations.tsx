import {Box, Heading, Link} from '@primer/react'

function SidebarOrganizations() {
  return (
    <Box
      sx={{
        borderTopWidth: '1px',
        borderTopStyle: 'solid',
        borderTopColor: 'border.default',
        mt: 3,
        pt: 3,
        pb: [0, 0, 8],
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Heading as="h2" sx={{fontWeight: 'bold', fontSize: 2, pb: 2}}>
        Organizations
      </Heading>
      <Box
        sx={{
          mt: 2,
          display: 'flex',
          width: '100%',
          gap: 2,
          overflow: 'hidden',
          maxWidth: '100%',
        }}
      >
        {ORGANIZATIONS.map(a => {
          return (
            <Link
              key={a.id}
              href={a.href}
              aria-label={a.aria}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 'primer.shadow.inset',
                width: 32,
                height: 32,
                ':hover': {
                  opacity: 0.9,
                  transition: 'opacity 0.2s',
                },
              }}
            >
              <Box as="img" key={a.id} src={a.src} alt="" sx={{width: '100%'}} />
            </Link>
          )
        })}
      </Box>
    </Box>
  )
}

const ORGANIZATIONS = [
  {
    id: 0,
    src: 'https://avatars.githubusercontent.com/u/9919?s=88&v=4',
    href: 'https://github.com/github',
    aria: 'github',
  },
  {
    id: 1,
    src: 'https://avatars.githubusercontent.com/u/7143434?s=88&v=4',
    href: 'https://github.com/primer',
    aria: 'primer',
  },
]

export default SidebarOrganizations
