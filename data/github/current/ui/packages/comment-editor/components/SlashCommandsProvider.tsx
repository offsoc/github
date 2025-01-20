import {Box} from '@primer/react'
import {type DOMAttributes, type Ref, useEffect, useRef, useState, useContext, createContext, useMemo} from 'react'

import type {RepoSubject, SubjectType} from '../subject'
import {DiffIgnoredIcon} from '@primer/octicons-react'
import {MarkdownEditor} from '@github-ui/markdown-editor'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CustomElement<T> = Partial<T & DOMAttributes<T> & {children: any}>

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'slash-command-expander': CustomElement<{
        keys: string
        ref?: Ref<HTMLElement>
      }>
    }
  }
}

interface SlashCommandButtonContext {
  onInsertText: (text: string) => void
}
const SlashCommandButtonContext = createContext<SlashCommandButtonContext | null>(null)

interface SlashCommandProviderProps extends SlashCommandButtonContext {
  children: React.ReactNode
  onSave?: (...args: unknown[]) => void
  subject: RepoSubject
}

type Surface = 'issue_comment' | 'issue_body' | 'discussion' | 'pull_request'

function getSurface(subjectType: SubjectType): Surface {
  switch (subjectType) {
    case 'issue_comment':
      return 'issue_comment'
    case 'issue':
      return 'issue_body'
    case 'pull_request':
      return 'pull_request'
  }
}

// url format is
// https://github.com/:owner:/:repo:/slash_apps?subject_gid=:global_relay_id:&surface=issue_comment
const buildSlashCommandsUrl = (subject: RepoSubject) => {
  let url = `/${subject.repository.nwo}/slash_apps?surface=${getSurface(subject.type)}`
  if (subject.id) {
    url += `&subject_gid=${subject.id.id}`
  }
  return url
}

export const SlashCommandsProvider = ({children, subject, onInsertText, onSave}: SlashCommandProviderProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const expanderRef = useRef<HTMLElement>(null)

  // The slash-command-expander positions its menu using the offsets of the slash character
  // that triggered it, relative to the textarea containing that character. But because the menu
  // is position:absolute and the nearest offset parent is the Box container, it does not take
  // into account any margin around the textarea, the toolbar, etc. So we need to adjust for the
  // offset of the textarea relative to the container Box.
  const [{top, left}, setPosition] = useState({top: 0, left: 0})
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Go up through the parent tree adding offsets until we get to the container Box
    let target = container?.querySelector<HTMLElement>('textarea')
    const position = {top: 0, left: 0}
    while (target !== container) {
      if (target === null) return
      position.top += target.offsetTop
      position.left += target.offsetLeft
      target = target.offsetParent instanceof HTMLElement ? target.offsetParent : null
    }

    setPosition(position)
  }, []) // this won't recalculate if things change (ie, the window is resized so toolbar buttons wrap) but that should be a rare scenario

  useEffect(() => {
    if (!onSave) return

    const expander = expanderRef.current
    if (!expander) return

    expander.addEventListener('request-submit', onSave)

    return () => {
      expander.removeEventListener('request-submit', onSave)
    }
  }, [onSave])

  const contextValue = useMemo(() => ({onInsertText}), [onInsertText])

  return (
    <Box
      ref={containerRef}
      sx={{position: 'relative', '& .js-slash-command-menu': {mt: `${top}px`, ml: `${left}px`}}}
      className="js-slash-command-surface"
    >
      <slash-command-expander ref={expanderRef} keys="/" data-slash-command-url={buildSlashCommandsUrl(subject)}>
        <SlashCommandButtonContext.Provider value={contextValue}>{children}</SlashCommandButtonContext.Provider>
      </slash-command-expander>
    </Box>
  )
}

export const SlashCommandsButton = () => {
  const context = useContext(SlashCommandButtonContext)
  return context ? (
    <MarkdownEditor.ToolbarButton
      icon={DiffIgnoredIcon}
      aria-label="Insert slash-command"
      onClick={() => context.onInsertText('/')}
    />
  ) : null
}
