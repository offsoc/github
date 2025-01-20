import React from 'react'
import type {BoxProps} from '@primer/react'
import {Box, Heading, Text} from '@primer/react'

export function PageHeading(props: {name: React.ReactNode; description?: React.ReactNode; meta?: React.ReactNode}) {
  return (
    <header className="Subhead">
      <Heading
        as="h2"
        sx={{font: 'var(--text-subtitle-shorthand)', display: 'flex', alignItems: 'center'}}
        className="Subhead-heading"
        id="GitHub Copilot"
      >
        {props.name} {props.meta}
      </Heading>
      {props.description && <span className="Subhead-description">{props.description}</span>}
    </header>
  )
}

export function SubtleHeading(props: React.PropsWithChildren) {
  return (
    <Text
      as="p"
      sx={{
        color: 'fg.default',
        font: 'var(--text-medium-shorthand)',
        fontWeight: 'var(--base-text-weight-semibold)',
        my: 0,
      }}
    >
      {props.children}
    </Text>
  )
}

function BoxSectionItem(props: React.PropsWithChildren) {
  return (
    <Box
      as="li"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--stack-padding-spacious)',
        color: 'fg.muted',
      }}
    >
      {props.children}
    </Box>
  )
}

export function BoxSection(props: React.PropsWithChildren) {
  return (
    <div className="Box">
      <ul className="Box-body">
        {simpleFlattenChildren(props.children).map((child, index) => (
          <React.Fragment key={index}>
            {index > 0 ? <Divider /> : null}
            <BoxSectionItem>{child}</BoxSectionItem>
          </React.Fragment>
        ))}
      </ul>
    </div>
  )
}

// Slight modification from `ActionList.Divider` to increase the gap between items from space-2, to space-3
export function Divider() {
  return (
    <Box
      as="li"
      sx={{
        display: 'block',
        width: '100%',
        backgroundColor: 'border.default',
        height: 1,
        my: 3,
      }}
      aria-hidden="true"
    />
  )
}

export function CopilotCard(props: React.PropsWithChildren<BoxProps>) {
  const {children, sx = {}, ...rest} = props
  return (
    <Box
      sx={{
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'border.subtle',
        borderRadius: 6,
        p: 3,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  )
}

export function AccessibleBreak() {
  return <br aria-hidden="true" />
}

export function Bold(props: React.PropsWithChildren<React.ComponentProps<typeof Box>>) {
  const {children, ...rest} = props
  return (
    <Text {...rest} sx={{fontWeight: 600}}>
      {children}
    </Text>
  )
}

export function Muted(props: React.PropsWithChildren<BoxProps>) {
  const {children, ...rest} = props

  if (!children) {
    return null
  }

  return (
    <Box as="span" sx={{fontSize: 12, color: 'fg.muted'}} {...rest}>
      {children}
    </Box>
  )
}

function AssignablesTableListItem(props: React.PropsWithChildren<{selected?: boolean; id: string | number}>) {
  const {children, selected, id} = props

  return (
    <Box
      as="li"
      data-testid={`assignable-list-item-${id}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        border: '1px solid',
        borderTop: 0,
        borderColor: 'border.default',
        backgroundColor: selected ? 'accent.subtle' : 'initial',
        paddingX: 3,
        paddingY: 2,
        boxShadow: selected ? 'rgb(9, 105, 218) 0px 0px 0px 1px' : 'none',
        ':last-child': {
          borderBottomRightRadius: 2,
          borderBottomLeftRadius: 2,
        },
        '&:hover': {
          backgroundColor: selected ? 'accent.subtle' : 'neutral.subtle',
        },
      }}
    >
      {children}
    </Box>
  )
}

type AssignablesTableProps = {
  content: React.ReactNode
  trailingActions?: React.ReactNode
  emptyState?: React.ReactNode
} & BoxProps

function Table(props: AssignablesTableProps) {
  const {children, content, trailingActions, emptyState, ...rest} = props
  return (
    <Box {...rest} sx={{mt: 3}}>
      <Box className="table-list-header" sx={{display: 'flex', alignItems: 'center', mt: 0, paddingX: 3}}>
        <Box
          sx={{
            paddingTop: 2,
            paddingBottom: 2,
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            alignItems: 'center',
          }}
        >
          {content}
          {trailingActions}
        </Box>
      </Box>
      {emptyState && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          {emptyState}
        </Box>
      )}
      <Box as="ul" sx={{position: 'relative'}}>
        {children}
      </Box>
    </Box>
  )
}

export const AssignablesTable = Object.assign(Table, {
  ListItem: AssignablesTableListItem,
})

// --

function simpleFlattenChildren(children: React.ReactNode) {
  const kids: React.ReactNode[] = []

  // eslint-disable-next-line github/array-foreach
  React.Children.forEach(children, child => {
    if (React.isValidElement(child)) {
      if (child.type === React.Fragment) {
        kids.concat(simpleFlattenChildren(child.props.children))
        return
      }
      kids.push(child)
    }
  })

  return kids
}
