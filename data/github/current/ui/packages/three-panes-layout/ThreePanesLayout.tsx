import {Box, PageLayout} from '@primer/react'

export type PaneWithAriaLabel = {
  element: JSX.Element
  ariaLabel: string
}

export type ThreePanesLayoutProps = {
  leftPane?: PaneWithAriaLabel
  middlePane?: JSX.Element
  contentAs?: React.ElementType
  rightPane?: PaneWithAriaLabel
  rightPanePadding?: boolean
  rightPaneAs?: React.ElementType
}

export function ThreePanesLayout({
  leftPane,
  middlePane,
  contentAs,
  rightPane,
  rightPanePadding = true,
  rightPaneAs,
}: ThreePanesLayoutProps) {
  return (
    <PageLayout
      sx={{
        minHeight: '100%',
        '> div': {
          minHeight: '100%',
        },
        padding: 0,
      }}
      containerWidth="full"
      columnGap="none"
    >
      {leftPane && (
        <PageLayout.Pane
          width="large"
          position="start"
          divider="line"
          padding="none"
          resizable={true}
          widthStorageKey="hyperlist.pane-sidewidth"
          sx={{
            'div:last-of-type': {
              '--pane-max-width': '337px',
            },
            maxHeight: '100vh',
            position: 'sticky',
            top: '0',
            display: ['none', 'none', 'flex', 'flex'],
          }}
          aria-label={leftPane.ariaLabel}
        >
          {leftPane.element}
        </PageLayout.Pane>
      )}
      <PageLayout.Content as={contentAs}>
        {rightPane ? (
          <PageLayout
            sx={{
              height: '100%',
              '> div': {
                height: '100%',
              },
              padding: 0,
            }}
            containerWidth="full"
            columnGap="none"
          >
            {middlePane && (
              <PageLayout.Pane
                width="large"
                divider="line"
                resizable={true}
                widthStorageKey="hyperlist.pane-details-width"
                padding="condensed"
                position="start"
                sx={{
                  maxHeight: '100vh',
                  position: 'sticky',
                  top: '0',
                  display: ['none', 'none', 'none', 'none', 'flex'],
                }}
                aria-label={rightPane.ariaLabel}
              >
                {middlePane}
              </PageLayout.Pane>
            )}
            {rightPane && (
              <PageLayout.Content as={rightPaneAs} padding={rightPanePadding ? 'normal' : 'none'}>
                {rightPane.element}
              </PageLayout.Content>
            )}
          </PageLayout>
        ) : middlePane ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              px: [3, 3, 4],
              py: 3,
              width: '100%',
              maxWidth: '1280px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {middlePane}
          </Box>
        ) : null}
      </PageLayout.Content>
    </PageLayout>
  )
}
