import {Spinner} from '@primer/react'
import {useRef} from 'react'
import {type SafeHTMLProps, type SafeHTMLString, SafeHTMLBox} from '@github-ui/safe-html'
import {TaskListItems} from '@github-ui/use-tasklist/components/TaskListItems'
import styles from './NewMarkdownViewer.module.css'
import {clsx} from 'clsx'
import {useQuerySelectorAll, useTasklistData, type TaskItem} from '@github-ui/use-tasklist'
import {useLinkInterception} from '@github-ui/use-link-interception'

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
  onConvertToIssue?: (task: TaskItem, setIsConverting: (converting: boolean) => void) => void
  openLinksInNewTab?: boolean
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
  onChange?: (markdown: string) => void | Promise<void>
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

export type NewMarkdownProps = NoninteractiveMarkdownViewerProps | InteractiveMarkdownViewerProps

export const NewMarkdownViewer = ({
  verifiedHTML,
  markdownValue = '',
  onChange: externalOnChange,
  onConvertToIssue,
  onLinkClick,
  openLinksInNewTab = false,
  loading = false,
  disabled,
}: NewMarkdownProps) => {
  const htmlContainerRef = useRef<HTMLDivElement>(null)
  const tasklists = useQuerySelectorAll(
    htmlContainerRef,
    // Select all task lists that are not nested within another task list, since
    // we recursively process nested task lists.
    '.contains-task-list:not(.contains-task-list .contains-task-list)',
  )

  const {tasklistData, nestedItems, setTasklistData} = useTasklistData(htmlContainerRef.current, tasklists)

  useLinkInterception({
    htmlContainer: htmlContainerRef.current || undefined,
    onLinkClick,
    openLinksInNewTab,
  })

  return loading ? (
    <div className={clsx(styles.spinner)}>
      <Spinner aria-label="Loading markdown content..." />
    </div>
  ) : (
    <>
      <SafeHTMLBox
        ref={htmlContainerRef}
        className={clsx('markdown-body', styles['safe-html-box'])}
        html={verifiedHTML}
      />

      {tasklists.length > 0 && (
        <TaskListItems
          tasklists={tasklists}
          markdownValue={markdownValue}
          externalOnChange={externalOnChange}
          onConvertToIssue={onConvertToIssue}
          tasklistData={tasklistData}
          setTasklistData={setTasklistData}
          nestedItems={nestedItems}
          disabled={disabled || !externalOnChange}
        />
      )}
    </>
  )
}
