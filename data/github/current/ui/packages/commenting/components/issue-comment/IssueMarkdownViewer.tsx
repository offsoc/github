import {debounce} from '@github/mini-throttle'
import {MarkdownViewer} from '@github-ui/markdown-viewer'
import {type InteractiveMarkdownViewerProps, NewMarkdownViewer} from '@github-ui/markdown-viewer/NewMarkdownViewer'
import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'
import type {SafeHTMLString} from '@github-ui/safe-html'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {Text} from '@primer/react'
import React, {useCallback, useMemo, useRef} from 'react'

import {LABELS} from '../../constants/labels'
import {TEST_IDS} from '../../constants/test-ids'

type IssueMarkdownViewerProps = {
  html: SafeHTMLString
  markdown: string
  viewerCanUpdate: boolean
  dataTestId?: string
  onSave: (newBody: string, onCompleted: () => void, onError: () => void) => void
  /**
   * Called when the user clicks a link element. This can be used to intercept the click
   * and provide custom routing.
   *
   * Note that this is a native HTML `MouseEvent` and not a `React.ClickEvent`.
   */
  onLinkClick?: (event: MouseEvent) => void
  onConvertToIssue?: InteractiveMarkdownViewerProps['onConvertToIssue']
}

export const IssueMarkdownViewer = ({
  html,
  markdown,
  viewerCanUpdate,
  onSave,
  onLinkClick,
  dataTestId = TEST_IDS.markdownBody,
  onConvertToIssue,
}: IssueMarkdownViewerProps) => {
  const {addToast} = useToastContext()
  const [isSaving, setIsSaving] = React.useState(false)
  const {issues_react_checklist_improvements} = useFeatureFlags()

  const finishEditing = useCallback(
    (onSuccess: () => void, onError: () => void, error?: string) => {
      setIsSaving(false)
      if (error) {
        onError()

        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: error,
        })
      } else {
        onSuccess()
      }
    },
    [addToast],
  )

  const onPerformChange = useCallback(
    (body: string) => {
      const promise = new Promise<void>((resolve, reject) => {
        setIsSaving(true)
        onSave(
          body,
          () => finishEditing(resolve, reject),
          () => finishEditing(resolve, reject, 'Could not update issue comment'),
        )
      })

      return promise
    },
    [finishEditing, onSave],
  )

  // useRef is used here to make sure we don't call onPerformChange with an outdated function
  // in case the issue has changed for example in between
  const onPerformChangeRef = useRef(onPerformChange)
  useLayoutEffect(() => {
    onPerformChangeRef.current = onPerformChange
  }, [onPerformChange])

  const onChange = useMemo(() => debounce((nextValue: string) => onPerformChangeRef.current(nextValue), 500), [])

  const disabled = !viewerCanUpdate || isSaving

  const innerBody: JSX.Element = useMemo(() => {
    if (html && html.length > 0) {
      return (
        <>
          {issues_react_checklist_improvements ? (
            <NewMarkdownViewer
              disabled={!viewerCanUpdate || isSaving}
              verifiedHTML={html}
              markdownValue={markdown}
              onChange={onChange}
              onConvertToIssue={onConvertToIssue}
              onLinkClick={onLinkClick}
            />
          ) : (
            <MarkdownViewer
              disabled={disabled}
              verifiedHTML={html}
              markdownValue={markdown}
              onChange={onChange}
              onLinkClick={onLinkClick}
              teamHovercardsEnabled={true}
            />
          )}
        </>
      )
    } else {
      return (
        <Text sx={{color: 'fg.muted', m: 0, fontStyle: 'italic', fontSize: 1}}>{LABELS.noDescriptionProvided}</Text>
      )
    }
  }, [
    disabled,
    html,
    isSaving,
    issues_react_checklist_improvements,
    markdown,
    onChange,
    onConvertToIssue,
    onLinkClick,
    viewerCanUpdate,
  ])

  return (
    <div
      data-testid={dataTestId}
      className="markdown-body"
      // Make links from project -> project hard navigate if the user chooses to open in same tab
      // https://github.com/github/memex/issues/9202#issuecomment-1085941126
      data-turbolinks="false"
    >
      {innerBody}
    </div>
  )
}
