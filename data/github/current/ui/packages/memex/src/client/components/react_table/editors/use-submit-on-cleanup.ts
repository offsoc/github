import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {useCallback, useRef} from 'react'

/**
 * Call a submitValue function when a component unmounts. Wraps the function with some
 * guards to ensure that it is not called on unmount if it has already been successfully
 * called before unmounting.
 *
 * The specific scenario here is ENTER should save the cell's data, and then change the focus. Since
 * changing focus will unmount the component, we want to make sure we aren't saving the data a second time.
 * Therefore, consumers of this hook should call `protectedSubmitValue` instead of their own submitValue function
 * directly.
 *
 * This hook was introduced to address https://github.com/github/memex/issues/1986
 * @param submitValue Function that should be called when the component unmounts to save the data
 * @param cleanupFn Additional optional function to be called on unmount unconditionally (e.g. clearValidationMessage)
 */
export const useSubmitOnCleanup = ({
  submitValue,
  cleanupFn,
  defaultValue,
}: {
  submitValue: (value: string) => boolean
  cleanupFn?: () => void
  defaultValue: string | number
}) => {
  const inputValueRef = useRef<string | number | null>(defaultValue)

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      inputValueRef.current = e.target.value
    },
    [inputValueRef],
  )

  const protectedSubmitValue = useCallback(() => {
    if (inputValueRef.current !== null) {
      const result = submitValue(inputValueRef.current.toString())
      inputValueRef.current = null
      return result
    }
  }, [inputValueRef, submitValue])

  const cancelSaveOnBlur = useCallback(() => {
    inputValueRef.current = null
  }, [])

  // FIXME: side effect on layout effect cleanup breaks strict mode (https://github.com/github/memex/issues/15684)
  useLayoutEffect(() => {
    return function cleanup() {
      protectedSubmitValue()
      if (cleanupFn) cleanupFn()
    }
    // We only want this cleanup function to be called when the component unmounts,
    // so we explicitly pass an empty dependency array to ensure that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {onChange, protectedSubmitValue, cancelSaveOnBlur}
}
