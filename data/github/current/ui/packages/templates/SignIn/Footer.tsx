import {Box, Link} from '@primer/react'

const SUPPORT_ITEMS = [
  {
    id: 0,
    name: 'About',
    href: 'https://github.com/about',
  },
  {
    id: 1,
    name: 'Terms',
    href: 'https://docs.github.com/en/site-policy/github-terms/github-terms-of-service',
  },
  {
    id: 2,
    name: 'Privacy',
    href: 'https://docs.github.com/site-policy/privacy-policies/github-privacy-statement',
  },
  {
    id: 3,
    name: 'Docs',
    href: 'https://docs.github.com/en',
  },
  {
    id: 4,
    name: 'Support',
    href: 'https://support.github.com/request/landing',
  },
  {
    id: 5,
    name: 'Manage cookies',
    href: 'https://github.com',
  },
]

function Footer() {
  return (
    <Box as="footer" sx={{mt: [6, 6, 8]}}>
      <nav>
        <Box
          as="ul"
          sx={{
            display: 'flex',
            rowGap: 2,
            columnGap: 3,
            justifyContent: 'center',
            listStyleType: 'none',
            flexWrap: 'wrap',
          }}
        >
          {SUPPORT_ITEMS.map(item => {
            return (
              <li key={item.id}>
                <Link href={item.href} sx={{fontSize: 0}} muted>
                  {item.name}
                </Link>
              </li>
            )
          })}
        </Box>
      </nav>
    </Box>
  )
}

export default Footer
