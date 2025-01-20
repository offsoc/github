import {useEffect, useState} from 'react'
import {useSearchParams} from 'react-router-dom'

export const useFocusedTask = () => {
  const [searchParams] = useSearchParams()

  const searchParamDiffView = searchParams.get('view')
  const focusedTask = searchParams.get('pull_request_review_comment_id')

  const [initialDiffState, setInitialDiffState] = useState(!!focusedTask)

  useEffect(() => {
    /** if the task is focused and the view was originally not a diff view,
     * but has since changed, disable the initial state.
     * if the view was a diff view anyway, we can also disable the initial state
     * as the values are the same.
     * if we have changed the view, we are not in our initial state and we do nothing
     */
    if (initialDiffState && searchParamDiffView?.startsWith('diff')) setInitialDiffState(false)
  }, [initialDiffState, searchParamDiffView])

  return {initialDiffState, focusedTask}
}
