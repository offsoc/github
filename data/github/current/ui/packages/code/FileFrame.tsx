import React from 'react'

import {GitHubAvatar} from '@github-ui/github-avatar'
import {ChevronDownIcon, ChevronUpIcon, GitBranchIcon} from '@primer/octicons-react'
import {Box, IconButton, Link} from '@primer/react'

import {CenteredContent, EllipsisOverflow, TextWithIcon} from './UI'
import {fileContext} from './context'

export type FileEntity = {
  /** The url of the file */
  url: string
  /** The path of the file */
  path: string
  /** The commit hash of this file */
  commit_id: string
  /** Name With Owner */
  nwo: string
  /** The language of the file. Eg: rust */
  language?: string
  /** The color of the language. Eg: #FFD6CC */
  language_color?: string
  /** The ref of the file. Eg: main */
  ref: {value: string; label: string} | string
}

export type FileFrameProps = {
  entity: FileEntity
  /**Any additional metadata renders to place in the file frame header */
  decorations?: React.ReactNode
}

export function FileFrame(props: React.PropsWithChildren<FileFrameProps>) {
  const {entity} = props

  const [isOpen, toggleOpen] = React.useReducer(v => !v, true)

  const [owner, name] = entity.nwo.split('/', 2)

  const repoUrl = `/${owner}/${name}`
  const avatarUrl = `/${owner}.png`

  const repoTreeRef = typeof entity.ref === 'string' ? {value: entity.ref, label: entity.ref} : entity.ref

  const fileContextValue = React.useMemo(() => ({fileUrl: entity.url, repoUrl}), [entity.url, repoUrl])

  return (
    <Box sx={{minWidth: 0}}>
      <Header isOpen={isOpen} toggleOpen={toggleOpen}>
        <CenteredContent sx={{flex: 1, overflow: 'hidden', minWidth: 0}}>
          <GitHubAvatar src={avatarUrl} square size={20} sx={{flexShrink: 0}} />
          <EllipsisOverflow title={`${owner}/${name} · ${entity.path}`}>
            <RepositoryLink href={repoUrl}>
              {owner}/{name}
            </RepositoryLink>
            &nbsp;·&nbsp;<FileLink href={entity.url}>{entity.path}</FileLink>
          </EllipsisOverflow>
        </CenteredContent>
        <CenteredContent sx={{display: ['none', 'none', 'flex'], flexShrink: 0, marginLeft: 'auto', fontSize: 0}}>
          {props.decorations ? <>{props.decorations}&nbsp;·&nbsp;</> : null}
          {entity.language ? (
            <>
              <LangaugeBadge color={entity.language_color}>{entity.language}</LangaugeBadge>&nbsp;·&nbsp;
            </>
          ) : null}
          <RefLink href={`${repoUrl}/tree/${repoTreeRef.value}`}>{repoTreeRef.label}</RefLink>
        </CenteredContent>
      </Header>
      <fileContext.Provider value={fileContextValue}>{isOpen && <Body>{props.children}</Body>}</fileContext.Provider>
    </Box>
  )
}

function Header(props: React.PropsWithChildren<{isOpen: boolean; toggleOpen(): void}>) {
  const {isOpen, toggleOpen, children} = props

  return (
    <Box
      sx={{
        bg: 'canvas.subtle',
        pl: 2,
        pr: 3,
        py: 2,
        borderRadius: isOpen ? 'initial' : 2,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        borderColor: 'border.default',
        borderWidth: 1,
        borderStyle: 'solid',
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        height: '40px',
      }}
    >
      {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
      <IconButton
        unsafeDisableTooltip={true}
        icon={isOpen ? ChevronDownIcon : ChevronUpIcon}
        onClick={toggleOpen}
        variant="invisible"
        size="small"
        aria-label="Open code snippet"
        sx={{display: 'inline-flex'}}
      />
      {children}
    </Box>
  )
}

function Body(props: React.PropsWithChildren) {
  return (
    <Box
      sx={{
        borderColor: 'border.default',
        borderBottomWidth: 1,
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
        borderTopWidth: 0,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderStyle: 'solid',
        overflow: 'hidden',
      }}
    >
      {props.children}
    </Box>
  )
}

function RepositoryLink(props: React.PropsWithChildren<{href: string}>) {
  return (
    <Link
      href={props.href}
      data-hovercard-url={`${props.href}/hovercard`}
      sx={{color: 'fg.default', fontWeight: 'semibold', lineHeight: 1}}
      data-testid="code-link-to-repo"
    >
      {props.children}
    </Link>
  )
}

function FileLink(props: React.PropsWithChildren<{href: string}>) {
  return (
    <Link
      href={props.href}
      sx={{color: 'fg.muted', fontWeight: 'normal', lineHeight: 1}}
      data-testid="code-link-to-file"
    >
      {props.children}
    </Link>
  )
}

function LangaugeBadge(props: React.PropsWithChildren<{color?: string}>) {
  const langagueColorElement = (
    <Box
      aria-hidden
      sx={{
        display: 'inline-block',
        bg: props.color ?? 'attention.emphasis',
        borderRadius: 999,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: 'primer.border.contrast',
        width: 10,
        height: 10,
      }}
    />
  )

  return (
    <TextWithIcon icon={langagueColorElement} sx={{color: 'fg.muted'}}>
      {props.children}
    </TextWithIcon>
  )
}

function RefLink(props: React.PropsWithChildren<{href: string}>) {
  return (
    <Link href={props.href} sx={{color: 'fg.muted', font: 'var(--text-codeInline-shorthand)', lineHeight: 1}}>
      <TextWithIcon icon={<GitBranchIcon size={16} aria-hidden />} sx={{color: 'fg.muted'}}>
        {props.children}
      </TextWithIcon>
    </Link>
  )
}
