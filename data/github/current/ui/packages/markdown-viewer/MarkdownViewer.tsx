import {useCallback, useMemo, useState, type MutableRefObject} from 'react'
import {Box, Spinner} from '@primer/react'
import {type SafeHTMLProps, type SafeHTMLString, SafeHTMLBox} from '@github-ui/safe-html'

import {useLinkInterception} from '@github-ui/use-link-interception'
import {useListInteraction} from './use-list-interaction'

type CoreMarkdownViewerProps = Omit<SafeHTMLProps, 'html'> & {
  /** Show a loading spinner instead of content. */
  loading?: boolean
  /**
   * Set the rendered HTML of the viewer. To prevent XSS, ensure that the source of this
   * HTML is trusted!
   */
  verifiedHTML: SafeHTMLString
  /**
   * Called when the user clicks a link element. This can be used to intercept the click
   * and provide custom routing. Note that this is a native HTML `MouseEvent` and not a
   * `React.ClickEvent`.
   */
  onLinkClick?: (event: MouseEvent) => void
  openLinksInNewTab?: boolean
  teamHovercardsEnabled?: boolean
  /**
   * External ref for the container element.
   */
  containerRef?: MutableRefObject<HTMLElement | undefined>
}

export type InteractiveMarkdownViewerProps = CoreMarkdownViewerProps & {
  /**
   * The markdown the HTML was rendered from. This is not used for viewing, only as a source
   * for change events.
   */
  markdownValue: string
  /**
   * Called when the user interacts and updates the Markdown. The rendered Markdown is
   * updated eagerly - if the request fails, a rejected Promise should be returned by
   * this handler. In that case, the viewer will revert the visual change.
   *
   * If the change is handled by an async API request (as it typically will be in production
   * code), the viewer should be `disabled` while the request is pending to avoid conflicts.
   * To allow users to check multiple boxes rapidly, the API request should be debounced (an
   * ideal debounce duration is about 1 second).
   */
  onChange: (markdown: string) => void | Promise<void>
  /** Control whether interaction is disabled. */
  disabled?: boolean
}

type NoninteractiveMarkdownViewerProps = CoreMarkdownViewerProps & {
  // This is externally useless, but internally it lets us use unpacking to get the props.
  // If a prop was present only on one member of the type union, Typescript would treat it as
  // though it doesn't exist at all until you discriminate which type the props are.
  markdownValue?: undefined
  onChange?: undefined
  disabled?: undefined
}

export type MarkdownViewerProps = NoninteractiveMarkdownViewerProps | InteractiveMarkdownViewerProps

export const MarkdownViewer = ({
  verifiedHTML,
  loading = false,
  markdownValue = '',
  onChange: externalOnChange,
  disabled = false,
  onLinkClick,
  openLinksInNewTab = false,
  teamHovercardsEnabled = false,
  containerRef,
}: MarkdownViewerProps) => {
  // We're using state to store the HTML container because we want the value
  // to re-run effects when it changes
  const [htmlContainer, setHtmlContainer] = useState<HTMLElement | undefined>(containerRef?.current)
  const htmlContainerRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return
      // Update external container ref with the node
      if (containerRef) containerRef.current = node
      setHtmlContainer(node)
    },
    [containerRef],
  )

  const onChange = useCallback(
    async (value: string) => {
      try {
        await externalOnChange?.(value)
      } catch (error) {
        if (htmlContainer) {
          htmlContainer.innerHTML = verifiedHTML
        }
      }
    },
    [externalOnChange, htmlContainer, verifiedHTML],
  )

  useListInteraction({
    onChange,
    disabled: disabled || !externalOnChange,
    htmlContainer,
    markdownValue,
    dependencies: [verifiedHTML],
  })

  useLinkInterception({
    htmlContainer,
    onLinkClick,
    openLinksInNewTab,
  })

  return useMemo(
    () =>
      loading ? (
        <Box sx={{display: 'flex', justifyContent: 'space-around', p: 2}}>
          <Spinner aria-label="Loading content..." />
        </Box>
      ) : (
        <SafeHTMLBox
          ref={htmlContainerRef}
          className="markdown-body"
          sx={{fontSize: 1, maxWidth: '100%', '& > div > :last-child': {mb: 0}}}
          html={verifiedHTML}
          {...(teamHovercardsEnabled ? {'data-team-hovercards-enabled': true} : {})}
        />
      ),
    [htmlContainerRef, loading, teamHovercardsEnabled, verifiedHTML],
  )
}
