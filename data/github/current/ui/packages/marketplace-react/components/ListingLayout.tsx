import {Box, PageLayout, UnderlineNav} from '@primer/react'
import {BookIcon} from '@primer/octicons-react'

interface ListingLayoutProps {
  header: React.ReactNode
  body: React.ReactNode
  sidebar: React.ReactNode
}

export const ListingLayout = (props: ListingLayoutProps) => {
  const {header, body, sidebar} = props

  return (
    <div className="d-flex flex-column">
      <PageLayout columnGap="normal" sx={{p: 3}}>
        <PageLayout.Header>{header}</PageLayout.Header>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            width: ['100%', '100%', 'auto'],
            justifyContent: 'flex-end',
            flexGrow: [0, 0, 1],
            flexShrink: 0,
            flexDirection: ['column-reverse', 'column-reverse', 'row'],
          }}
        >
          <PageLayout.Content as="div" sx={{pt: 0}}>
            <Box
              sx={{
                width: '100%',
                borderColor: 'border.default',
                borderStyle: 'solid',
                borderWidth: 1,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-resting-small,var(--color-shadow-small))',
              }}
            >
              <div>
                <UnderlineNav aria-label="Listing navigation">
                  <UnderlineNav.Item icon={BookIcon} aria-current={'page'}>
                    README
                  </UnderlineNav.Item>
                </UnderlineNav>
              </div>
              <Box sx={{p: [2, 2, 3]}}>{body}</Box>
            </Box>
          </PageLayout.Content>
          <PageLayout.Pane>{sidebar}</PageLayout.Pane>
        </Box>
      </PageLayout>
    </div>
  )
}
