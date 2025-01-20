import React from 'react'

import {GitHubAvatar} from '@github-ui/github-avatar'
import {ownerAvatarPath, ownerPath, userHovercardPath} from '@github-ui/paths'
import {Box, Heading, Link, RelativeTime, Text, type SxProp} from '@primer/react'

export function PageHeading(props: {name: React.ReactNode; description?: React.ReactNode; meta?: React.ReactNode}) {
  return (
    <header className="Subhead">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Heading as="h2" sx={{font: 'var(--text-subtitle-shorthand)'}} className="Subhead-heading">
          {props.name}
        </Heading>
        {props.meta}
      </Box>
      {props.description && <span className="Subhead-description">{props.description}</span>}
    </header>
  )
}

export function FeedbackLink() {
  return (
    <Link
      href="https://gh.io/copilot-content-exclusion-feedback"
      sx={{
        fontSize: 0,
        ml: 1,
      }}
    >
      Give feedback
    </Link>
  )
}

export function LastEditedBy(props: {login: string; time: string; link?: string}) {
  const {login: owner, link} = props

  const Component = (childProps: React.PropsWithChildren) => {
    if (link) {
      return (
        <Link sx={{color: 'currentColor'}} aria-label="View audit log" href={link}>
          {childProps.children}
        </Link>
      )
    }
    return <>{childProps.children}</>
  }

  return (
    <Box sx={{color: 'fg.muted'}} data-testid="copilot-content-exclusion-last-edited-by">
      <Link
        aria-label={`View ${owner} profile`}
        href={ownerPath({owner})}
        data-hovercard-url={userHovercardPath({owner})}
        sx={{
          fontWeight: 600,
          color: 'fg.default',
          '&:hover': {color: 'fg.default', textDecoration: 'underline'},
        }}
      >
        <GitHubAvatar src={ownerAvatarPath({owner})} /> <Text sx={{fontWeight: 'bold'}}>{owner}</Text>
      </Link>{' '}
      last edited{' '}
      <Component>
        <RelativeTime datetime={props.time} tense="past" />
      </Component>
    </Box>
  )
}

const STACK_GAP_MAPPING = {
  condensed: 'var(--stack-gap-condensed)',
  normal: 'var(--stack-gap-normal)',
  spacious: 'var(--stack-gap-spacious)',
} as const

export function Stack(
  props: React.PropsWithChildren<
    {space?: number | keyof typeof STACK_GAP_MAPPING} & React.HTMLAttributes<HTMLDivElement> & SxProp
  >,
) {
  const {children, sx, space, ...rest} = props
  const items = simpleFlattenChildren(children)

  if (items.length < 2) return <>{items}</>

  let gap: string | number = space ?? 0
  if (typeof space === 'string') gap = STACK_GAP_MAPPING[space] ?? 0

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap,
        ...sx,
      }}
      {...rest}
    >
      {React.Children.map(items, (child, index) => (
        <div key={index}>{child}</div>
      ))}
    </Box>
  )
}

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
