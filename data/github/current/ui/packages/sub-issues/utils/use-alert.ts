import {useCallback, useState} from 'react'

// These values should be in sync with the server-side values found in packages/hierarchy/app/models/sub_issue.rb
const MAX_BREADTH = 50
const MAX_HEIGHT = 7

export function useAlert() {
  const [alert, setAlert] = useState<{title: string; body: string} | null>(null)

  const resetAlert = useCallback(() => setAlert(null), [])

  const showBreadthLimitAlert = useCallback(
    () =>
      setAlert({
        title: 'Sub-issue limit reached',
        body: `Parents have a limit of ${MAX_BREADTH} sub-issues. To add more, an existing one must be removed.`,
      }),

    [],
  )

  const showDepthLimitAlert = useCallback(
    () =>
      setAlert({
        title: 'Sub-issue limit reached',
        body: `You can’t add more than ${MAX_HEIGHT} layers of sub-issues. To add a sub-issue, remove a parent issue at any level.`,
      }),

    [],
  )

  const showCircularDependencyAlert = useCallback(
    () =>
      setAlert({
        title: 'Sub-issue circular dependency',
        body: `A parent may not be a sub-issue of itself. To add it as a sub-issue, remove it as a parent in the tree.`,
      }),

    [],
  )

  const showDuplicateSubIssueAlert = useCallback(() => {
    setAlert({
      title: 'Duplicate sub-issue',
      body: `A parent may not have duplicate sub-issues.`,
    })
  }, [])

  const showServerAlert = useCallback(
    (error: Error) => {
      if (error.message.includes(`Parent cannot have more than ${MAX_BREADTH} sub-issues`)) {
        showBreadthLimitAlert()
        return true
      }

      if (error.message.includes(`You can’t add more than ${MAX_HEIGHT} layers of sub-issues`)) {
        showDepthLimitAlert()
        return true
      }

      if (
        error.message.includes('Sub issue may not create a circular dependency') ||
        error.message.includes('Sub issue cannot be the same as the parent issue')
      ) {
        showCircularDependencyAlert()
        return true
      }

      if (error.message.includes('Issue may not contain duplicate sub-issues')) {
        showDuplicateSubIssueAlert()
        return true
      }

      return false
    },
    [showBreadthLimitAlert, showCircularDependencyAlert, showDepthLimitAlert, showDuplicateSubIssueAlert],
  )

  return {alert, setAlert, resetAlert, showBreadthLimitAlert, showServerAlert}
}
