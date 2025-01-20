import {ChevronDownIcon, ChevronRightIcon, FoldDownIcon, FoldUpIcon, XIcon} from '@primer/octicons-react'
import {ActionList, Box, Button, Heading, IconButton, Octicon, Spinner} from '@primer/react'
import type React from 'react'
import {useState} from 'react'

function Frame({children}: React.PropsWithChildren<unknown>) {
  const workspaceHeight = '100dvh - 64px - 52px' // 64px = header height, 52px = conversation header height

  return (
    <Box
      sx={{
        overflow: 'auto',
        maxHeight: `calc(${workspaceHeight})`,
      }}
    >
      <Box
        sx={{
          overflow: 'hidden',
          backgroundColor: 'canvas.default',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}

function Header({children, onDismiss}: React.PropsWithChildren<{onDismiss?: () => void}>) {
  return (
    <Heading
      as="h3"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        fontSize: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          minWidth: 0,
          '@media screen and (max-width: 768px)': {maxWidth: '80%'},
        }}
      >
        {children}
      </Box>
      {onDismiss && (
        // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
        <IconButton
          unsafeDisableTooltip={true}
          aria-label="Dismiss"
          icon={XIcon}
          onClick={onDismiss}
          variant="invisible"
          sx={{flexShrink: 0}}
        />
      )}
    </Heading>
  )
}

function SectionDivider({children}: React.PropsWithChildren<unknown>) {
  return (
    <Box
      sx={{
        borderBottom: '1px solid var(--borderColor-default, var(--color-border-default))',
        borderTop: '1px solid var(--borderColor-default, var(--color-border-default))',
        backgroundColor: 'canvas.subtle',
        px: 3,
        py: 2,
      }}
    >
      {children}
    </Box>
  )
}

function CollapsibleSubsection({
  children,
  title,
  initiallyOpen,
}: React.PropsWithChildren<{title: string; initiallyOpen?: boolean}>) {
  const [open, setOpen] = useState(initiallyOpen ?? false)
  return (
    <>
      <Button
        onClick={() => setOpen(wasOpen => !wasOpen)}
        sx={{
          borderRadius: 0,
          backgroundColor: 'canvas.default',
          border: 'none',
          borderBottom: '1px solid var(--borderColor-default, var(--color-border-default))',
          '[data-component="buttonContent"]': {
            justifyContent: 'start',
          },
        }}
      >
        {<Octicon icon={open ? ChevronDownIcon : ChevronRightIcon} sx={{mr: 2}} />}
        {title}
      </Button>
      {open && children}
    </>
  )
}

function Content({children}: React.PropsWithChildren<unknown>) {
  return <Box sx={{padding: 3}}>{children}</Box>
}

function ContentExpander({direction, onExpand}: {direction: 'above' | 'below'; onExpand: () => void}) {
  return (
    <Button
      onClick={onExpand}
      sx={{
        borderRadius: 0,
        backgroundColor: 'canvas.default',
        border: 'none',
        px: 3,
        py: 2,
        width: '100%',
        fontSize: 0,
        fontWeight: 'normal',
        color: 'fg.muted',
        '[data-component="buttonContent"]': {
          justifyContent: 'start',
        },
        ...(direction === 'above'
          ? {borderBottom: '1px solid var(--borderColor-default, var(--color-border-default))'}
          : {borderTop: '1px solid var(--borderColor-default, var(--color-border-default))'}),
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center'}}>
        <Octicon icon={direction === 'below' ? FoldDownIcon : FoldUpIcon} sx={{mr: 2}} />
        Show content {direction}
      </Box>
    </Button>
  )
}

function Details({children}: React.PropsWithChildren<unknown>) {
  return (
    <ActionList>
      <ActionList.Group>
        <ActionList.GroupHeading as="h3">Reference details</ActionList.GroupHeading>
        {children}
      </ActionList.Group>
    </ActionList>
  )
}

function DetailLink({children, href, icon}: React.PropsWithChildren<{href: string; icon: React.ElementType}>) {
  return (
    <ActionList.LinkItem href={href}>
      <ActionList.LeadingVisual>
        <Octicon icon={icon} />
      </ActionList.LeadingVisual>

      {children}
    </ActionList.LinkItem>
  )
}

function Loading() {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', m: 'auto', p: 3}}>
      <Spinner sx={{mb: 2}} />
      <div>Loading...</div>
    </Box>
  )
}

function Error() {
  return (
    <Box sx={{display: 'flex', justifyContent: 'center', p: 3}}>
      <Box sx={{color: 'danger.fg', fontWeight: 'bold'}}>Failed to load reference details</Box>
    </Box>
  )
}

function Body({
  children,
  detailsError,
  detailsLoading,
}: React.PropsWithChildren<{detailsError: boolean; detailsLoading: boolean}>) {
  return detailsError ? <Error /> : detailsLoading ? <Loading /> : <>{children}</>
}

export const ReferencePreview = {
  Frame,
  Header,
  Body,
  Content,
  CollapsibleSubsection,
  ContentExpander,
  Details,
  DetailLink,
  SectionDivider,
}
